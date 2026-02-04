<script setup lang="ts">
import { PhWarning } from '@phosphor-icons/vue'
</script>

<template>
  <footer class="p-4 text-center bg-black/30 backdrop-blur-lg border-t border-white/5">
    <div
      class="max-w-[800px] mx-auto flex flex-wrap justify-center items-center gap-2 sm:gap-3"
    >
      <p class="text-white/50 text-xs inline-flex items-center gap-1.5">
        <PhWarning :size="14" weight="bold" class="flex-shrink-0" />
        <span
          ><strong>Sitio NO oficial.</strong> No afiliado con ningún banco. Las marcas son
          propiedad de sus titulares.</span
        >
      </p>
      <RouterLink
        to="/privacidad"
        class="text-white/40 text-xs underline hover:text-white/60 transition-colors sm:ml-3"
      >
        Política de Privacidad
      </RouterLink>
    </div>
  </footer>
</template>
