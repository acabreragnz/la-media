import { ref, computed, onMounted, watch } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'
import type { ExchangeRates, ApiResponse, ConversionDirection } from '@/types/currency'
import { useAutoRefresh } from './useAutoRefresh'
import { REFRESH_SLOTS, REFRESH_INTERVAL_MINUTES } from '@/config/refresh'
import { shareConversionViaWhatsApp } from '@/utils/whatsappShare'

export function useCurrency() {
  const rates = ref<ExchangeRates | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const direction = ref<ConversionDirection>('usdToUyu')
  const currentSlot = ref<Date | null>(null) // Último slot confirmado con datos

  /**
   * Calcula el slot de tiempo actual basado en la hora
   * Devuelve el slot inmediatamente anterior o igual a la hora actual
   */
  function getCurrentSlotTime(): Date {
    const now = new Date()
    const minute = now.getMinutes()

    // Encontrar el slot anterior o igual
    let slotMinute = REFRESH_SLOTS[0] // Default al primer slot

    for (const slot of REFRESH_SLOTS) {
      if (minute >= slot) {
        slotMinute = slot
      } else {
        break
      }
    }

    const slotTime = new Date(now)
    slotTime.setMinutes(slotMinute as number)
    slotTime.setSeconds(0)
    slotTime.setMilliseconds(0)

    return slotTime
  }

  // Configurar vue-currency-input con locale uruguayo
  const { inputRef, numberValue, setValue, setOptions } = useCurrencyInput({
    currency: 'USD',
    locale: 'es-UY', // Uruguay: punto como separador de miles, coma como decimal
    currencyDisplay: 'hidden', // Ocultar símbolo de moneda
    precision: { min: 2, max: 6 }, // Permitir hasta 6 decimales internos, mostrar mínimo 2
    useGrouping: true,
    valueRange: { min: 0, max: 100000000 }, // Máximo 100 millones
    hideGroupingSeparatorOnFocus: false,
    hideNegligibleDecimalDigitsOnFocus: true, // Ocultar decimales no significativos en display
    autoDecimalDigits: false
  })

  // Hacer reactiva la moneda según la dirección
  watch(direction, (newDirection) => {
    setOptions({
      currency: newDirection === 'usdToUyu' ? 'USD' : 'UYU',
      locale: 'es-UY', // Forzar locale uruguayo siempre
      currencyDisplay: 'hidden', // Mantener símbolo oculto al cambiar dirección
      hideGroupingSeparatorOnFocus: false // Mantener separadores visibles siempre
    })
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

      // ✅ Solo avanzar currentSlot después de fetch exitoso
      currentSlot.value = getCurrentSlotTime()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      // ❌ NO actualizar currentSlot en error
    } finally {
      loading.value = false
    }
  }

  // Setup auto-refresh con slots fijos
  const { minutesUntilRefresh } = useAutoRefresh(fetchRates)

  // Última actualización: timestamp real del backend
  const lastUpdateTime = computed(() => {
    if (!rates.value?.timestamp) return '--:--'

    const timestamp = new Date(rates.value.timestamp)
    return timestamp.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })

  // Próxima actualización: currentSlot + intervalo configurado
  const nextUpdateTime = computed(() => {
    if (!currentSlot.value) return '--:--'

    const nextSlot = new Date(currentSlot.value)
    nextSlot.setMinutes(nextSlot.getMinutes() + REFRESH_INTERVAL_MINUTES)

    return nextSlot.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })

  // Fetch inicial
  onMounted(() => {
    fetchRates()
  })

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

  /**
   * Amount to use when swapping direction.
   * Returns null when input is empty to preserve empty state.
   * Different from convertedAmount which returns 0 for UI display.
   */
  const swapAmount = computed((): number | null => {
    // Preserve null for empty input
    if (numberValue.value === null) return null

    if (!rates.value) return null

    const inputAmount = numberValue.value
    if (isNaN(inputAmount)) return null

    if (direction.value === 'usdToUyu') {
      return inputAmount * rates.value.media
    } else {
      return inputAmount / rates.value.media
    }
  })

  const swapDirection = () => {
    // Swap de dirección y actualizar el valor
    const newAmount = swapAmount.value
    direction.value = direction.value === 'usdToUyu' ? 'uyuToUsd' : 'usdToUyu'
    // Usar setValue para actualizar el input formateado
    setValue(newAmount)
  }

  const shareViaWhatsApp = () => {
    if (!rates.value) return

    shareConversionViaWhatsApp({
      inputAmount: numberValue.value || null,
      convertedAmount: convertedAmount.value,
      direction: direction.value,
      rates: rates.value
    })
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
    shareViaWhatsApp,

    // Countdown para UI
    minutesUntilRefresh,
    nextUpdateTime,
    lastUpdateTime
  }
}
