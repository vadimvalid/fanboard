import type { App } from 'vue'
import { FootballApiError } from '@/services/footballApi'

type SentryModule = typeof import('@/services/sentry')

let sentry: SentryModule | null = null

export function initMonitoring(app: App) {
  if (!import.meta.env.PROD) return

  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (dsn) {
    // Loaded lazily: the SDK is ~40 kB gzipped, two thirds of the app itself, and must not
    // delay the first render. Errors thrown before it arrives are not reported.
    import('@/services/sentry')
      .then((module) => {
        module.init({
          app,
          dsn,
          release: import.meta.env.VITE_RELEASE,
          environment: 'production',
          // Errors only: tracing would burn the free-tier quota without a clear need yet.
          tracesSampleRate: 0,
          attachProps: false,
        })
        sentry = module
      })
      .catch(() => {})
  }

  const beaconToken = import.meta.env.VITE_CF_BEACON_TOKEN
  if (beaconToken) {
    const script = document.createElement('script')
    script.defer = true
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.dataset.cfBeacon = JSON.stringify({ token: beaconToken })
    document.head.append(script)
  }
}

// 429/403/404 and offline (status 0) are expected API outcomes the UI already explains;
// only server failures and unexpected exceptions point to a bug worth an alert.
export function reportError(error: unknown) {
  if (error instanceof FootballApiError && error.status < 500) return
  sentry?.captureException(error)
}
