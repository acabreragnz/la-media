import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useCurrencyInput, CurrencyDisplay } from 'vue-currency-input'
import type { ExchangeRates, ApiResponse, ConversionDirection } from '@/types/currency'
import { shareConversionViaWhatsApp } from '@/utils/whatsappShare'

export function useCurrency() {
  const direction = ref<ConversionDirection>('usdToUyu')

  // Vue Query para fetching automático
  const {
    data: apiData,
    isPending: loading,
    isError,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['brou-rates'],
    queryFn: async (): Promise<ApiResponse> => {
      const response = await fetch('/api/brou-media')
      if (!response.ok) {
        throw new Error('Error al obtener las cotizaciones')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3
  })

  // Transformar apiData a ExchangeRates
  const rates = computed<ExchangeRates | null>(() => {
    if (!apiData.value) return null
    return {
      compra: apiData.value.detalle.compra,
      venta: apiData.value.detalle.venta,
      media: apiData.value.cotizacion_media,
      scraped_at: apiData.value.metadata.scraped_at
    }
  })

  // Extraer next_run del backend
  const nextRunFromBackend = computed<string | null>(() =>
    apiData.value?.metadata?.next_run ?? null
  )

  // Error transformado a string
  const error = computed<string | null>(() =>
    isError.value && queryError.value
      ? queryError.value.message
      : null
  )

  // Configuración centralizada de vue-currency-input
  const currencyInputConfig = {
    locale: 'es-UY', // Uruguay: punto como separador de miles, coma como decimal
    currencyDisplay: CurrencyDisplay.hidden, // Ocultar símbolo de moneda
    precision: 2, // Siempre 2 decimales para mejor UX
    useGrouping: true,
    valueRange: { min: 0, max: 100000000 }, // Máximo 100 millones
    hideGroupingSeparatorOnFocus: false,
    hideNegligibleDecimalDigitsOnFocus: false,
    autoDecimalDigits: false
  } as const

  // Configurar vue-currency-input con locale uruguayo
  const { inputRef, numberValue, setValue, setOptions } = useCurrencyInput({
    currency: 'USD',
    ...currencyInputConfig
  })

  // Hacer reactiva la moneda según la dirección
  watch(direction, (newDirection) => {
    setOptions({
      ...currencyInputConfig,
      currency: newDirection === 'usdToUyu' ? 'USD' : 'UYU'
    })
  })

  const convertedAmount = computed(() => {
    if (!rates.value || !numberValue.value) return 0

    const inputAmount = numberValue.value
    if (isNaN(inputAmount)) return 0

    return direction.value === 'usdToUyu'
      ? inputAmount * rates.value.media
      : inputAmount / rates.value.media
  })

  const swapDirection = () => {
    // Si el input está vacío, solo cambiar dirección
    if (numberValue.value === null) {
      direction.value = direction.value === 'usdToUyu' ? 'uyuToUsd' : 'usdToUyu'
      return
    }

    const newAmount = convertedAmount.value
    direction.value = direction.value === 'usdToUyu' ? 'uyuToUsd' : 'usdToUyu'
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

  // UI para countdown - basado en next_run del backend
  const nextUpdateTime = computed(() => {
    if (!nextRunFromBackend.value) return '--:--'

    const nextRun = new Date(nextRunFromBackend.value)
    return nextRun.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })

  const minutesUntilRefresh = computed(() => {
    if (!nextRunFromBackend.value) return 0

    const nextRun = new Date(nextRunFromBackend.value).getTime()
    const now = Date.now()
    const diff = nextRun - now
    const minutes = Math.ceil(diff / 60000)
    return Math.max(0, minutes)
  })

  const lastScrapedAt = computed(() => rates.value?.scraped_at ?? '--:--')

  return {
    rates,
    loading,
    error,
    inputRef,
    numberValue,
    setValue,
    direction,
    convertedAmount,
    refetch,
    swapDirection,
    shareViaWhatsApp,

    // Countdown para UI
    nextUpdateTime,
    minutesUntilRefresh,
    lastScrapedAt
  }
}
