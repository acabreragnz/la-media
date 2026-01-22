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

// Mock vue-currency-input
const mockNumberValue = ref<number | null>(null)
const mockSetValue = vi.fn((value: number | null) => {
  if (value === null) {
    mockNumberValue.value = null
  } else {
    mockNumberValue.value = Math.round(value * 100) / 100
  }
})

vi.mock('vue-currency-input', () => ({
  useCurrencyInput: () => ({
    inputRef: ref(null),
    numberValue: mockNumberValue,
    setValue: mockSetValue,
    setOptions: vi.fn(),
  }),
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
    mockNumberValue.value = null
    mockQueryData.value = undefined
    mockIsPending.value = false
    mockIsFetching.value = false
    mockIsError.value = false
    mockQueryError.value = null
  })

  describe('Initial State', () => {
    it('should have correct initial state values', () => {
      const { rates, loading, error, numberValue, direction } = useCurrency()

      expect(rates.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(numberValue.value).toBeNull()
      expect(direction.value).toBe('usdToUyu')
    })
  })

  describe('Conversion Logic', () => {
    it('should convert USD to UYU correctly', () => {
      const { rates, setValue, direction, convertedAmount } = useCurrency()

      // Simular datos de Vue Query
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

      setValue(100)
      direction.value = 'usdToUyu'

      expect(rates.value).toEqual({
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        scraped_at: '2024-01-01T00:00:00Z'
      })
      expect(convertedAmount.value).toBe(4100) // 100 * 41.0 (media)
    })

    it('should convert UYU to USD correctly', () => {
      const { setValue, direction, convertedAmount } = useCurrency()

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

      setValue(4100)
      direction.value = 'uyuToUsd'

      expect(convertedAmount.value).toBe(100) // 4100 / 41.0 (media)
    })

    it('should return 0 when amount is empty', () => {
      const { numberValue, convertedAmount } = useCurrency()

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

      numberValue.value = null

      expect(convertedAmount.value).toBe(0)
    })

    it('should handle decimal amounts', () => {
      const { setValue, direction, convertedAmount } = useCurrency()

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

      setValue(100.50)
      direction.value = 'usdToUyu'

      expect(convertedAmount.value).toBe(4120.5) // 100.50 * 41.0 (media)
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

    it('should update amount to converted value after swap', () => {
      const { setValue, numberValue, direction, swapDirection } = useCurrency()

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

      setValue(100)
      direction.value = 'usdToUyu'

      swapDirection()

      expect(numberValue.value).toBe(4100) // 100 * 41.0 (media)
      expect(direction.value).toBe('uyuToUsd')
    })
  })

  describe('Swap Direction Edge Cases', () => {
    it('should keep input empty when swapping with null value', () => {
      const { numberValue, swapDirection, direction } = useCurrency()

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

      expect(numberValue.value).toBeNull()

      swapDirection()

      expect(numberValue.value).toBeNull()
      expect(direction.value).toBe('uyuToUsd')
    })

    it('should correctly swap when value is zero', () => {
      const { setValue, numberValue, swapDirection } = useCurrency()

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

      setValue(0)
      expect(numberValue.value).toBe(0)

      swapDirection()

      expect(numberValue.value).toBe(0)
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
    it('should calculate nextUpdateTime from backend next_run', () => {
      const { nextUpdateTime } = useCurrency()

      // Simular next_run del backend
      const nextRun = new Date('2024-01-22T15:00:00Z')
      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: '2024-01-01T00:00:00Z',
          next_run: nextRun.toISOString(),
          source: 'scheduled'
        }
      }

      // Debe formatear la hora
      expect(nextUpdateTime.value).toMatch(/\d{2}:\d{2}/)
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

    it('should calculate minutesUntilRefresh correctly', () => {
      const { minutesUntilRefresh } = useCurrency()

      // Next run en 30 minutos
      const nextRun = new Date(Date.now() + 30 * 60 * 1000)
      mockQueryData.value = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        metadata: {
          scraped_at: '2024-01-01T00:00:00Z',
          next_run: nextRun.toISOString(),
          source: 'scheduled'
        }
      }

      expect(minutesUntilRefresh.value).toBeGreaterThanOrEqual(29)
      expect(minutesUntilRefresh.value).toBeLessThanOrEqual(31)
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

    it('should share rates even when numberValue is null', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp, numberValue } = useCurrency()

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
      numberValue.value = null

      shareViaWhatsApp()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank'
      )

      windowOpenSpy.mockRestore()
    })

    it('should open WhatsApp when data is valid', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp, setValue, direction } = useCurrency()

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
      setValue(100)
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
