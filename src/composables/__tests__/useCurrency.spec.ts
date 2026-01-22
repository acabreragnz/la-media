import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useCurrency } from '../useCurrency'

// Mock vue-currency-input
const mockNumberValue = ref<number | null>(null)
const mockSetValue = vi.fn((value: number | null) => {
  // Simular el comportamiento real de vue-currency-input:
  // acepta number | null y redondea a 6 decimales (precision: { min: 2, max: 6 })
  if (value === null) {
    mockNumberValue.value = null
  } else {
    mockNumberValue.value = Math.round(value * 1000000) / 1000000
  }
})

vi.mock('vue-currency-input', () => ({
  useCurrencyInput: () => ({
    inputRef: ref(null),
    numberValue: mockNumberValue,
    setValue: mockSetValue,
    setOptions: vi.fn(),
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

    it('should preserve original value after double swap (precision test)', () => {
      const { rates, setValue, numberValue, direction, swapDirection, convertedAmount } = useCurrency()

      // Usar tasa real de BROU
      rates.value = {
        compra: 40.20,
        venta: 42.28,
        media: 41.24,
        timestamp: '2024-01-01T00:00:00Z'
      }

      // Escenario: Usuario ingresa 100.22 USD
      const originalValue = 100.22
      setValue(originalValue)
      direction.value = 'usdToUyu'
      console.log('1. Original input (USD):', numberValue.value)

      // Conversión esperada: 100.22 * 41.24 = 4,133.0728 UYU
      const firstConversion = convertedAmount.value
      console.log('2. First conversion (USD→UYU):', firstConversion)
      expect(firstConversion).toBeCloseTo(4133.0728, 4)

      // Primer swap: USD → UYU
      swapDirection()
      console.log('3. After first swap, input (UYU):', numberValue.value)
      console.log('   Converted back (UYU→USD):', convertedAmount.value)
      expect(direction.value).toBe('uyuToUsd')

      // Segundo swap: UYU → USD (debería volver al valor original)
      swapDirection()
      console.log('4. After second swap, input (USD):', numberValue.value)
      console.log('   Expected:', originalValue)
      console.log('   Diff:', Math.abs(numberValue.value! - originalValue))
      expect(direction.value).toBe('usdToUyu')

      // Con precisión de 6 decimales, el valor debería preservarse correctamente
      // después del doble swap (100.22 → 4133.072800 → 100.22)
      expect(numberValue.value).toBe(originalValue)
    })
  })

  describe('Swap Direction Edge Cases', () => {
    it('should keep input empty when swapping with null value', () => {
      const { rates, numberValue, swapDirection, direction } = useCurrency()

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }

      // Input is empty (null)
      expect(numberValue.value).toBeNull()

      swapDirection()

      // Should remain empty after swap
      expect(numberValue.value).toBeNull()
      expect(direction.value).toBe('uyuToUsd')
    })

    it('should correctly swap when value is zero', () => {
      const { rates, setValue, numberValue, swapDirection } = useCurrency()

      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }

      // User explicitly enters 0
      setValue(0)
      expect(numberValue.value).toBe(0)

      swapDirection()

      // Should show 0 after swap
      expect(numberValue.value).toBe(0)
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
      windowOpenSpy.mockRestore()
    })

    it('should share rates even when numberValue is null', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      const { shareViaWhatsApp, rates, numberValue } = useCurrency()
      rates.value = {
        compra: 40.0,
        venta: 42.0,
        media: 41.0,
        timestamp: '2024-01-01T00:00:00Z'
      }
      numberValue.value = null

      shareViaWhatsApp()

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank'
      )

      // Verificar que el mensaje contiene las cotizaciones
      const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
      const decodedUrl = decodeURIComponent(callArg)

      expect(decodedUrl).toContain('Cotización dólar BROU')
      expect(decodedUrl).toContain('Compra')
      expect(decodedUrl).toContain('40,00')

      windowOpenSpy.mockRestore()
    })

    it('should open WhatsApp when data is valid', () => {
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
      windowOpenSpy.mockRestore()
    })
  })
})
