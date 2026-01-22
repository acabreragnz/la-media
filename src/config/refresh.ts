/**
 * Configuración centralizada para el sistema de auto-refresh
 */

// ============= CONFIGURACIÓN PRINCIPAL =============

/**
 * Intervalo de actualización en minutos
 *
 * ⚠️ RESTRICCIÓN: Debe ser un divisor de 60 para que los slots caigan en minutos exactos
 *
 * Valores válidos: 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60
 * Valores inválidos: 7, 8, 9, 11, 13, 14, 16-19, 21-29, 31-59
 *
 * Ejemplos:
 * - 15 minutos → slots: [0, 15, 30, 45]
 * - 10 minutos → slots: [0, 10, 20, 30, 40, 50]
 * - 30 minutos → slots: [0, 30]
 *
 * ⚠️ IMPORTANTE: Si cambias este valor, debes actualizar manualmente:
 * - netlify/functions/update-brou-rates.mts (export const config.schedule)
 *
 * ℹ️ HORARIO: La función scheduled corre lunes a viernes, 8-19h Uruguay (UTC-3)
 */
export const REFRESH_INTERVAL_MINUTES = 15

/**
 * Delay en segundos después del slot del backend antes de que el frontend haga fetch
 * Frontend hace fetch exactamente 1 minuto después de cada slot del backend
 * Esto da tiempo al backend para scraper, actualizar Netlify Blobs, y que se propague a edges
 */
export const REFRESH_DELAY_SECONDS = 60

// ============= FUNCIONES AUXILIARES =============

/**
 * Genera los slots de refresh basados en el intervalo
 * Ejemplo: generateRefreshSlots(15) => [0, 15, 30, 45]
 * Ejemplo: generateRefreshSlots(10) => [0, 10, 20, 30, 40, 50]
 */
export function generateRefreshSlots(intervalMinutes: number): number[] {
  // Validación: 60 debe ser divisible por el intervalo
  if (60 % intervalMinutes !== 0) {
    throw new Error(
      `Invalid refresh interval: ${intervalMinutes}. ` +
      `Must be a divisor of 60 (valid: 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60)`
    )
  }

  const slots: number[] = []
  for (let minute = 0; minute < 60; minute += intervalMinutes) {
    slots.push(minute)
  }

  return slots
}

// ============= EXPORTS CALCULADOS =============

/**
 * Slots de refresh calculados automáticamente
 * Usado por frontend para calcular próximo slot
 */
export const REFRESH_SLOTS = generateRefreshSlots(REFRESH_INTERVAL_MINUTES)
