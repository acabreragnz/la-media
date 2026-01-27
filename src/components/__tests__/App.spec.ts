import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { CurrencyDisplay } from 'vue-currency-input'

// Mock Vue Query
vi.mock('@tanstack/vue-query', () => ({
  VueQueryPlugin: {},
  useQuery: () => ({
    data: ref(undefined),
    isPending: ref(false),
    isFetching: ref(false),
    isError: ref(false),
    error: ref(null),
    refetch: vi.fn()
  })
}))

// Mock to capture useCurrencyInput calls
const mockUseCurrencyInput = vi.fn()

vi.mock('vue-currency-input', async () => {
  const actual = await vi.importActual('vue-currency-input')
  return {
    ...actual,
    useCurrencyInput: (options: unknown) => {
      mockUseCurrencyInput(options)
      return {
        inputRef: { value: null },
        numberValue: { value: null },
        setValue: vi.fn(),
        setOptions: vi.fn()
      }
    }
  }
})

describe('Currency Input Configuration', () => {
  it('should configure useCurrencyInput with CurrencyDisplay.hidden to hide currency symbols', async () => {
    // Import useBrouCurrency which will call useCurrencyInput
    const { useBrouCurrency } = await import('@/composables/currency/useBrouCurrency')

    // Call the composable
    useBrouCurrency()

    // Verify useCurrencyInput was called with currencyDisplay: CurrencyDisplay.hidden
    expect(mockUseCurrencyInput).toHaveBeenCalled()

    const callArgs = mockUseCurrencyInput.mock.calls[0]?.[0]
    expect(callArgs).toBeDefined()
    expect(callArgs).toHaveProperty('currencyDisplay')
    expect(callArgs.currencyDisplay).toBe(CurrencyDisplay.hidden)
  })

  it('should verify CurrencyDisplay.hidden equals "hidden" string', () => {
    // Verify the enum value is correct
    expect(CurrencyDisplay.hidden).toBe('hidden')
  })
})
