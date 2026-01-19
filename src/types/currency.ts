export interface ExchangeRates {
  compra: number
  venta: number
  media: number
  timestamp: string
}

export interface ApiResponse {
  cotizacion_media: number
  detalle: {
    compra: number
    venta: number
    moneda: string
  }
  fecha: string
}

export type ConversionDirection = 'usdToUyu' | 'uyuToUsd'

export interface CurrencyState {
  rates: ExchangeRates | null
  loading: boolean
  error: string | null
  amount: string
  direction: ConversionDirection
}
