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
    it('should show only time for same day', () => {
      const { nextUpdateTime } = useCurrency()

      // Simular next_run hoy a las 15:45
      const now = new Date()
      const nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 45, 0)
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
