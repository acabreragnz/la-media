<script setup lang="ts">
import { computed } from 'vue'
import type { BankId } from '@/types/banks'
import { BANKS } from '@/config/banks'
import ItauLogo from '@/components/ItauLogo.vue'

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
    <a
      :href="bank.websiteUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="hover:opacity-80 transition-opacity"
    >
      <!-- Logo inline para Itaú (usa currentColor) -->
      <ItauLogo v-if="bankId === 'itau'" class="h-10 w-auto bank-logo" />
      <!-- Logo img para otros bancos -->
      <img v-else :src="bank.logoUrl" :alt="bank.name" class="h-10 w-auto" />
    </a>
    <h1
      class="text-[1.6rem] font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
    >
      {{ bank.displayName }}
    </h1>
  </div>
</template>

<style scoped>
.bank-logo {
  color: var(--bank-accent);
}
</style>
