import type { ConversionDirection } from '@/types/currency'
import type { ExchangeRateRecord } from '@shared/types/exchange-rates.mts'
import { formatNumber, formatTimestamp } from './formatters'

export interface ConversionShareData {
  inputAmount: number | null
  convertedAmount: number
  direction: ConversionDirection
  rates: ExchangeRateRecord
  bankName: string
}

/**
 * Formats exchange rates information (DRY helper)
 */
function formatRatesInfo(rates: ExchangeRateRecord): string {
  return (
    `📊 Tipos de cambio:\n` +
    `Compra: $${formatNumber(rates.buy)}\n` +
    `Venta: $${formatNumber(rates.sell)}\n` +
    `Media: $${formatNumber(rates.average)}\n` +
    `🕒 Cotización del: ${formatTimestamp(rates.metadata.scrapedAt)}`
  )
}

/**
 * Opens WhatsApp with pre-filled conversion message
 * Returns false if data is invalid, true otherwise
 */
export function shareConversionViaWhatsApp(data: ConversionShareData): boolean {
  // Validation
  if (!data.rates) {
    return false
  }

  const appUrl = window.location.origin
  const ratesInfo = formatRatesInfo(data.rates)

  let message: string

  if (data.inputAmount) {
    // Include conversion details
    const fromCurrency = data.direction === 'usdToUyu' ? 'Dólares' : 'Pesos'
    const toCurrency = data.direction === 'usdToUyu' ? 'Pesos' : 'Dólares'

    message =
      `Media ${data.bankName} - Conversión\n\n` +
      `${formatNumber(data.inputAmount)} ${fromCurrency} = ${formatNumber(data.convertedAmount)} ${toCurrency}\n\n` +
      `${ratesInfo}\n\n` +
      `🔗 ${appUrl}`
  } else {
    // Rates only
    message = `Media ${data.bankName} - Cotización\n\n` + `${ratesInfo}\n\n` + `🔗 ${appUrl}`
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')

  return true
}
