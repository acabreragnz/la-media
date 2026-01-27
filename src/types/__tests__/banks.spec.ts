import { describe, it, expect } from 'vitest'
import { isBankId } from '../banks'

describe('isBankId', () => {
  it('should return true for valid bank IDs', () => {
    expect(isBankId('brou')).toBe(true)
    expect(isBankId('itau')).toBe(true)
    expect(isBankId('santander')).toBe(true)
    expect(isBankId('bbva')).toBe(true)
    expect(isBankId('bcu')).toBe(true)
  })

  it('should return false for invalid strings', () => {
    expect(isBankId('invalid')).toBe(false)
    expect(isBankId('')).toBe(false)
    expect(isBankId('BROU')).toBe(false) // Case sensitive
    expect(isBankId('hsbc')).toBe(false)
    expect(isBankId('chase')).toBe(false)
  })
})
