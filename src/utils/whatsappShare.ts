import type { ExchangeRates, ConversionDirection } from '@/types/currency'
import { formatNumber } from './formatters'

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

  // Si hay un monto, incluir la conversión
  if (data.inputAmount) {
    const fromCurrency = data.direction === 'usdToUyu' ? 'Dólares' : 'Pesos'
    const toCurrency = data.direction === 'usdToUyu' ? 'Pesos' : 'Dólares'

    message = `💱 Conversión de divisas BROU\n\n` +
      `${formatNumber(data.inputAmount)} ${fromCurrency} = ${formatNumber(data.convertedAmount)} ${toCurrency}\n\n` +
      `📊 Cotización BROU:\n` +
      `Compra: $${formatNumber(data.rates.compra)}\n` +
      `Venta: $${formatNumber(data.rates.venta)}\n` +
      `Media: $${formatNumber(data.rates.media)}`
  } else {
    // Si no hay monto, solo compartir las cotizaciones
    message = `💱 Cotización dólar BROU\n\n` +
      `📊 Tipos de cambio:\n` +
      `Compra: $${formatNumber(data.rates.compra)}\n` +
      `Venta: $${formatNumber(data.rates.venta)}\n` +
      `Media: $${formatNumber(data.rates.media)}`
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')

  return true
}
