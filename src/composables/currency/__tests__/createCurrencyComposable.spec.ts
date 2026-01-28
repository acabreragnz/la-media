import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { createCurrencyComposable } from '../createCurrencyComposable'
import type { ExchangeRateRecord } from '@shared/types/exchange-rates.mts'

// Mock para Vue Query
const mockQueryData: Ref<ExchangeRateRecord | undefined> = ref(undefined)
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
    refetch: mockRefetch,
  }),
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
    name: 'name',
  },
}))

describe('createCurrencyComposable', () => {
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
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.rates.value).toBeNull()
      expect(currency.loading.value).toBe(false)
      expect(currency.error.value).toBeNull()
      expect(currency.numberValue.value).toBeNull()
      expect(currency.direction.value).toBe('usdToUyu')
    })
  })

  describe('Conversion Logic', () => {
    it('should convert USD to UYU correctly', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Simular datos de Vue Query
      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      currency.setValue(100)
      currency.direction.value = 'usdToUyu'

      expect(currency.rates.value).toEqual({
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      })
      expect(currency.convertedAmount.value).toBe(4100) // 100 * 41.0 (media)
    })

    it('should convert UYU to USD correctly', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      currency.setValue(4100)
      currency.direction.value = 'uyuToUsd'

      expect(currency.convertedAmount.value).toBe(100) // 4100 / 41.0 (media)
    })

    it('should return 0 when amount is empty', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      currency.numberValue.value = null

      expect(currency.convertedAmount.value).toBe(0)
    })

    it('should handle decimal amounts', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      currency.setValue(100.5)
      currency.direction.value = 'usdToUyu'

      expect(currency.convertedAmount.value).toBe(4120.5) // 100.50 * 41.0 (media)
    })
  })

  describe('Swap Direction', () => {
    it('should swap direction from usdToUyu to uyuToUsd', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.direction.value).toBe('usdToUyu')
      currency.swapDirection()
      expect(currency.direction.value).toBe('uyuToUsd')
    })

    it('should swap direction from uyuToUsd to usdToUyu', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      currency.direction.value = 'uyuToUsd'
      currency.swapDirection()
      expect(currency.direction.value).toBe('usdToUyu')
    })

    it('should update amount to converted value after swap', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      currency.setValue(100)
      currency.direction.value = 'usdToUyu'

      currency.swapDirection()

      expect(currency.numberValue.value).toBe(4100) // 100 * 41.0 (media)
      expect(currency.direction.value).toBe('uyuToUsd')
    })
  })

  describe('Swap Direction Edge Cases', () => {
    it('should handle swap gracefully when value is null', () => {
      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.numberValue.value).toBeNull()
      const initialDirection = currency.direction.value

      // Swap should not throw an error when value is null
      expect(() => currency.swapDirection()).not.toThrow()

      // Value should remain null
      expect(currency.numberValue.value).toBeNull()

      // Direction should have changed (toggle behavior)
      expect(currency.direction.value).not.toBe(initialDirection)
    })

    it('should correctly swap when value is zero', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      currency.setValue(0)
      expect(currency.numberValue.value).toBe(0)

      currency.swapDirection()

      expect(currency.numberValue.value).toBe(0)
    })
  })

  describe('Loading and Error States', () => {
    it('should reflect loading state from Vue Query', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.loading.value).toBe(false)

      mockIsPending.value = true

      expect(currency.loading.value).toBe(true)
    })

    it('should reflect error state from Vue Query', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.error.value).toBeNull()

      mockIsError.value = true
      mockQueryError.value = new Error('Network error')

      expect(currency.error.value).toBe('Network error')
    })

    it('should return null rates when query has no data', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = undefined

      expect(currency.rates.value).toBeNull()
    })
  })

  describe('Next Run UI', () => {
    it('should show only time for same day', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Simular next_run hoy en el futuro (2 horas desde ahora)
      const now = new Date()
      const nextRun = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          nextRunAt: nextRun.toISOString(),
          source: 'scheduled',
        },
      }

      // Debe formatear como hora fija (ej: "15:45")
      expect(currency.nextUpdateTime.value).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should show "mañana HH:MM" for tomorrow', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Simular next_run mañana a las 08:00
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(8, 0, 0, 0)

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          nextRunAt: tomorrow.toISOString(),
          source: 'scheduled',
        },
      }

      // Debe formatear como "mañana 08:00"
      expect(currency.nextUpdateTime.value).toMatch(/^mañana \d{2}:\d{2}$/)
    })

    it('should show "day HH:MM" for this week', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Simular next_run en 3 días
      const inThreeDays = new Date()
      inThreeDays.setDate(inThreeDays.getDate() + 3)
      inThreeDays.setHours(10, 30, 0, 0)

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          nextRunAt: inThreeDays.toISOString(),
          source: 'scheduled',
        },
      }

      // Debe formatear como "lun 10:30" o similar (acepta tildes como en "sáb")
      expect(currency.nextUpdateTime.value).toMatch(/^[\p{L}]{3,4}\.? \d{2}:\d{2}$/u)
    })

    it('should show "mañana HH:MM" for tomorrow edge case (23:59 → 00:01)', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Simular que es 23:59 hoy, next_run es 00:01 mañana
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 1, 0, 0)

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: new Date().toISOString(),
          nextRunAt: tomorrow.toISOString(),
          source: 'scheduled',
        },
      }

      // Debe formatear como "mañana 00:01" (no "00:01" del mismo día)
      expect(currency.nextUpdateTime.value).toMatch(/^mañana \d{2}:\d{2}$/)
    })

    it('should show "lun HH:MM" for Friday → Monday (weekend)', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Crear un viernes a las 19:00
      const friday = new Date('2024-01-26T19:00:00Z') // Viernes 26 enero 2024

      // Next run: Lunes 29 enero a las 08:00
      const monday = new Date('2024-01-29T08:00:00Z')

      // Mock current date to be Friday
      vi.setSystemTime(friday)

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: friday.toISOString(),
          nextRunAt: monday.toISOString(),
          source: 'scheduled',
        },
      }

      const result = currency.nextUpdateTime.value

      // Debe formatear como "lun 08:00" (no "mañana" porque hay fin de semana)
      expect(result).toMatch(/^lun\.? \d{2}:\d{2}$/)

      // Restore real time
      vi.useRealTimers()
    })

    it('should show "lun HH:MM" for Sunday → Monday', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Crear un domingo a las 23:00
      const sunday = new Date('2024-01-28T23:00:00Z') // Domingo 28 enero 2024

      // Next run: Lunes 29 enero a las 08:00
      const monday = new Date('2024-01-29T08:00:00Z')

      // Mock current date to be Sunday
      vi.setSystemTime(sunday)

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: sunday.toISOString(),
          nextRunAt: monday.toISOString(),
          source: 'scheduled',
        },
      }

      const result = currency.nextUpdateTime.value

      // Debe formatear como "mañana 08:00" (domingo → lunes es mañana)
      expect(result).toMatch(/^mañana \d{2}:\d{2}$/)

      // Restore real time
      vi.useRealTimers()
    })

    it('should show --:-- when next_run is null', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'fallback',
        },
      }

      expect(currency.nextUpdateTime.value).toBe('--:--')
    })

    it('should show --:-- when next_run is in the past', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Next run hace 1 hora (en el pasado)
      const pastTime = new Date(Date.now() - 60 * 60 * 1000)

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
          nextRunAt: pastTime.toISOString(),
          source: 'scheduled',
        },
      }

      // Si next_run está en el pasado, debe mostrar --:--
      expect(currency.nextUpdateTime.value).toBe('--:--')
    })
  })

  describe('WhatsApp Share', () => {
    it('should not share when rates are null', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })
      mockQueryData.value = undefined

      currency.shareViaWhatsApp()

      expect(windowOpenSpy).not.toHaveBeenCalled()
      windowOpenSpy.mockRestore()
    })

    it('should share rates even when numberValue is null', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }
      currency.numberValue.value = null

      currency.shareViaWhatsApp()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank',
      )

      windowOpenSpy.mockRestore()
    })

    it('should open WhatsApp when data is valid', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled',
        },
      }
      currency.setValue(100)
      currency.direction.value = 'usdToUyu'

      currency.shareViaWhatsApp()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank',
      )
      windowOpenSpy.mockRestore()
    })
  })

  describe('Refetch', () => {
    it('should expose refetch function from Vue Query', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.refetch).toBeDefined()
      expect(typeof currency.refetch).toBe('function')
    })
  })

  describe('Last Scraped Time', () => {
    it('should show --:-- when rates are null', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockQueryData.value = undefined

      expect(currency.lastScrapedAt.value).toBe('--:--')
    })

    it('should format relative time when rates have scrapedAt', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // 5 minutos atrás
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

      mockQueryData.value = {
        average: 41.0,
        buy: 40.0,
        sell: 42.0,
        currency: 'USD',
        metadata: {
          scrapedAt: fiveMinutesAgo.toISOString(),
          nextRunAt: null,
          source: 'scheduled',
        },
      }

      // Debe mostrar algo como "hace 5 min"
      expect(currency.lastScrapedAt.value).toMatch(/hace \d+ min/)
    })
  })

  describe('Bank Configuration', () => {
    it('should accept endpoint and bankName configuration', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/custom-bank',
        bankName: 'CUSTOM',
      })

      // Verify composable was created successfully
      expect(currency).toBeDefined()
      expect(currency.rates).toBeDefined()
      expect(currency.direction).toBeDefined()
    })
  })
})
