<script setup lang="ts">
import { computed } from 'vue'
import type { BankId } from '@/types/banks'
import type { ExchangeRateRecord } from '@shared/types/exchange-rates.mjs'
import { BANKS } from '@/config/banks'
import { formatNumber } from '@/utils/formatters'
import { PhArrowSquareOut } from '@phosphor-icons/vue'

interface Props {
  rates: ExchangeRateRecord | null
  bankId: BankId
}

const props = defineProps<Props>()

const bank = computed(() => {
  const config = BANKS[props.bankId]
  if (!config) {
    throw new Error(`Bank configuration not found for: ${props.bankId}`)
  }
  return config
})
</script>

<template>
  <div class="space-y-2">
    <div class="rounded-xl px-4 relative">
      <div class="flex items-center">
        <!-- Compra -->
        <div class="flex flex-col flex-1 items-end pl-2 pr-3">
          <span class="text-[0.65rem] text-white/50 uppercase tracking-wider">Compra</span>
          <span v-if="rates" class="text-white/90 text-base font-semibold">{{
            formatNumber(rates.buy)
          }}</span>
        </div>

        <!-- Divider vertical con gradiente sutil -->
        <div class="relative w-[1px] h-12 overflow-hidden">
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent blur-[1px]"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"
          ></div>
        </div>

        <!-- Media (centro, destacado) -->
        <div class="flex flex-col items-center px-4 py-1">
          <span class="text-sm uppercase tracking-wider font-medium media-label">Media</span>
          <span v-if="rates" class="font-bold text-3xl media-value">{{
            formatNumber(rates.average)
          }}</span>
        </div>

        <!-- Divider vertical con gradiente sutil -->
        <div class="relative w-[1px] h-12 overflow-hidden">
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent blur-[1px]"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"
          ></div>
        </div>

        <!-- Venta -->
        <div class="flex flex-col flex-1 items-start pl-3 pr-2">
          <span class="text-[0.65rem] text-white/50 uppercase tracking-wider">Venta</span>
          <span v-if="rates" class="text-white/90 text-base font-semibold">{{
            formatNumber(rates.sell)
          }}</span>
        </div>
      </div>

      <!-- Enlace banco (absolute, esquina inferior derecha) -->
      <a
        :href="bank.websiteUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute bottom-2 right-2 flex items-center gap-1 text-[0.65rem] text-white/30 hover:text-white/50 transition-colors"
      >
        <PhArrowSquareOut :size="12" weight="bold" />
        <span>{{ bank.name }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.media-label {
  color: rgba(var(--bank-accent-rgb), 0.8);
}

.media-value {
  color: var(--bank-accent);
}

.option4-gradient {
  background: linear-gradient(
    135deg,
    rgba(var(--bank-primary-rgb), 0.05) 0%,
    rgba(var(--bank-primary-light-rgb), 0.03) 100%
  );
}
</style>
