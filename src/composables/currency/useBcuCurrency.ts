import { createCurrencyComposable } from './createCurrencyComposable'

export function useBcuCurrency() {
  return createCurrencyComposable({
    endpoint: '/api/bcu',
    bankName: 'BCU',
  })
}
