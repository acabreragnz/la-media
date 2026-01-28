import { useBrouCurrency } from './useBrouCurrency'
import { useItauCurrency } from './useItauCurrency'
import type { BankId } from '@/types/banks'

/**
 * Bank-to-composable mapping
 * Centralized registry for bank selection logic
 */
const BANK_COMPOSABLE_MAP: Record<BankId, () => ReturnType<typeof useBrouCurrency>> = {
  brou: useBrouCurrency,
  itau: useItauCurrency,

  // Fallback for "coming soon" banks (dev mode only)
  santander: useBrouCurrency, // Uses BROU data
  bbva: useItauCurrency, // Uses Itaú data
  bcu: useBrouCurrency, // Uses BROU data
}

/**
 * Bank-aware currency composable selector
 * @param bankId - The bank identifier
 * @returns Currency composable instance
 */
export function useBankCurrency(bankId: BankId) {
  const composableFactory = BANK_COMPOSABLE_MAP[bankId]

  if (!composableFactory) {
    throw new Error(`No currency composable configured for bank: ${bankId}`)
  }

  return composableFactory()
}
