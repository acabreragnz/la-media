import posthog from 'posthog-js'

let initialized = false

export function initPostHog(): void {
  if (initialized) return

  // Solo trackear en producción (no en localhost/desarrollo)
  if (!import.meta.env.PROD) {
    console.log('[PostHog] Tracking disabled in development')
    return
  }

  posthog.init('phc_7uCTc3hKCCTuPm8GFceKNE7seQFGlpPnDyItJMeGdaQ', {
    api_host: 'https://us.i.posthog.com',
    autocapture: true, // Trackea clicks automáticamente
    capture_pageview: true, // Trackea pageviews
    capture_pageleave: true, // Trackea cuando el usuario sale
    __add_tracing_headers: ['la-media.tonicabrera.dev', 'media-brou.tonicabrera.dev'],

    // Session Replay: habilitado con configuraciones de privacidad
    // El sampling rate (ej: 20%) se configura en PostHog UI → Project Settings → Replay
    disable_session_recording: false,
    session_recording: {
      recordCrossOriginIframes: false, // No grabar iframes externos
      maskAllInputs: true, // Enmascarar valores ingresados (privacidad del usuario)
      maskTextSelector: '[data-sensitive]', // Enmascarar elementos sensibles
    },
  })

  initialized = true
  console.log('[PostHog] Analytics tracking enabled (production mode)')
}

// Exportar la instancia de posthog para uso manual si es necesario
export { posthog }
