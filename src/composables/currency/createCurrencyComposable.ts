import { REFRESH_DELAY_SECONDS } from '@/config/refresh'
import type { ConversionDirection } from '@/types/currency'
import { formatRelativeTime } from '@/utils/formatters'
import { shareConversionViaWhatsApp } from '@/utils/whatsappShare'
import type { ExchangeRateRecord } from '@shared/types/exchange-rates.mjs'
import { useQuery } from '@tanstack/vue-query'
import { computed, watch } from 'vue'
import { useCurrencyInput, CurrencyDisplay } from 'vue-currency-input'
import { useStorage } from '@vueuse/core'

type CurrencyConfig = {
  endpoint: string
  bankName: string
}

export function createCurrencyComposable(config: CurrencyConfig) {
  const direction = useStorage<ConversionDirection>(
    `${config.bankName.toLowerCase()}_direction`,
    'usdToUyu',
  )

  // Vue Query con refetchInterval dinámico basado en next_run del backend
  const {
    data: apiData,
    isPending: loading,
    isFetching,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [config.bankName, 'rates'],
    queryFn: async (): Promise<ExchangeRateRecord> => {
      const response = await fetch(config.endpoint)
      if (!response.ok) {
        throw new Error('Error al obtener las cotizaciones')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: (query) => {
      // Acceder a los datos desde el query
      const data = query.state.data as ExchangeRateRecord | undefined
      const nextRun = data?.metadata?.nextRunAt

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
      return msUntilNextRun + REFRESH_DELAY_SECONDS * 1000
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3,
  })

  // Transformar apiData a ExchangeRates
  const rates = computed<ExchangeRateRecord | null>(() => {
    if (!apiData.value?.metadata) return null
    return {
      average: apiData.value.average,
      buy: apiData.value.buy,
      sell: apiData.value.sell,
      currency: apiData.value.currency,
      metadata: apiData.value.metadata,
    }
  })

  // Extraer next_run del backend
  const nextRunFromBackend = computed<string | null>(
    () => apiData.value?.metadata?.nextRunAt ?? null,
  )

  // Error transformado a string
  const error = computed<string | null>(() =>
    isError.value && queryError.value ? queryError.value.message : null,
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
    autoDecimalDigits: false,
  } as const

  // Dual input configuration: USD and UYU inputs
  const {
    inputRef: usdInputRef,
    numberValue: usdValue,
    setValue: setUsdValue,
  } = useCurrencyInput({
    currency: 'USD',
    ...currencyInputConfig,
  })

  const {
    inputRef: uyuInputRef,
    numberValue: uyuValue,
    setValue: setUyuValue,
  } = useCurrencyInput({
    currency: 'UYU',
    ...currencyInputConfig,
  })

  // Watch USD input: update UYU (only when USD is the active direction)
  watch(usdValue, (newUsdValue) => {
    // Only update if this is the active direction
    if (direction.value !== 'usdToUyu') return

    if (!rates.value || newUsdValue === null) {
      setUyuValue(null)
      return
    }

    const convertedValue = newUsdValue * rates.value.average
    setUyuValue(convertedValue)
  })

  // Watch UYU input: update USD (only when UYU is the active direction)
  watch(uyuValue, (newUyuValue) => {
    // Only update if this is the active direction
    if (direction.value !== 'uyuToUsd') return

    if (!rates.value || newUyuValue === null) {
      setUsdValue(null)
      return
    }

    const convertedValue = newUyuValue / rates.value.average
    setUsdValue(convertedValue)
  })

  // Watch rates changes: recalculate based on current direction
  watch(
    () => rates.value,
    (newRates) => {
      if (!newRates) return

      if (direction.value === 'usdToUyu' && usdValue.value !== null) {
        const convertedValue = usdValue.value * newRates.average
        setUyuValue(convertedValue)
      } else if (direction.value === 'uyuToUsd' && uyuValue.value !== null) {
        const convertedValue = uyuValue.value / newRates.average
        setUsdValue(convertedValue)
      }
    },
  )

  // Simplified convertedAmount: just reads from the opposite input
  const convertedAmount = computed(() => {
    return direction.value === 'usdToUyu' ? (uyuValue.value ?? 0) : (usdValue.value ?? 0)
  })

  // inputAmount for WhatsApp sharing
  const inputAmount = computed(() => {
    return direction.value === 'usdToUyu' ? usdValue.value : uyuValue.value
  })

  // Manual direction setter
  const setDirection = (newDirection: ConversionDirection) => {
    direction.value = newDirection
  }

  const shareViaWhatsApp = () => {
    if (!rates.value) return

    shareConversionViaWhatsApp({
      inputAmount: inputAmount.value || null,
      convertedAmount: convertedAmount.value,
      direction: direction.value,
      rates: rates.value,
      bankName: config.bankName,
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
    const diffDays = Math.floor(
      (nextRunStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
    )

    const timeStr = nextRun.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
      month: 'numeric',
    })
    return `${dateStr} ${timeStr}`
  })

  const lastScrapedAt = computed(() => {
    if (!rates.value?.metadata.scrapedAt) return '--:--'
    return formatRelativeTime(rates.value.metadata.scrapedAt)
  })

  return {
    rates,
    loading,
    isFetching,
    error,
    usdInputRef,
    usdValue,
    setUsdValue,
    uyuInputRef,
    uyuValue,
    setUyuValue,
    setDirection,
    inputAmount,
    direction,
    convertedAmount,
    refetch,
    shareViaWhatsApp,

    // Relative time para UI
    nextUpdateTime,
    lastScrapedAt,
  }
}
