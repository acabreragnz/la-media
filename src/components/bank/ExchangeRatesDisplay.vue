<script setup lang="ts">
import { computed } from 'vue'
import type { BankId } from '@/utils/bank-colors'
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
    <div class="bg-white/[0.04] rounded-xl px-5 py-3 text-sm border border-white/[0.05] relative">
      <!-- Tres columnas: Compra • Media • Venta -->
      <div class="flex items-center justify-center gap-3">
        <!-- Compra -->
        <div class="flex flex-col items-center text-xs text-white/70">
          <span class="text-white/50 text-[0.65rem] uppercase tracking-wider">Compra</span>
          <strong v-if="rates" class="text-white text-sm">{{ formatNumber(rates.buy) }}</strong>
        </div>

        <!-- Separador -->
        <span class="text-white/20 text-lg">•</span>

        <!-- Media (centro, destacado) -->
        <div class="flex flex-col items-center">
          <span class="text-xs uppercase tracking-wider font-medium" style="color: rgba(var(--bank-accent-rgb), 0.8)">Media</span>
          <span v-if="rates" class="font-bold text-2xl" style="color: var(--bank-accent)">
            {{ formatNumber(rates.average) }}
          </span>
        </div>

        <!-- Separador -->
        <span class="text-white/20 text-lg">•</span>

        <!-- Venta -->
        <div class="flex flex-col items-center text-xs text-white/70">
          <span class="text-white/50 text-[0.65rem] uppercase tracking-wider">Venta</span>
          <strong v-if="rates" class="text-white text-sm">{{ formatNumber(rates.sell) }}</strong>
        </div>
      </div>

      <!-- Enlace banco -->
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
