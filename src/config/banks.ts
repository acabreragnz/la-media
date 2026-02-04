export interface BankConfig {
  id: string
  name: string
  displayName: string
  logoUrl: string
  headerLogoUrl?: string // Logo alternativo para el header (ej: BROU usa logo de La Media)
  websiteUrl: string
  route: string
  comingSoon?: boolean // Flag para indicar que el banco está "próximamente"
  // Colores eliminados - ahora viven en CSS variables (main.css)
  // Acceso vía: var(--bank-accent), var(--bank-accent-rgb), etc.
}

export const BANKS: Record<string, BankConfig> = {
  brou: {
    id: 'brou',
    name: 'BROU',
    displayName: 'BROU',
    logoUrl: '/assets/banks/brou.webp',
    headerLogoUrl: '/assets/brand/logo-short.webp',
    websiteUrl: 'https://www.brou.com.uy/cotizaciones',
    route: '/brou',
  },
  itau: {
    id: 'itau',
    name: 'Itaú',
    displayName: 'Itaú',
    logoUrl: '/assets/banks/itau.svg',
    headerLogoUrl: '/assets/brand/logo-short.webp',
    websiteUrl: 'https://www.itau.com.uy/inst/aci/cotiz.xml',
    route: '/itau',
  },
  santander: {
    id: 'santander',
    name: 'Santander',
    displayName: 'Santander',
    logoUrl: 'https://cdn.brandfetch.io/idWPmUE5JO/w/399/h/399/theme/dark/icon.jpeg',
    headerLogoUrl: '/assets/brand/logo-short.webp',
    websiteUrl: 'https://www.santander.com.uy',
    route: '/santander',
    comingSoon: true,
  },
  bbva: {
    id: 'bbva',
    name: 'BBVA',
    displayName: 'BBVA',
    logoUrl: 'https://cdn.brandfetch.io/idQW_ZOF8l/w/400/h/400/theme/dark/icon.png',
    headerLogoUrl: '/assets/brand/logo-short.webp',
    websiteUrl: 'https://www.bbva.com.uy',
    route: '/bbva',
    comingSoon: true,
  },
  bcu: {
    id: 'bcu',
    name: 'BCU',
    displayName: 'BCU',
    logoUrl: '/assets/banks/bcu.svg',
    headerLogoUrl: '/assets/brand/logo-short.webp',
    websiteUrl: 'https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Cotizaciones.aspx',
    route: '/bcu',
    comingSoon: true, // Temporalmente deshabilitado - requiere más pruebas
  },
}

export const BANKS_ARRAY = Object.values(BANKS)
