import { createCurrencyComposable } from './createCurrencyComposable'

export function useItauCurrency() {
  return createCurrencyComposable({
    endpoint: '/api/itau',
    bankName: 'itaú',
  })
}
