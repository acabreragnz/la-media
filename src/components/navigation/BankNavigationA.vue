<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BANKS_ARRAY } from '@/config/banks'
import { getAccentColor, type BankId } from '@/utils/bank-colors'

const route = useRoute()
const currentBankId = computed(() => route.name as string)
</script>

<template>
  <nav class="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <!-- Logo lamedia.uy -->
      <div class="flex items-center justify-between">
        <RouterLink to="/" class="text-white font-bold text-lg flex items-center gap-2">
          🏦 <span class="hidden sm:inline">La Media</span>
        </RouterLink>

        <!-- Tabs de bancos (horizontal scroll en mobile) -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <RouterLink
            v-for="bank in BANKS_ARRAY"
            :key="bank.id"
            :to="bank.route"
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap"
            :class="[
              currentBankId === bank.id
                ? 'bg-white/20 text-white border-b-2'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            ]"
            :style="currentBankId === bank.id ? { borderBottomColor: getAccentColor(bank.id as BankId) } : {}"
          >
            <img :src="bank.logoUrl" :alt="bank.name" class="h-6 w-6" />
            <span>{{ bank.name }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
