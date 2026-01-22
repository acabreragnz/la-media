export interface ExchangeRates {
  compra: number
  venta: number
  media: number
  scraped_at: string
}

export interface ApiResponse {
  cotizacion_media: number
  detalle: {
    compra: number
    venta: number
    moneda: string
  }
  metadata: {
    scraped_at: string
    next_run: string | null
    source: 'scheduled' | 'fallback' | 'manual'
  }
}

export type ConversionDirection = 'usdToUyu' | 'uyuToUsd'
