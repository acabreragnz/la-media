/**
 * Shared types between frontend and backend
 */

/**
 * Base exchange rate data returned by scrapers
 */
export interface ExchangeRate {
  average: number;
  buy: number;
  sell: number;
  currency: string;
}

/**
 * Metadata for exchange rate records
 */
export interface RateMetadata {
  /** ISO timestamp when data was scraped */
  scrapedAt: string;
  /** ISO timestamp for next scheduled run (null if not scheduled) */
  nextRunAt: string | null;
  /** Source of the data */
  source: 'scheduled' | 'fallback' | 'manual';
}

/**
 * Exchange rate with metadata (stored in Blobs and returned by API)
 */
export interface ExchangeRateRecord extends ExchangeRate {
  metadata: RateMetadata;
}

/**
 * Currency code constant
 */
export const USD_CURRENCY = 'USD';
