<script setup lang="ts">
import type { ConversionDirection } from '@/types/currency'

interface Props {
  direction: ConversionDirection
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <label
    @click="emit('click')"
    class="bg-white/[0.05] border border-white/[0.08] rounded-[20px] p-5 flex items-center gap-4 transition-all cursor-text bank-input-focus"
  >
    <span class="text-[2.25rem] leading-none">{{ direction === 'usdToUyu' ? '🇺🇸' : '🇺🇾' }}</span>
    <span class="flex-1 flex flex-col gap-1">
      <span class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
        {{ direction === 'usdToUyu' ? 'Dólares' : 'Pesos' }}
      </span>
      <slot name="input" />
    </span>
  </label>
</template>

<style scoped>
/* Focus states usando CSS variables del banco */
.bank-input-focus:focus-within {
  border-color: rgba(var(--bank-primary-light-rgb), 0.6) !important;
  background-color: rgba(var(--bank-primary-rgb), 0.06) !important;
  box-shadow: 0 0 30px rgba(var(--bank-primary-rgb), 0.25) !important;
}
</style>
