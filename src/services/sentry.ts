// Named imports only: this module is loaded via dynamic import, and importing the whole
// namespace there would defeat tree-shaking and pull in replay, feedback and tracing.
export { captureException, init } from '@sentry/vue'
