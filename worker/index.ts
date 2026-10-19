const API_PREFIX = '/api/football'
const UPSTREAM_URL = 'https://api.football-data.org/v4'

// Longer than the client-side TTLs on purpose: the free KV tier allows only 1000 writes a day,
// and the free football-data tier serves delayed scores anyway.
const SHORT_TTL = 10 * 60
const LONG_TTL = 6 * 60 * 60

// Entries outlive their freshness so a stale copy can be served when the upstream fails or
// rate-limits — the 10 requests/minute quota is shared by every visitor.
const STALE_TTL = 24 * 60 * 60

// Only what the client needs: X-RequestCounter-Reset feeds the "retry in N s" message on 429.
const FORWARDED_HEADERS = ['Content-Type', 'X-RequestCounter-Reset']

type CacheStatus = 'HIT' | 'MISS' | 'STALE' | 'BYPASS'

interface CacheMetadata {
  storedAt: number
}

function getTtlSeconds(path: string): number {
  return /\/(matches|standings)$/.test(path) ? SHORT_TTL : LONG_TTL
}

function jsonResponse(body: string, cache: CacheStatus): Response {
  return new Response(body, {
    headers: { 'Content-Type': 'application/json', 'X-Cache': cache },
  })
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url)

    if (!url.pathname.startsWith(`${API_PREFIX}/`)) {
      return new Response('Not found', { status: 404 })
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } })
    }

    const path = url.pathname.slice(API_PREFIX.length)
    const key = `${path}${url.search}`
    const ttlMs = getTtlSeconds(path) * 1000
    const startedAt = Date.now()
    const log = (status: number, cache: CacheStatus) =>
      console.log({ path: key, status, cache, durationMs: Date.now() - startedAt })

    const cached = await env.CACHE.getWithMetadata<CacheMetadata>(key)
    if (cached.value !== null && cached.metadata && startedAt - cached.metadata.storedAt < ttlMs) {
      log(200, 'HIT')
      return jsonResponse(cached.value, 'HIT')
    }

    let upstream: Response
    try {
      upstream = await fetch(`${UPSTREAM_URL}${key}`, {
        headers: { 'X-Auth-Token': env.FOOTBALL_API_KEY },
      })
    } catch (error) {
      console.error({ path: key, error: String(error) })
      if (cached.value !== null) {
        log(200, 'STALE')
        return jsonResponse(cached.value, 'STALE')
      }
      log(502, 'BYPASS')
      return new Response('Upstream unavailable', { status: 502 })
    }

    if (upstream.ok) {
      const body = await upstream.text()
      ctx.waitUntil(
        env.CACHE.put(key, body, {
          expirationTtl: STALE_TTL,
          metadata: { storedAt: Date.now() } satisfies CacheMetadata,
        }).catch((error: unknown) => {
          console.error({ path: key, error: `KV put failed: ${String(error)}` })
        }),
      )
      log(upstream.status, 'MISS')
      return jsonResponse(body, 'MISS')
    }

    if (cached.value !== null) {
      log(upstream.status, 'STALE')
      return jsonResponse(cached.value, 'STALE')
    }

    log(upstream.status, 'BYPASS')
    const headers = new Headers({ 'X-Cache': 'BYPASS' })
    for (const name of FORWARDED_HEADERS) {
      const value = upstream.headers.get(name)
      if (value) headers.set(name, value)
    }
    return new Response(upstream.body, { status: upstream.status, headers })
  },
} satisfies ExportedHandler<Env>
