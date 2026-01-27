<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BANKS_ARRAY } from '@/config/banks'
import { getAccentColor, type BankId } from '@/utils/bank-colors'

const route = useRoute()
const currentBankId = computed(() => route.name as string)
</script>

<template>
  <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
    <div
      class="bg-dark-bg-2/80 backdrop-blur-xl rounded-[28px] border border-white/10 px-2 py-2 shadow-2xl flex gap-3"
    >
      <RouterLink
        v-for="bank in BANKS_ARRAY"
        :key="bank.id"
        :to="bank.route"
        class="relative w-14 h-14 rounded-full flex items-center justify-center transition-all"
        :class="[
          currentBankId === bank.id
            ? 'bg-white/20 scale-110'
            : 'bg-white/[0.08] hover:bg-white/[0.12] hover:scale-105'
        ]"
      >
        <!-- Logo del banco -->
        <img
          :src="bank.logoUrl"
          :alt="bank.name"
          class="w-8 h-8 object-contain"
        />

        <!-- Ring de color cuando está activo -->
        <div
          v-if="currentBankId === bank.id"
          class="absolute inset-0 rounded-full ring-3 animate-pulse"
          :style="{
            borderColor: getAccentColor(bank.id as BankId),
            borderWidth: '3px',
            borderStyle: 'solid'
          }"
        ></div>
      </RouterLink>
    </div>
  </nav>
</template>
