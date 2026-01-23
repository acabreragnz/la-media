import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { useCurrency } from '../useCurrency'
import type { ApiResponse } from '@/types/currency'

// Mock para Vue Query
const mockQueryData: Ref<ApiResponse | undefined> = ref(undefined)
const mockIsPending = ref(false)
const mockIsFetching = ref(false)
const mockIsError = ref(false)
const mockQueryError: Ref<Error | null> = ref(null)
const mockRefetch = vi.fn()

vi.mock('@tanstack/vue-query', () => ({
  VueQueryPlugin: {},
  useQuery: () => ({
    data: mockQueryData,
    isPending: mockIsPending,
    isFetching: mockIsFetching,
    isError: mockIsError,
    error: mockQueryError,
    refetch: mockRefetch
  })
}))

// Mock vue-currency-input - dual input (USD y UYU)
const mockUsdValue = ref<number | null>(null)
const mockUyuValue = ref<number | null>(null)

const mockSetUsdValue = vi.fn((value: number | null) => {
  if (value === null) {
    mockUsdValue.value = null
  } else {
    mockUsdValue.value = Math.round(value * 100) / 100
  }
})

const mockSetUyuValue = vi.fn((value: number | null) => {
  if (value === null) {
    mockUyuValue.value = null
  } else {
    mockUyuValue.value = Math.round(value * 100) / 100
  }
})

let callCount = 0
vi.mock('vue-currency-input', () => ({
  useCurrencyInput: () => {
    // Alternar entre USD y UYU en cada llamada
    callCount++
    if (callCount % 2 === 1) {
      return {
        inputRef: ref(null),
        numberValue: mockUsdValue,
        setValue: mockSetUsdValue,
        setOptions: vi.fn(),
      }
    } else {
      return {
        inputRef: ref(null),
        numberValue: mockUyuValue,
        setValue: mockSetUyuValue,
        setOptions: vi.fn(),
      }
    }
  },
  CurrencyDisplay: {
    hidden: 'hidden',
    symbol: 'symbol',
    narrowSymbol: 'narrowSymbol',
    code: 'code',
    name: 'name'
  }
}))

describe('useCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    callCount = 0
    mockUsdValue.value = null
    mockUyuValue.value = null
    mockQueryData.value = undefined
    mockIsPending.value = false
    mockIsFetching.value = false
    mockIsError.value = false
    mockQueryError.value = null
  })

  describe('Initial State', () => {
    it('should have correct initial state values', () => {
      const { rates, loading, error, usdValue, uyuValue, direction } = useCurrency()

      expect(rates.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(usdValue.value).toBeNull()
      expect(uyuValue.value).toBeNull()
      expect(direction.value).toBe('usdToUyu')
    })
  })

  describe('Dual Input Conversion', () => {
    it('should have separate USD and UYU inputs', () => {
      const { usdInputRef, uyuInputRef, setUsdValue, setUyuValue } = useCurrency()

      expect(usdInputRef).toBeDefined()
      expect(uyuInputRef).toBeDefined()
      expect(setUsdValue).toBeDefined()
      expect(setUyuValue).toBeDefined()
    })

    it('should expose inputAmount based on direction', () => {
      const { inputAmount, direction, setUsdValue, setUyuValue } = useCurrency()

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: { compra: 40.0, venta: 42.0, moneda: 'USD' },
        metadata: { scraped_at: '2024-01-01T00:00:00Z', next_run: null, source: 'scheduled' }
      }

      // USD to UYU direction
      direction.value = 'usdToUyu'
      setUsdValue(100)
      expect(inputAmount.value).toBe(100)

      // UYU to USD direction
      direction.value = 'uyuToUsd'
      setUyuValue(4100)
      expect(inputAmount.value).toBe(4100)
    })

    it('should expose convertedAmount based on direction', () => {
      const { convertedAmount, direction, setUsdValue, setUyuValue } = useCurrency()

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: { compra: 40.0, venta: 42.0, moneda: 'USD' },
        metadata: { scraped_at: '2024-01-01T00:00:00Z', next_run: null, source: 'scheduled' }
      }

      // USD to UYU: converted is UYU value
      direction.value = 'usdToUyu'
      setUyuValue(4100)
      expect(convertedAmount.value).toBe(4100)

      // UYU to USD: converted is USD value
      direction.value = 'uyuToUsd'
      setUsdValue(100)
      expect(convertedAmount.value).toBe(100)
    })
  })

  describe('Swap Direction', () => {
    it('should swap direction from usdToUyu to uyuToUsd', () => {
      const { direction, swapDirection } = useCurrency()

      expect(direction.value).toBe('usdToUyu')
      swapDirection()
      expect(direction.value).toBe('uyuToUsd')
    })

    it('should swap direction from uyuToUsd to usdToUyu', () => {
      const { direction, swapDirection } = useCurrency()

      direction.value = 'uyuToUsd'
      swapDirection()
      expect(direction.value).toBe('usdToUyu')
    })

    it('should swap values between USD and UYU fields', () => {
      const { setUsdValue, setUyuValue, swapDirection } = useCurrency()

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: { compra: 40.0, venta: 42.0, moneda: 'USD' },
        metadata: { scraped_at: '2024-01-01T00:00:00Z', next_run: null, source: 'scheduled' }
      }

      setUsdValue(100)
      setUyuValue(4100)

      swapDirection()

      // Values should be swapped
      expect(mockSetUsdValue).toHaveBeenCalledWith(4100)
      expect(mockSetUyuValue).toHaveBeenCalledWith(100)
    })
  })

  describe('Loading and Error States', () => {
    it('should reflect loading state from Vue Query', () => {
      const { loading } = useCurrency()

      expect(loading.value).toBe(false)

      mockIsPending.value = true

      expect(loading.value).toBe(true)
    })

    it('should reflect error state from Vue Query', () => {
      const { error } = useCurrency()

      expect(error.value).toBeNull()

      mockIsError.value = true
      mockQueryError.value = new Error('Network error')

      expect(error.value).toBe('Network error')
    })

    it('should return null rates when query has no data', () => {
      const { rates } = useCurrency()

      mockQueryData.value = undefined

      expect(rates.value).toBeNull()
    })
  })

  describe('Next Run UI', () => {
    it('should show only time for same day', () => {
      const { nextUpdateTime } = useCurrency()

      // Simular next_run hoy en el futuro (2 horas desde ahora)
      const now = new Date()
      const nextRun = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          next_run: nextRun.toISOString(),
          source: 'scheduled'
        }
      }

      // Debe formatear como hora fija (ej: "15:45")
      expect(nextUpdateTime.value).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should show "mañana HH:MM" for tomorrow', () => {
      const { nextUpdateTime } = useCurrency()

      // Simular next_run mañana a las 08:00
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(8, 0, 0, 0)

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          next_run: tomorrow.toISOString(),
          source: 'scheduled'
        }
      }

      // Debe formatear como "mañana 08:00"
      expect(nextUpdateTime.value).toMatch(/^mañana \d{2}:\d{2}$/)
    })

    it('should show "day HH:MM" for this week', () => {
      const { nextUpdateTime } = useCurrency()

      // Simular next_run en 3 días
      const inThreeDays = new Date()
      inThreeDays.setDate(inThreeDays.getDate() + 3)
      inThreeDays.setHours(10, 30, 0, 0)

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          next_run: inThreeDays.toISOString(),
          source: 'scheduled'
        }
      }

      // Debe formatear como "lun 10:30" o similar
      expect(nextUpdateTime.value).toMatch(/^[a-z]{3,4}\.? \d{2}:\d{2}$/)
    })

    it('should show "mañana HH:MM" for tomorrow edge case (23:59 → 00:01)', () => {
      const { nextUpdateTime } = useCurrency()

      // Simular que es 23:59 hoy, next_run es 00:01 mañana
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 1, 0, 0)

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: new Date().toISOString(),
          next_run: tomorrow.toISOString(),
          source: 'scheduled'
        }
      }

      // Debe formatear como "mañana 00:01" (no "00:01" del mismo día)
      expect(nextUpdateTime.value).toMatch(/^mañana \d{2}:\d{2}$/)
    })

    it('should show "lun HH:MM" for Friday → Monday (weekend)', () => {
      const { nextUpdateTime } = useCurrency()

      // Crear un viernes a las 19:00
      const friday = new Date('2024-01-26T19:00:00Z') // Viernes 26 enero 2024

      // Next run: Lunes 29 enero a las 08:00
      const monday = new Date('2024-01-29T08:00:00Z')

      // Mock current date to be Friday
      vi.setSystemTime(friday)

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: friday.toISOString(),
          next_run: monday.toISOString(),
          source: 'scheduled'
        }
      }

      const result = nextUpdateTime.value

      // Debe formatear como "lun 08:00" (no "mañana" porque hay fin de semana)
      expect(result).toMatch(/^lun\.? \d{2}:\d{2}$/)

      // Restore real time
      vi.useRealTimers()
    })

    it('should show "lun HH:MM" for Sunday → Monday', () => {
      const { nextUpdateTime } = useCurrency()

      // Crear un domingo a las 23:00
      const sunday = new Date('2024-01-28T23:00:00Z') // Domingo 28 enero 2024

      // Next run: Lunes 29 enero a las 08:00
      const monday = new Date('2024-01-29T08:00:00Z')

      // Mock current date to be Sunday
      vi.setSystemTime(sunday)

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: sunday.toISOString(),
          next_run: monday.toISOString(),
          source: 'scheduled'
        }
      }

      const result = nextUpdateTime.value

      // Debe formatear como "mañana 08:00" (domingo → lunes es mañana)
      expect(result).toMatch(/^mañana \d{2}:\d{2}$/)

      // Restore real time
      vi.useRealTimers()
    })

    it('should show --:-- when next_run is null', () => {
      const { nextUpdateTime } = useCurrency()

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: '2024-01-01T00:00:00Z',
          next_run: null,
          source: 'fallback'
        }
      }

      expect(nextUpdateTime.value).toBe('--:--')
    })

    it('should show --:-- when next_run is in the past', () => {
      const { nextUpdateTime } = useCurrency()

      // Next run hace 1 hora (en el pasado)
      const pastTime = new Date(Date.now() - 60 * 60 * 1000)

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
          next_run: pastTime.toISOString(),
          source: 'scheduled'
        }
      }

      // Si next_run está en el pasado, debe mostrar --:--
      expect(nextUpdateTime.value).toBe('--:--')
    })
  })

  describe('WhatsApp Share', () => {
    it('should not share when rates are null', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp } = useCurrency()
      mockQueryData.value = undefined

      shareViaWhatsApp()

      expect(windowOpenSpy).not.toHaveBeenCalled()
      windowOpenSpy.mockRestore()
    })

    it('should share rates even when input values are null', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp } = useCurrency()

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: '2024-01-01T00:00:00Z',
          next_run: null,
          source: 'scheduled'
        }
      }

      shareViaWhatsApp()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank'
      )

      windowOpenSpy.mockRestore()
    })

    it('should open WhatsApp when data is valid', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp, setUsdValue, direction } = useCurrency()

      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: '2024-01-01T00:00:00Z',
          next_run: null,
          source: 'scheduled'
        }
      }
      setUsdValue(100)
      direction.value = 'usdToUyu'

      shareViaWhatsApp()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank'
      )
      windowOpenSpy.mockRestore()
    })
  })

  describe('Refetch', () => {
    it('should expose refetch function from Vue Query', () => {
      const { refetch } = useCurrency()

      expect(refetch).toBeDefined()
      expect(typeof refetch).toBe('function')
    })
  })
})
