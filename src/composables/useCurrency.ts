import { ref, computed, watch, nextTick } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useCurrencyInput, CurrencyDisplay } from 'vue-currency-input'
import type { ExchangeRates, ApiResponse, ConversionDirection } from '@/types/currency'
import { shareConversionViaWhatsApp } from '@/utils/whatsappShare'
import { formatRelativeTime } from '@/utils/formatters'
import { REFRESH_DELAY_SECONDS } from '@/config/refresh'

export function useCurrency() {
  // Direction indica cuál es el "source" para mostrar el rate
  const direction = ref<ConversionDirection>('usdToUyu')

  // Vue Query con refetchInterval dinámico basado en next_run del backend
  const {
    data: apiData,
    isPending: loading,
    isFetching,
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
    refetchInterval: (query) => {
      // Acceder a los datos desde el query
      const data = query.state.data as ApiResponse | undefined
      const nextRun = data?.metadata?.next_run

      if (!nextRun) {
        // Sin next_run, usar intervalo por defecto de 15 minutos
        return 15 * 60 * 1000
      }

      const nextRunTime = new Date(nextRun).getTime()
      const now = Date.now()
      const msUntilNextRun = nextRunTime - now

      // Si next_run está en el pasado o muy cerca, refetch inmediatamente
      if (msUntilNextRun <= 0) {
        return 1000 // 1 segundo
      }

      // Agregar delay del backend (de la constante de configuración)
      return msUntilNextRun + (REFRESH_DELAY_SECONDS * 1000)
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3
  })

  // Transformar apiData a ExchangeRates
  const rates = computed<ExchangeRates | null>(() => {
    if (!apiData.value?.metadata) return null
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

  // Dual input: USD y UYU
  const {
    inputRef: usdInputRef,
    numberValue: usdValue,
    setValue: setUsdValue
  } = useCurrencyInput({
    currency: 'USD',
    ...currencyInputConfig
  })

  const {
    inputRef: uyuInputRef,
    numberValue: uyuValue,
    setValue: setUyuValue
  } = useCurrencyInput({
    currency: 'UYU',
    ...currencyInputConfig
  })

  // Flag para evitar loops infinitos en los watches
  const isUpdating = ref(false)

  // Cuando USD cambia, actualizar UYU
  watch(usdValue, (newVal) => {
    if (isUpdating.value) return

    // Marcar como source activo
    direction.value = 'usdToUyu'

    if (newVal === null || !rates.value) {
      isUpdating.value = true
      setUyuValue(null)
      nextTick(() => {
        isUpdating.value = false
      })
      return
    }

    isUpdating.value = true
    setUyuValue(newVal * rates.value.media)
    nextTick(() => {
      isUpdating.value = false
    })
  })

  // Cuando UYU cambia, actualizar USD
  watch(uyuValue, (newVal) => {
    if (isUpdating.value) return

    // Marcar como source activo
    direction.value = 'uyuToUsd'

    if (newVal === null || !rates.value) {
      isUpdating.value = true
      setUsdValue(null)
      nextTick(() => {
        isUpdating.value = false
      })
      return
    }

    isUpdating.value = true
    setUsdValue(newVal / rates.value.media)
    nextTick(() => {
      isUpdating.value = false
    })
  })

  // Recalcular cuando cambian los rates
  watch(rates, (newRates) => {
    if (!newRates || isUpdating.value) return

    isUpdating.value = true

    if (direction.value === 'usdToUyu' && usdValue.value !== null) {
      setUyuValue(usdValue.value * newRates.media)
    } else if (direction.value === 'uyuToUsd' && uyuValue.value !== null) {
      setUsdValue(uyuValue.value / newRates.media)
    }

    nextTick(() => {
      isUpdating.value = false
    })
  })

  // El swap intercambia los valores y cambia la dirección
  const swapDirection = () => {
    const tempUsd = usdValue.value
    const tempUyu = uyuValue.value

    isUpdating.value = true

    setUsdValue(tempUyu)
    setUyuValue(tempUsd)

    // Cambiar la dirección
    direction.value = direction.value === 'usdToUyu' ? 'uyuToUsd' : 'usdToUyu'

    nextTick(() => {
      isUpdating.value = false
    })
  }

  // Computed para obtener input y output según direction (para WhatsApp share)
  const inputAmount = computed(() =>
    direction.value === 'usdToUyu' ? usdValue.value : uyuValue.value
  )

  const convertedAmount = computed(() =>
    direction.value === 'usdToUyu' ? uyuValue.value ?? 0 : usdValue.value ?? 0
  )

  const shareViaWhatsApp = () => {
    if (!rates.value) return

    shareConversionViaWhatsApp({
      inputAmount: inputAmount.value,
      convertedAmount: convertedAmount.value,
      direction: direction.value,
      rates: rates.value
    })
  }

  // UI para countdown - basado en next_run del backend (formato inteligente)
  const nextUpdateTime = computed(() => {
    if (!nextRunFromBackend.value) return '--:--'

    const nextRun = new Date(nextRunFromBackend.value)
    const now = new Date()

    // Si next_run está en el pasado, mostrar --:--
    if (nextRun.getTime() < now.getTime()) {
      return '--:--'
    }

    // Normalizar fechas a medianoche para comparación de días
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const nextRunStart = new Date(nextRun.getFullYear(), nextRun.getMonth(), nextRun.getDate())
    const diffDays = Math.floor((nextRunStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))

    const timeStr = nextRun.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // Mismo día: solo hora
    if (diffDays === 0) {
      return timeStr
    }

    // Mañana
    if (diffDays === 1) {
      return `mañana ${timeStr}`
    }

    // Esta semana (2-6 días)
    if (diffDays >= 2 && diffDays <= 6) {
      const dayName = nextRun.toLocaleDateString('es-UY', { weekday: 'short' })
      return `${dayName} ${timeStr}`
    }

    // Más de una semana: fecha corta
    const dateStr = nextRun.toLocaleDateString('es-UY', {
      day: 'numeric',
      month: 'numeric'
    })
    return `${dateStr} ${timeStr}`
  })

  const lastScrapedAt = computed(() => {
    if (!rates.value?.scraped_at) return '--:--'
    return formatRelativeTime(rates.value.scraped_at)
  })

  return {
    rates,
    loading,
    isFetching,
    error,
    // Dual input refs
    usdInputRef,
    usdValue,
    setUsdValue,
    uyuInputRef,
    uyuValue,
    setUyuValue,
    // Direction y conversión
    direction,
    inputAmount,
    convertedAmount,
    refetch,
    swapDirection,
    shareViaWhatsApp,

    // Relative time para UI
    nextUpdateTime,
    lastScrapedAt
  }
}
