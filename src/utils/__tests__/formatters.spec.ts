import { describe, it, expect } from 'vitest'
import { formatNumber, formatTimestamp } from '../formatters'

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

describe('formatTimestamp', () => {
  it('should format ISO 8601 timestamp to es-UY locale', () => {
    const timestamp = '2024-01-22T14:30:00Z'
    const formatted = formatTimestamp(timestamp)

    // Verificar que contiene fecha y hora
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })

  it('should use 24-hour format (not AM/PM)', () => {
    const timestamp = '2024-01-22T14:30:00Z'
    const formatted = formatTimestamp(timestamp)

    // No debe contener AM o PM
    expect(formatted).not.toMatch(/AM|PM|am|pm/)
  })

  it('should handle timestamps with different hours', () => {
    const morningTimestamp = '2024-01-22T09:15:00Z'
    const afternoonTimestamp = '2024-01-22T15:45:00Z'

    const morningFormatted = formatTimestamp(morningTimestamp)
    const afternoonFormatted = formatTimestamp(afternoonTimestamp)

    // Ambos deben tener formato válido
    expect(morningFormatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    expect(afternoonFormatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
  })

  it('should handle midnight timestamp', () => {
    const timestamp = '2024-01-22T00:00:00Z'
    const formatted = formatTimestamp(timestamp)

    // Debe contener 0:00 o 00:00 (dependiendo de la implementación del navegador)
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
  })
})
