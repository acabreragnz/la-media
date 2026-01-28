import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBankCurrency } from '../useBankCurrency'
import { useBrouCurrency } from '../useBrouCurrency'
import { useItauCurrency } from '../useItauCurrency'

// Mock the individual bank composables
vi.mock('../useBrouCurrency')
vi.mock('../useItauCurrency')

describe('useBankCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call useBrouCurrency for brou bank', () => {
    useBankCurrency('brou')
    expect(useBrouCurrency).toHaveBeenCalled()
  })

  it('should call useItauCurrency for itau bank', () => {
    useBankCurrency('itau')
    expect(useItauCurrency).toHaveBeenCalled()
  })

  it('should use BROU fallback for santander', () => {
    useBankCurrency('santander')
    expect(useBrouCurrency).toHaveBeenCalled()
  })

  it('should use Itaú fallback for bbva', () => {
    useBankCurrency('bbva')
    expect(useItauCurrency).toHaveBeenCalled()
  })

  it('should use BROU fallback for bcu', () => {
    useBankCurrency('bcu')
    expect(useBrouCurrency).toHaveBeenCalled()
  })

  it('should throw for invalid bank ID', () => {
    // @ts-expect-error Testing runtime error
    expect(() => useBankCurrency('invalid')).toThrow(
      'No currency composable configured for bank: invalid',
    )
  })
})
