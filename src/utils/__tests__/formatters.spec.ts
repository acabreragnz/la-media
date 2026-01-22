import { describe, it, expect } from 'vitest'
import { formatNumber } from '../formatters'

describe('formatNumber', () => {
  it('should format numbers with es-UY locale (period as thousands, comma as decimal)', () => {
    const formatted = formatNumber(1234.56)
    expect(formatted).toBe('1.234,56')
  })

  it('should enforce 2 decimal places', () => {
    const formatted = formatNumber(100)
    expect(formatted).toBe('100,00')
  })

  it('should handle large numbers (1,000,000+)', () => {
    const formatted = formatNumber(1234567.89)
    expect(formatted).toBe('1.234.567,89')
  })

  it('should handle zero', () => {
    const formatted = formatNumber(0)
    expect(formatted).toBe('0,00')
  })

  it('should handle single decimal', () => {
    const formatted = formatNumber(100.5)
    expect(formatted).toBe('100,50')
  })

  it('should round to 2 decimals when more are provided', () => {
    const formatted = formatNumber(100.556)
    expect(formatted).toBe('100,56')
  })

  it('should handle small decimal numbers', () => {
    const formatted = formatNumber(0.99)
    expect(formatted).toBe('0,99')
  })
})
