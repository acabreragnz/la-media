import { scrapeBrouRates } from './brou-scraper.mts'
import { scrapeItauRates } from './itau-scraper.mts'
import { scrapeBcuRates } from './bcu-scraper.mts'
import type { ExchangeRate } from '../../../shared/types/exchange-rates.mts'

export type BankId = 'brou' | 'itau' | 'santander' | 'bbva' | 'bcu'

/**
 * Registry of bank scrapers
 */
export const BANK_SCRAPER_MAP: Record<BankId, () => Promise<ExchangeRate>> = {
  brou: scrapeBrouRates,
  itau: scrapeItauRates,
  bcu: scrapeBcuRates,
  santander: async () => { throw new Error('Santander scraper not implemented') },
  bbva: async () => { throw new Error('BBVA scraper not implemented') },
}

/**
 * Blobs key naming: `{bankId}-latest`
 */
export function getBlobsKey(bankId: BankId): string {
  return `${bankId}-latest`
}

/**
 * Active banks (with implemented scrapers)
 */
export function getActiveBanks(): BankId[] {
  return ['brou', 'itau', 'bcu']
}
