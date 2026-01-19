import { ref, computed } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'
import type { ExchangeRates, ApiResponse, ConversionDirection } from '@/types/currency'

export function useCurrency() {
  const rates = ref<ExchangeRates | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const direction = ref<ConversionDirection>('usdToUyu')

  // Configurar vue-currency-input con locale uruguayo
  const { inputRef, numberValue, setValue } = useCurrencyInput({
    currency: 'USD', // Requerido por la librería
    locale: 'es-UY', // Uruguay: punto como separador de miles, coma como decimal
    precision: 2,
    useGrouping: true,
    valueRange: { min: 0, max: 100000000 }, // Máximo 100 millones
    hideCurrencySymbolOnFocus: false,
    hideGroupingSeparatorOnFocus: false,
    hideNegligibleDecimalDigitsOnFocus: false,
    autoDecimalDigits: false
  })

  const fetchRates = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/brou-media')

      if (!response.ok) {
        throw new Error('Error al obtener las cotizaciones')
      }

      const data: ApiResponse = await response.json()

      rates.value = {
        compra: data.detalle.compra,
        venta: data.detalle.venta,
        media: data.cotizacion_media,
        timestamp: data.fecha
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      rates.value = null
    } finally {
      loading.value = false
    }
  }

  const convertedAmount = computed(() => {
    if (!rates.value || !numberValue.value) return 0

    const inputAmount = numberValue.value
    if (isNaN(inputAmount)) return 0

    if (direction.value === 'usdToUyu') {
      return inputAmount * rates.value.media
    } else {
      return inputAmount / rates.value.media
    }
  })

  const swapDirection = () => {
    // Swap de dirección y actualizar el valor
    const newAmount = convertedAmount.value
    direction.value = direction.value === 'usdToUyu' ? 'uyuToUsd' : 'usdToUyu'
    // Usar setValue para actualizar el input formateado
    setValue(newAmount)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-UY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const shareViaWhatsApp = () => {
    if (!rates.value || !numberValue.value) return

    const inputAmount = numberValue.value
    const result = convertedAmount.value

    const fromCurrency = direction.value === 'usdToUyu' ? 'USD' : 'UYU'
    const toCurrency = direction.value === 'usdToUyu' ? 'UYU' : 'USD'
    const fromFlag = direction.value === 'usdToUyu' ? '🇺🇸' : '🇺🇾'
    const toFlag = direction.value === 'usdToUyu' ? '🇺🇾' : '🇺🇸'

    const message = `💱 *Conversión BROU*\n\n` +
      `🔄 Conversión:\n` +
      `• ${fromFlag} ${formatNumber(inputAmount)} ${fromCurrency} → ${toFlag} ${formatNumber(result)} ${toCurrency}\n\n` +
      `📊 Cotización actual:\n` +
      `• Compra: $${formatNumber(rates.value.compra)}\n` +
      `• Media: $${formatNumber(rates.value.media)}\n` +
      `• Venta: $${formatNumber(rates.value.venta)}\n\n` +
      `_Calculado con broumedia.tonicabrera.dev_`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return {
    rates,
    loading,
    error,
    inputRef,
    numberValue,
    setValue,
    direction,
    convertedAmount,
    fetchRates,
    swapDirection,
    formatNumber,
    shareViaWhatsApp
  }
}
