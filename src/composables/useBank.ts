import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { banks, defaultBank, type BankCode } from '@/config/banks'

const selectedBankCode = useLocalStorage<BankCode>('broumedia_selected_bank', defaultBank.code)

export function useBank() {
  const currentBank = computed(() => {
    return banks[selectedBankCode.value] ?? defaultBank
  })

  function selectBank(bankCode: BankCode) {
    if (bankCode in banks) {
      selectedBankCode.value = bankCode
    }
  }

  return {
    currentBank,
    selectedBankCode,
    selectBank,
    banks,
  }
}
