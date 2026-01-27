<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BANKS_ARRAY } from '@/config/banks'
import { getAccentColor, type BankId } from '@/utils/bank-colors'
import { PhList, PhX } from '@phosphor-icons/vue'
import { onClickOutside } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const currentBankId = computed(() => route.name as string)

const isOpen = ref(false)
const drawerRef = ref(null)

function toggleDrawer() {
  isOpen.value = !isOpen.value
}

function goToBank(bankRoute: string) {
  router.push(bankRoute)
  isOpen.value = false
}

// Cerrar drawer al hacer click fuera
onClickOutside(drawerRef, () => {
  if (isOpen.value) isOpen.value = false
})
</script>

<template>
  <!-- Burger Button -->
  <button
    @click="toggleDrawer"
    class="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/[0.08] backdrop-blur-lg border border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
    :style="{ color: getAccentColor(currentBankId as BankId) || '#fff' }"
  >
    <PhList :size="24" weight="bold" />
  </button>

  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      ref="drawerRef"
      class="fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-dark-bg-2/95 backdrop-blur-xl border-l border-white/10 z-50 p-6 overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl font-bold">Bancos</h2>
        <button
          @click="toggleDrawer"
          class="text-white/60 hover:text-white transition-colors"
        >
          <PhX :size="24" />
        </button>
      </div>

      <!-- Bank Cards -->
      <div class="space-y-3">
        <button
          v-for="bank in BANKS_ARRAY"
          :key="bank.id"
          @click="goToBank(bank.route)"
          class="w-full bg-white/[0.06] hover:bg-white/[0.1] rounded-xl p-4 border transition-all text-left"
          :class="[
            currentBankId === bank.id
              ? 'border-l-4'
              : 'border-white/[0.05] hover:border-white/[0.1]'
          ]"
          :style="currentBankId === bank.id ? { borderLeftColor: getAccentColor(bank.id as BankId) } : {}"
        >
          <div class="flex items-center gap-3">
            <img :src="bank.logoUrl" :alt="bank.name" class="w-12 h-12" />
            <div class="flex-1">
              <h3 class="text-white font-bold text-base">{{ bank.name }}</h3>
              <p class="text-white/50 text-sm">Ver cotización</p>
            </div>
            <span
              v-if="currentBankId === bank.id"
              class="text-2xl"
              :style="{ color: getAccentColor(bank.id as BankId) }"
            >
              ★
            </span>
          </div>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slide transition */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>
