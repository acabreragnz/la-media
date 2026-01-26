<script setup lang="ts">

</script>

<template>
  <nav class="flex gap-4">
    <RouterLink :to="{ name: 'brou' }" class="text-white">BROU</RouterLink>
    <RouterLink :to="{ name: 'itau' }" class="text-white">ITAU</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
/* Gradiente mobile: azul BROU en diagonal superior derecha */
.app-gradient {
  background: linear-gradient(to top right, #0a0e1f 0%, #0f1a2e 30%, #0d2744 60%, #08528D 100%);
}

/* Gradiente desktop: original de rama main */
@media (min-width: 768px) {
  .app-gradient {
    background: linear-gradient(135deg, #0a0e1f 0%, #0f1a2e 30%, #0d2744 60%, #08528D 100%);
  }
}
</style>
