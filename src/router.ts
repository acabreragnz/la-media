import { createRouter, createWebHistory } from 'vue-router'

import BrouView from './views/BrouView.vue'
import ItauView from './views/ItauView.vue'

const routes = [
  { path: '/', redirect: { name: 'brou' } },
  { name: 'brou', path: '/brou', component: BrouView },
  { name: 'itau', path: '/itau', component: ItauView },
  // catch all
  { path: '/:pathMatch(.*)*', redirect: { name: 'brou' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
