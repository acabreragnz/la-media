import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useCurrency } from '../useCurrency'

// Mock vue-currency-input
const mockNumberValue = ref<number | null>(null)
const mockSetValue = vi.fn((value: number) => {
  mockNumberValue.value = value
})

vi.mock('vue-currency-input', () => ({
  useCurrencyInput: () => ({
    inputRef: ref(null),
    numberValue: mockNumberValue,
    setValue: mockSetValue,
  }),
}))

// Mock fetch API
global.fetch = vi.fn()

describe('useCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNumberValue.value = null
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

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }
      setValue(100)
      direction.value = 'usdToUyu'

      expect(convertedAmount.value).toBe(4100) // 100 * 41.0 (media)
    })

    it('should convert UYU to USD correctly', () => {
      const { rates, setValue, direction, convertedAmount } = useCurrency()

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }
      setValue(4100)
      direction.value = 'uyuToUsd'

      expect(convertedAmount.value).toBe(100) // 4100 / 41.0 (media)
    })

    it('should return 0 when amount is empty', () => {
      const { rates, numberValue, convertedAmount } = useCurrency()

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }
      numberValue.value = null

      expect(convertedAmount.value).toBe(0)
    })

    it('should handle decimal amounts', () => {
      const { rates, setValue, direction, convertedAmount } = useCurrency()

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
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
      const { rates, setValue, numberValue, direction, swapDirection } = useCurrency()

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }
      setValue(100)
      direction.value = 'usdToUyu'

      swapDirection()

      expect(numberValue.value).toBe(4100) // 100 * 41.0 (media)
      expect(direction.value).toBe('uyuToUsd')
    })
  })

  describe('Number Formatting', () => {
    it('should format numbers with es-UY locale', () => {
      const { formatNumber } = useCurrency()

      const formatted = formatNumber(1234.56)
      expect(formatted).toMatch(/1\.?234,56/)
    })

    it('should format numbers with 2 decimal places', () => {
      const { formatNumber } = useCurrency()

      const formatted = formatNumber(100)
      expect(formatted).toMatch(/100,00/)
    })
  })

  describe('API Fetch', () => {
    it('should fetch rates successfully', async () => {
      const mockResponse: any = {
        cotizacion_media: 41.0,
        detalle: {
          compra: 40.0,
          venta: 42.0,
          moneda: 'USD'
        },
        fecha: '2024-01-01T00:00:00Z'
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const { fetchRates, rates, loading, error } = useCurrency()

      expect(loading.value).toBe(false)

      const fetchPromise = fetchRates()
      expect(loading.value).toBe(true)

      await fetchPromise

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(rates.value).toEqual({
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      })
    })

    it('should handle API errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const { fetchRates, rates, loading, error } = useCurrency()

      await fetchRates()

      expect(loading.value).toBe(false)
      expect(error.value).toBe('Error al obtener las cotizaciones')
      expect(rates.value).toBeNull()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { fetchRates, rates, loading, error } = useCurrency()

      await fetchRates()

      expect(loading.value).toBe(false)
      expect(error.value).toBe('Network error')
      expect(rates.value).toBeNull()
    })
  })

  describe('WhatsApp Share', () => {
    it('should not share when rates are null', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp, rates } = useCurrency()
      rates.value = null

      shareViaWhatsApp()

      expect(windowOpenSpy).not.toHaveBeenCalled()
    })

    it('should open WhatsApp with formatted message', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp, rates, setValue, direction } = useCurrency()

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }
      setValue(100)
      direction.value = 'usdToUyu'

      shareViaWhatsApp()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank'
      )

      const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
      expect(callArg).toBeDefined()
      expect(callArg).toContain('USD')
      expect(callArg).toContain('UYU')
    })
  })
})
