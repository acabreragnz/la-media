<script setup lang="ts">
import { computed } from 'vue'
import type { BankId } from '@/types/banks'
import { BANKS } from '@/config/banks'
import { PhWarning } from '@phosphor-icons/vue'

interface Props {
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
  <div class="flex items-center justify-center gap-3 mb-7">
    <RouterLink to="/" class="hover:opacity-80 transition-opacity">
      <!-- Todos los bancos: usa headerLogoUrl si existe, sino logoUrl por defecto -->
      <img :src="bank.headerLogoUrl || bank.logoUrl" alt="La Media" class="h-10 w-auto" />
    </RouterLink>
    <div class="flex items-center gap-2">
      <h1 class="text-2xl font-bold tracking-tight text-white/80">
        {{ bank.displayName }}
      </h1>
      <span
        class="inline-flex items-center gap-1 text-[0.65rem] text-white/65 font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-white/8 border border-white/12"
      >
        <PhWarning :size="12" weight="bold" />
        No oficial
      </span>
    </div>
  </div>
</template>

