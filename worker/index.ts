const API_PREFIX = '/api/football'
const UPSTREAM_URL = 'https://api.football-data.org/v4'

// Only what the client needs: X-RequestCounter-Reset feeds the "retry in N s" message on 429.
const FORWARDED_HEADERS = ['Content-Type', 'X-RequestCounter-Reset']

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    if (!url.pathname.startsWith(`${API_PREFIX}/`)) {
      return new Response('Not found', { status: 404 })
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } })
    }

    const path = url.pathname.slice(API_PREFIX.length)
    const startedAt = Date.now()

    let upstream: Response
    try {
      upstream = await fetch(`${UPSTREAM_URL}${path}${url.search}`, {
        headers: { 'X-Auth-Token': env.FOOTBALL_API_KEY },
      })
    } catch (error) {
      console.error({ path, error: String(error), durationMs: Date.now() - startedAt })
      return new Response('Upstream unavailable', { status: 502 })
    }

    console.log({ path, status: upstream.status, durationMs: Date.now() - startedAt })

    const headers = new Headers()
    for (const name of FORWARDED_HEADERS) {
      const value = upstream.headers.get(name)
      if (value) headers.set(name, value)
    }

    return new Response(upstream.body, { status: upstream.status, headers })
  },
} satisfies ExportedHandler<Env>
