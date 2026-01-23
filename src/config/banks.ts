export interface BankConfig {
  code: string
  name: string
  fullName: string
  logo: string
  url: string
  currencyLabel: string
  colors: {
    primary: string
    primaryLight: string
    accent: string
    gradientFrom: string
    gradientTo: string
  }
}

export const banks = {
  brou: {
    code: 'brou',
    name: 'BROU',
    fullName: 'Banco de la República Oriental del Uruguay',
    logo: '/brou-logo.webp',
    url: 'https://www.brou.com.uy/cotizaciones',
    currencyLabel: 'Dólar eBROU',
    colors: {
      primary: '#005ca8',
      primaryLight: '#0b64a0',
      accent: '#FFCB05',
      gradientFrom: '#08528D',
      gradientTo: '#0d2744',
    },
  },
  itau: {
    code: 'itau',
    name: 'Itaú',
    fullName: 'Itaú Uruguay',
    logo: '/itau-logo.svg',
    url: 'https://www.itau.com.uy',
    currencyLabel: 'Dólar Itaú',
    colors: {
      primary: '#EC7000',
      primaryLight: '#FF8C1A',
      accent: '#003399',
      gradientFrom: '#EC7000',
      gradientTo: '#1a1a2e',
    },
  },
  santander: {
    code: 'santander',
    name: 'Santander',
    fullName: 'Santander Uruguay',
    logo: '/santander-logo.svg',
    url: 'https://www.santander.com.uy',
    currencyLabel: 'Dólar Santander',
    colors: {
      primary: '#EC0000',
      primaryLight: '#FF1A1A',
      accent: '#FFFFFF',
      gradientFrom: '#EC0000',
      gradientTo: '#1a1a2e',
    },
  },
} as const satisfies Record<string, BankConfig>

export type BankCode = keyof typeof banks
export const bankList = Object.values(banks)
export const defaultBank = banks.brou
