import * as Sentry from "@sentry/vue";
import '@fontsource-variable/inter'
import './assets/main.css'

import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://30bc01019d104d0391784776a65ba2f0@o313399.ingest.us.sentry.io/1784872",

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 3,
        refetchOnWindowFocus: true
      }
    }
  }
})

app.mount('#app')
