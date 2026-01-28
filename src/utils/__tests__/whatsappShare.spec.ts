import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shareConversionViaWhatsApp } from '../whatsappShare'
import type { ConversionShareData } from '../whatsappShare'

describe('shareConversionViaWhatsApp', () => {
  let windowOpenSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false when rates are null', () => {
    const data = {
      inputAmount: 100,
      convertedAmount: 4100,
      direction: 'usdToUyu',
      rates: null,
      bankName: 'BROU',
    } as ConversionShareData

    const result = shareConversionViaWhatsApp(data)

    expect(result).toBe(false)
    expect(windowOpenSpy).not.toHaveBeenCalled()
  })

  it('should share rates only when inputAmount is null', () => {
    const data: ConversionShareData = {
      inputAmount: null,
      convertedAmount: 0,
      direction: 'usdToUyu',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    const result = shareConversionViaWhatsApp(data)

    expect(result).toBe(true)
    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
    )

    // Verificar que el mensaje contiene las cotizaciones pero no la conversión
    const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
    const decodedUrl = decodeURIComponent(callArg)

    expect(decodedUrl).toContain('Media BROU - Cotización')
    expect(decodedUrl).toContain('Compra: $40,00')
    expect(decodedUrl).toContain('Venta: $42,00')
    expect(decodedUrl).toContain('Media: $41,00')
    expect(decodedUrl).not.toContain('USD =')
  })

  it('should open WhatsApp with correct URL for USD to UYU conversion', () => {
    const data: ConversionShareData = {
      inputAmount: 100,
      convertedAmount: 4100,
      direction: 'usdToUyu',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    const result = shareConversionViaWhatsApp(data)

    expect(result).toBe(true)
    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
    )
  })

  it('should open WhatsApp with correct URL for UYU to USD conversion', () => {
    const data: ConversionShareData = {
      inputAmount: 4100,
      convertedAmount: 100,
      direction: 'uyuToUsd',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    const result = shareConversionViaWhatsApp(data)

    expect(result).toBe(true)
    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
    )
  })

  it('should include USD and UYU currencies in message for USD→UYU conversion', () => {
    const data: ConversionShareData = {
      inputAmount: 100,
      convertedAmount: 4100,
      direction: 'usdToUyu',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    shareConversionViaWhatsApp(data)

    const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
    expect(callArg).toBeDefined()

    // Decode URL to check message content
    const decodedUrl = decodeURIComponent(callArg)
    expect(decodedUrl).toContain('Dólares')
    expect(decodedUrl).toContain('Pesos')
    expect(decodedUrl).toContain('100,00 Dólares')
    expect(decodedUrl).toContain('4.100,00 Pesos')
  })

  it('should include formatted rates (compra, venta, media) in message', () => {
    const data: ConversionShareData = {
      inputAmount: 100,
      convertedAmount: 4100,
      direction: 'usdToUyu',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    shareConversionViaWhatsApp(data)

    const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
    const decodedUrl = decodeURIComponent(callArg)

    expect(decodedUrl).toContain('Compra')
    expect(decodedUrl).toContain('40,00')
    expect(decodedUrl).toContain('Venta')
    expect(decodedUrl).toContain('42,00')
    expect(decodedUrl).toContain('Media')
    expect(decodedUrl).toContain('41,00')
  })

  it('should properly encode special characters in WhatsApp URL', () => {
    const data: ConversionShareData = {
      inputAmount: 100,
      convertedAmount: 4100,
      direction: 'usdToUyu',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    shareConversionViaWhatsApp(data)

    const callArg = windowOpenSpy.mock.calls[0]?.[0] as string

    // URL should be encoded (contains %XX sequences)
    expect(callArg).toMatch(/%[0-9A-F]{2}/)

    // Should start with WhatsApp base URL
    expect(callArg).toMatch(/^https:\/\/wa\.me\/\?text=/)
  })

  it('should handle decimal amounts correctly', () => {
    const data: ConversionShareData = {
      inputAmount: 100.5,
      convertedAmount: 4120.5,
      direction: 'usdToUyu',
      rates: {
        buy: 40.5,
        sell: 42.5,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-01T00:00:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    shareConversionViaWhatsApp(data)

    const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
    const decodedUrl = decodeURIComponent(callArg)

    expect(decodedUrl).toContain('100,50')
    expect(decodedUrl).toContain('4.120,50')
  })

  it('should include timestamp in message with conversion', () => {
    const data: ConversionShareData = {
      inputAmount: 100,
      convertedAmount: 4100,
      direction: 'usdToUyu',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-22T14:30:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    shareConversionViaWhatsApp(data)

    const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
    const decodedUrl = decodeURIComponent(callArg)

    // Verificar que incluye el texto "Cotización del:"
    expect(decodedUrl).toContain('Cotización del:')

    // Verificar que incluye un formato de fecha (dd/mm/yy o similar)
    expect(decodedUrl).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)

    // Verificar que incluye el emoji del reloj
    expect(decodedUrl).toContain('🕒')
  })

  it('should include timestamp in message without conversion', () => {
    const data: ConversionShareData = {
      inputAmount: null,
      convertedAmount: 0,
      direction: 'usdToUyu',
      rates: {
        buy: 40.0,
        sell: 42.0,
        average: 41.0,
        currency: 'USD',
        metadata: {
          scrapedAt: '2024-01-22T14:30:00Z',
          nextRunAt: null,
          source: 'scheduled' as const,
        },
      },
      bankName: 'BROU',
    }

    shareConversionViaWhatsApp(data)

    const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
    const decodedUrl = decodeURIComponent(callArg)

    // Verificar que incluye el texto "Cotización del:"
    expect(decodedUrl).toContain('Cotización del:')

    // Verificar que incluye un formato de fecha (dd/mm/yy o similar)
    expect(decodedUrl).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)

    // Verificar que incluye el emoji del reloj
    expect(decodedUrl).toContain('🕒')
  })

  describe('Bank name in message', () => {
    it('should include bank name "BROU" when sharing BROU rates', () => {
      const data: ConversionShareData = {
        inputAmount: 100,
        convertedAmount: 4100,
        direction: 'usdToUyu',
        rates: {
          buy: 40.0,
          sell: 42.0,
          average: 41.0,
          currency: 'USD',
          metadata: {
            scrapedAt: '2024-01-01T00:00:00Z',
            nextRunAt: null,
            source: 'scheduled' as const,
          },
        },
        bankName: 'BROU',
      }

      shareConversionViaWhatsApp(data)

      const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
      const decodedUrl = decodeURIComponent(callArg)

      expect(decodedUrl).toContain('Media BROU - Conversión')
    })

    it('should include bank name "Itaú" when sharing Itaú rates', () => {
      const data: ConversionShareData = {
        inputAmount: 100,
        convertedAmount: 4100,
        direction: 'usdToUyu',
        rates: {
          buy: 40.0,
          sell: 42.0,
          average: 41.0,
          currency: 'USD',
          metadata: {
            scrapedAt: '2024-01-01T00:00:00Z',
            nextRunAt: null,
            source: 'scheduled' as const,
          },
        },
        bankName: 'Itaú',
      }

      shareConversionViaWhatsApp(data)

      const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
      const decodedUrl = decodeURIComponent(callArg)

      expect(decodedUrl).toContain('Media Itaú - Conversión')
    })

    it('should include bank name "Santander" when sharing Santander rates', () => {
      const data: ConversionShareData = {
        inputAmount: null,
        convertedAmount: 0,
        direction: 'usdToUyu',
        rates: {
          buy: 40.0,
          sell: 42.0,
          average: 41.0,
          currency: 'USD',
          metadata: {
            scrapedAt: '2024-01-01T00:00:00Z',
            nextRunAt: null,
            source: 'scheduled' as const,
          },
        },
        bankName: 'Santander',
      }

      shareConversionViaWhatsApp(data)

      const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
      const decodedUrl = decodeURIComponent(callArg)

      expect(decodedUrl).toContain('Media Santander - Cotización')
    })

    it('should include bank name in rates-only message', () => {
      const data: ConversionShareData = {
        inputAmount: null,
        convertedAmount: 0,
        direction: 'usdToUyu',
        rates: {
          buy: 40.0,
          sell: 42.0,
          average: 41.0,
          currency: 'USD',
          metadata: {
            scrapedAt: '2024-01-01T00:00:00Z',
            nextRunAt: null,
            source: 'scheduled' as const,
          },
        },
        bankName: 'Itaú',
      }

      shareConversionViaWhatsApp(data)

      const callArg = windowOpenSpy.mock.calls[0]?.[0] as string
      const decodedUrl = decodeURIComponent(callArg)

      expect(decodedUrl).toContain('Media Itaú - Cotización')
      expect(decodedUrl).not.toContain('Media BROU')
    })
  })
})
