export interface BankConfig {
  id: string
  name: string
  displayName: string
  logoUrl: string
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
    displayName: 'La Media BROU',
    logoUrl: '/brou-logo.webp',
    websiteUrl: 'https://www.brou.com.uy/cotizaciones',
    route: '/brou'
  },
  itau: {
    id: 'itau',
    name: 'Itaú',
    displayName: 'La Media Itaú',
    logoUrl: '/itau-logo.svg',
    websiteUrl: 'https://www.itau.com.uy/inst/aci/cotiz.xml',
    route: '/itau'
  },
  santander: {
    id: 'santander',
    name: 'Santander',
    displayName: 'La Media Santander',
    logoUrl: 'https://cdn.brandfetch.io/idWPmUE5JO/w/399/h/399/theme/dark/icon.jpeg',
    websiteUrl: 'https://www.santander.com.uy',
    route: '/santander',
    comingSoon: true
  },
  bbva: {
    id: 'bbva',
    name: 'BBVA',
    displayName: 'La Media BBVA',
    logoUrl: 'https://cdn.brandfetch.io/idQW_ZOF8l/w/400/h/400/theme/dark/icon.png',
    websiteUrl: 'https://www.bbva.com.uy',
    route: '/bbva',
    comingSoon: true
  },
  bcu: {
    id: 'bcu',
    name: 'BCU',
    displayName: 'La Media BCU',
    logoUrl: '/bcu-logo.svg',
    websiteUrl: 'https://www.bcu.gub.uy',
    route: '/bcu',
    comingSoon: true
  }
}

export const BANKS_ARRAY = Object.values(BANKS)
