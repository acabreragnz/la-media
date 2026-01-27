import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { BankId } from '@/utils/bank-colors'

import HomeView from './views/HomeView.vue'
import BankView from './views/BankView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/brou',
    name: 'brou',
    component: BankView,
    props: { bankId: 'brou' as BankId }
  },
  {
    path: '/itau',
    name: 'itau',
    component: BankView,
    props: { bankId: 'itau' as BankId }
  },
  {
    path: '/santander',
    name: 'santander',
    component: BankView,
    props: { bankId: 'santander' as BankId }
  },
  {
    path: '/bbva',
    name: 'bbva',
    component: BankView,
    props: { bankId: 'bbva' as BankId }
  },
  {
    path: '/bcu',
    name: 'bcu',
    component: BankView,
    props: { bankId: 'bcu' as BankId }
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
