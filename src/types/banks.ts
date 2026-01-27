/**
 * Bank identifier union type
 * This is the canonical frontend type definition
 * Must match backend definition in netlify/functions/utils/scraper-registry.mts
 */
export type BankId = 'brou' | 'itau' | 'santander' | 'bbva' | 'bcu'

/**
 * Type guard to check if a string is a valid BankId
 */
export function isBankId(value: string): value is BankId {
  return ['brou', 'itau', 'santander', 'bbva', 'bcu'].includes(value)
}
