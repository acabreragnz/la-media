import '@fontsource-variable/inter'
import './assets/main.css'

import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { initPostHog } from '@/lib/posthog'
import { initSentry } from '@/lib/sentry'
import App from './App.vue'
import { router } from './router.ts'

const app = createApp(App)

// Inicializar servicios de monitoreo
initSentry(app)
initPostHog()

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 3,
        refetchOnWindowFocus: true,
      },
    },
  },
})

app.use(router)

app.mount('#app')
