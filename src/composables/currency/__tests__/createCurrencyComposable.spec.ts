import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick, type Ref } from 'vue'
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

// Mock vue-currency-input - dual inputs
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
    callCount++
    // First call returns USD input, second call returns UYU input
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
    name: 'name',
  },
}))

describe('createCurrencyComposable - Dual Input Architecture', () => {
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
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.rates.value).toBeNull()
      expect(currency.loading.value).toBe(false)
      expect(currency.error.value).toBeNull()
      expect(currency.usdValue.value).toBeNull()
      expect(currency.uyuValue.value).toBeNull()
      expect(currency.direction.value).toBe('usdToUyu')
    })
  })

  describe('Dual Input Conversion Logic', () => {
    it('should convert USD to UYU correctly when USD input changes', async () => {
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

      // Simulate typing in USD input
      mockUsdValue.value = 100
      await nextTick()

      expect(currency.direction.value).toBe('usdToUyu')
      expect(currency.convertedAmount.value).toBe(mockUyuValue.value)
    })

    it('should convert UYU to USD correctly when UYU input changes', async () => {
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

      // In real usage, direction is set by focus handler BEFORE typing
      currency.setDirection('uyuToUsd')

      // Simulate typing in UYU input
      mockUyuValue.value = 4100
      await nextTick()

      expect(currency.direction.value).toBe('uyuToUsd')
      expect(currency.convertedAmount.value).toBe(mockUsdValue.value)
    })

    it('should return 0 when both inputs are empty', () => {
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

      expect(currency.convertedAmount.value).toBe(0)
    })
  })

  describe('Direction Management', () => {
    it('should allow manual direction setting', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      // Direction defaults to 'usdToUyu' from localStorage
      // But might be different due to previous tests, so just test the setDirection method

      currency.setDirection('uyuToUsd')
      expect(currency.direction.value).toBe('uyuToUsd')

      currency.setDirection('usdToUyu')
      expect(currency.direction.value).toBe('usdToUyu')
    })
  })

  describe('Error Handling', () => {
    it('should expose error state', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockIsError.value = true
      mockQueryError.value = new Error('Network error')

      expect(currency.error.value).toBe('Network error')
    })

    it('should return null error when no error occurs', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      expect(currency.error.value).toBeNull()
    })
  })

  describe('Loading States', () => {
    it('should expose loading state', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockIsPending.value = true
      expect(currency.loading.value).toBe(true)
    })

    it('should expose fetching state', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      mockIsFetching.value = true
      expect(currency.isFetching.value).toBe(true)
    })
  })

  describe('Refetch', () => {
    it('should expose refetch function', () => {
      const currency = createCurrencyComposable({
        endpoint: '/api/test',
        bankName: 'TEST',
      })

      currency.refetch()
      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('Input Amount for WhatsApp Sharing', () => {
    it('should return USD value when direction is usdToUyu', async () => {
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

      // Set direction first (like real usage with focus handler)
      currency.setDirection('usdToUyu')

      mockUsdValue.value = 100
      await nextTick()

      expect(currency.direction.value).toBe('usdToUyu')
      expect(currency.inputAmount.value).toBe(100)
    })

    it('should return UYU value when direction is uyuToUsd', async () => {
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

      // In real usage, direction is set by focus handler
      currency.setDirection('uyuToUsd')

      mockUyuValue.value = 4100
      await nextTick()

      expect(currency.direction.value).toBe('uyuToUsd')
      expect(currency.inputAmount.value).toBe(4100)
    })
  })

  describe('UI Helpers', () => {
    it('should provide next update time', () => {
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
          nextRunAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
          source: 'scheduled',
        },
      }

      expect(currency.nextUpdateTime.value).toBeTruthy()
    })

    it('should provide last scraped time', () => {
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

      expect(currency.lastScrapedAt.value).toBeTruthy()
    })
  })

  describe('Infinite Loop Prevention (Critical Bug Test)', () => {
    it('should keep values in sync when typing in USD input without infinite loops', async () => {
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

      // Set direction to USD->UYU
      currency.setDirection('usdToUyu')

      // Simulate typing "100"
      mockUsdValue.value = 100
      await nextTick()

      // UYU should be updated with converted value
      expect(mockUyuValue.value).toBe(4100) // 100 * 41.0

      // Now type more to ensure it keeps working
      mockUsdValue.value = 200
      await nextTick()

      expect(mockUyuValue.value).toBe(8200) // 200 * 41.0

      // The fact that we can type multiple times without the test hanging
      // proves there's no infinite loop
    })

    it('should keep values in sync when typing in UYU input without infinite loops', async () => {
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

      // Set direction to UYU->USD
      currency.setDirection('uyuToUsd')

      // Simulate typing "4100"
      mockUyuValue.value = 4100
      await nextTick()

      // USD should be updated with converted value
      expect(mockUsdValue.value).toBe(100) // 4100 / 41.0

      // Type more to ensure it keeps working
      mockUyuValue.value = 8200
      await nextTick()

      expect(mockUsdValue.value).toBe(200) // 8200 / 41.0

      // The fact that we can type multiple times without the test hanging
      // proves there's no infinite loop
    })

    it('should NOT update opposite input when typing in inactive direction', async () => {
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

      // Set direction to UYU->USD
      currency.setDirection('uyuToUsd')
      await nextTick()

      const initialUyuCalls = mockSetUyuValue.mock.calls.length

      // Now change USD value (but direction is still UYU->USD)
      // This should NOT trigger UYU update because USD is not the active direction
      mockUsdValue.value = 100
      await nextTick()

      const finalUyuCalls = mockSetUyuValue.mock.calls.length

      // No new calls to setUyuValue should have been made
      expect(finalUyuCalls).toBe(initialUyuCalls)
    })
  })
})
