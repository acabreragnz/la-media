/**
 * Configuración de colores por banco (solo para uso en JS cuando se necesita)
 * Para uso en CSS, usar las variables CSS en main.css: var(--bank-accent), etc.
 *
 * Este archivo solo existe para casos donde necesitas colores en JS (ej: HomeView
 * que itera sobre múltiples bancos y necesita generar inline styles)
 */

export const BANK_COLORS = {
  brou: {
    accent: { r: 255, g: 203, b: 5 }  // #FFCB05
  },
  itau: {
    accent: { r: 255, g: 85, b: 0 }   // #ff5500
  },
  santander: {
    accent: { r: 234, g: 29, b: 37 }  // #ea1d25
  },
  bbva: {
    accent: { r: 20, g: 100, b: 165 } // #1464a5
  },
  bcu: {
    accent: { r: 212, g: 148, b: 28 } // #D4941C (dorado BCU)
  }
} as const

export type BankId = keyof typeof BANK_COLORS

/**
 * Convierte RGB a rgba() con opacidad
 */
export function rgbaFromBank(bankId: BankId, opacity: number): string {
  const { r, g, b } = BANK_COLORS[bankId].accent
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Obtiene el color hex del acento de un banco
 */
export function getAccentColor(bankId: BankId): string {
  const { r, g, b } = BANK_COLORS[bankId].accent
  return `rgb(${r}, ${g}, ${b})`
}
