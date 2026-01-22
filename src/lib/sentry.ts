import * as Sentry from '@sentry/vue'
import type { App } from 'vue'

export function initSentry(app: App): void {
  // Solo trackear errores en producción (no en localhost/desarrollo)
  if (!import.meta.env.PROD) {
    console.log('[Sentry] Error tracking disabled in development')
    return
  }

  Sentry.init({
    app,
    dsn: 'https://30bc01019d104d0391784776a65ba2f0@o313399.ingest.us.sentry.io/1784872',
    environment: import.meta.env.MODE, // 'production', 'development', etc.

    // Adds request headers and IP for users
    sendDefaultPii: true,

    // Configuración adicional recomendada para producción
    tracesSampleRate: 1.0, // 100% de las transacciones (ajustar si hay mucho tráfico)
    replaysOnErrorSampleRate: 1.0, // Captura replay cuando hay error
    replaysSessionSampleRate: 0.1, // Captura 10% de sesiones normales
  })

  console.log('[Sentry] Error tracking enabled (production mode)')
}
