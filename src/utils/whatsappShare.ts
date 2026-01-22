import type { ExchangeRates, ConversionDirection } from '@/types/currency'
import { formatNumber, formatTimestamp } from './formatters'

export interface ConversionShareData {
  inputAmount: number | null
  convertedAmount: number
  direction: ConversionDirection
  rates: ExchangeRates
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

  let message: string

  // Obtener URL de la aplicación (funciona en dev y production)
  const appUrl = window.location.origin

  // Si hay un monto, incluir la conversión
  if (data.inputAmount) {
    const fromCurrency = data.direction === 'usdToUyu' ? 'Dólares' : 'Pesos'
    const toCurrency = data.direction === 'usdToUyu' ? 'Pesos' : 'Dólares'

    message = `Media BROU - Conversión\n\n` +
      `${formatNumber(data.inputAmount)} ${fromCurrency} = ${formatNumber(data.convertedAmount)} ${toCurrency}\n\n` +
      `📊 Cotización BROU:\n` +
      `Compra: $${formatNumber(data.rates.compra)}\n` +
      `Venta: $${formatNumber(data.rates.venta)}\n` +
      `Media: $${formatNumber(data.rates.media)}\n` +
      `🕒 Cotización del: ${formatTimestamp(data.rates.scraped_at)}\n\n` +
      `🔗 ${appUrl}`
  } else {
    // Si no hay monto, solo compartir las cotizaciones
    message = `Media BROU - Cotización\n\n` +
      `📊 Tipos de cambio:\n` +
      `Compra: $${formatNumber(data.rates.compra)}\n` +
      `Venta: $${formatNumber(data.rates.venta)}\n` +
      `Media: $${formatNumber(data.rates.media)}\n` +
      `🕒 Cotización del: ${formatTimestamp(data.rates.scraped_at)}\n\n` +
      `🔗 ${appUrl}`
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')

  return true
}
