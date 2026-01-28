export const ROUTES = {
  HOME: '/',
  BROU: '/brou',
  ITAU: '/itau'
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteValue = (typeof ROUTES)[RouteKey]
