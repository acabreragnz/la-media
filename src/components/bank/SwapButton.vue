<script setup lang="ts">
const emit = defineEmits<{
  swap: []
}>()
</script>

<template>
  <div class="flex justify-center my-4">
    <button
      @click="emit('swap')"
      class="flex items-center justify-center w-12 h-12 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 bank-swap-button"
      aria-label="Intercambiar monedas"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5.5 h-5.5 text-white transition-transform duration-400 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* Swap button con gradiente del banco */
.bank-swap-button {
  background: linear-gradient(to bottom right, var(--bank-primary), var(--bank-primary-light));
  box-shadow:
    0 8px 20px rgba(var(--bank-primary-rgb), 0.5),
    0 0 40px rgba(var(--bank-primary-light-rgb), 0.3);
}

.bank-swap-button:hover {
  box-shadow:
    0 12px 30px rgba(var(--bank-primary-rgb), 0.7),
    0 0 60px rgba(var(--bank-primary-light-rgb), 0.5);
}
</style>
