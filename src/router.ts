import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { BankId } from '@/types/banks'

import HomeView from './views/HomeView.vue'
import BankView from './views/BankView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/brou',
    name: 'brou',
    component: BankView,
    props: { bankId: 'brou' as BankId },
    meta: { title: 'La Media - Cotización BROU (No Oficial)' },
  },
  {
    path: '/itau',
    name: 'itau',
    component: BankView,
    props: { bankId: 'itau' as BankId },
    meta: { title: 'La Media - Cotización Itaú (No Oficial)' },
  },
  {
    path: '/santander',
    name: 'santander',
    component: BankView,
    props: { bankId: 'santander' as BankId },
    meta: { title: 'La Media - Cotización Santander (No Oficial)' },
  },
  {
    path: '/bbva',
    name: 'bbva',
    component: BankView,
    props: { bankId: 'bbva' as BankId },
    meta: { title: 'La Media - Cotización BBVA (No Oficial)' },
  },
  {
    path: '/bcu',
    name: 'bcu',
    component: BankView,
    props: { bankId: 'bcu' as BankId },
    meta: { title: 'La Media - Cotización BCU (No Oficial)' },
  },
  // Catch-all
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Update document.title based on route meta
router.beforeEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = title
  } else {
    document.title = 'La Media - Cotizaciones USD/UYU de Múltiples Bancos'
  }
})

export { router }
