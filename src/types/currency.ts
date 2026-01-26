/**
 * Frontend-specific types
 */

/**
 * Direction for currency conversion in the UI
 */
export type ConversionDirection = 'usdToUyu' | 'uyuToUsd';

/**
 * Simplified exchange rate for UI display (without currency field)
 */
export interface ExchangeRateDisplay {
  buy: number;
  sell: number;
  average: number;
  scrapedAt: string;
}
