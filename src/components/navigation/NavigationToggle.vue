<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

type NavType = 'A' | 'B' | 'C'

const activeNav = defineModel<NavType>({ default: 'A' })

// Persist en localStorage
const storedNav = useLocalStorage<NavType>('lamedia_nav_type', 'A')
activeNav.value = storedNav.value

function setNav(type: NavType) {
  activeNav.value = type
  storedNav.value = type
}
</script>

<template>
  <div class="fixed bottom-20 left-4 z-50 bg-purple-600/90 backdrop-blur-lg rounded-lg p-2 border border-purple-400/30">
    <div class="text-white text-xs font-bold mb-1 px-2">Nav Type:</div>
    <div class="flex gap-1">
      <button
        @click="setNav('A')"
        class="px-3 py-1 rounded text-xs font-bold transition-all"
        :class="activeNav === 'A' ? 'bg-white text-purple-600' : 'bg-purple-500/50 text-white hover:bg-purple-500'"
      >
        A
      </button>
      <button
        @click="setNav('B')"
        class="px-3 py-1 rounded text-xs font-bold transition-all"
        :class="activeNav === 'B' ? 'bg-white text-purple-600' : 'bg-purple-500/50 text-white hover:bg-purple-500'"
      >
        B
      </button>
      <button
        @click="setNav('C')"
        class="px-3 py-1 rounded text-xs font-bold transition-all"
        :class="activeNav === 'C' ? 'bg-white text-purple-600' : 'bg-purple-500/50 text-white hover:bg-purple-500'"
      >
        C
      </button>
    </div>
  </div>
</template>
