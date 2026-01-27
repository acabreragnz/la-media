import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './views/HomeView.vue'
import BankView from './views/BankView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/brou',
    name: 'brou',
    component: BankView,
    props: { bankId: 'brou' }
  },
  {
    path: '/itau',
    name: 'itau',
    component: BankView,
    props: { bankId: 'itau' }
  },
  {
    path: '/santander',
    name: 'santander',
    component: BankView,
    props: { bankId: 'santander' }
  },
  {
    path: '/bbva',
    name: 'bbva',
    component: BankView,
    props: { bankId: 'bbva' }
  },
  {
    path: '/bcu',
    name: 'bcu',
    component: BankView,
    props: { bankId: 'bcu' }
  },
  // Catch-all
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
