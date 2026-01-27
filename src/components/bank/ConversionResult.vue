<script setup lang="ts">
import type { ConversionDirection } from '@/types/currency'
import CurrencyValue from '@/components/CurrencyValue.vue'
import { formatNumber } from '@/utils/formatters'

interface Props {
  direction: ConversionDirection
  convertedAmount: number
  isLowEndDevice: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-[20px] p-5 flex items-center gap-4 bank-result-card">
    <span class="text-[2.25rem] leading-none">{{ direction === 'usdToUyu' ? '🇺🇾' : '🇺🇸' }}</span>
    <div class="flex-1 flex flex-col gap-1">
      <label class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
        {{ direction === 'usdToUyu' ? 'Pesos' : 'Dólares' }}
      </label>
      <div class="text-white text-[1.75rem] font-semibold tracking-tight">
        <CurrencyValue v-if="!isLowEndDevice" :value="convertedAmount" />
        <span v-else>{{ formatNumber(convertedAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Result card con fondo del banco */
.bank-result-card {
  background: linear-gradient(to bottom right, rgba(var(--bank-primary-rgb), 0.1), rgba(var(--bank-primary-light-rgb), 0.08));
  border: 1px solid rgba(var(--bank-primary-light-rgb), 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 40px rgba(var(--bank-primary-rgb), 0.15);
}
</style>
