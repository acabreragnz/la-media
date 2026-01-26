import { createCurrencyComposable } from "./createCurrencyComposable";

export function useBrouCurrency() {
  return createCurrencyComposable({
    endpoint: '/api/brou',
    bankName: 'BROU'
  })
}
