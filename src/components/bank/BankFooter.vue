<script setup lang="ts">
import { PhClock, PhWarning } from '@phosphor-icons/vue'

interface Props {
  lastScrapedAt: string
  nextUpdateTime: string
  isFetching: boolean
  disclaimerEnabled: boolean
  bankName: string
  websiteUrl: string
}

defineProps<Props>()

const emit = defineEmits<{
  share: []
}>()
</script>

<template>
  <div class="footer-gradient backdrop-blur-lg rounded-2xl p-3 sm:p-4">
    <div class="text-center space-y-2.5">
      <!-- Stats inline con pipes (flex-wrap para móviles muy pequeños) -->
      <div
        class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[0.65rem] sm:text-xs text-white/60"
      >
        <span class="flex items-center gap-1 whitespace-nowrap">
          <PhClock :size="12" />
          Última: {{ lastScrapedAt }}
        </span>
        <span class="text-white/30 hidden sm:inline">|</span>
        <span class="whitespace-nowrap">Próxima: {{ nextUpdateTime }}</span>
        <span v-if="isFetching" class="flex items-center gap-1 whitespace-nowrap">
          <span class="text-white/30 hidden sm:inline">|</span>
          <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizando...
        </span>
      </div>

      <!-- Disclaimer (más corto en móviles) -->
      <div
        v-if="disclaimerEnabled"
        class="text-[0.55rem] sm:text-[0.6rem] text-white/60 flex items-start justify-center gap-1 leading-tight"
      >
        <PhWarning :size="12" class="text-yellow-500/70 flex-shrink-0" />
        <span class="text-left sm:text-center">
          Sitio no oficial.
          <a :href="websiteUrl" target="_blank" rel="noopener" class="font-medium disclaimer-link"
            >Verificar en {{ bankName }}</a
          >
        </span>
      </div>

      <!-- WhatsApp share button -->
      <button
        @click="emit('share')"
        class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-white text-[0.8rem] font-semibold cursor-pointer transition-all bank-share-button"
        aria-label="Compartir cotización por WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
          />
        </svg>
        Compartir cotización
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Footer gradient background (consistent with other cards) */
.footer-gradient {
  background: linear-gradient(
    135deg,
    rgba(var(--bank-primary-rgb), 0.05) 0%,
    rgba(var(--bank-primary-light-rgb), 0.03) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Share button */
.bank-share-button {
  background: rgba(var(--bank-primary-rgb), 0.05);
  border: 1px solid rgba(var(--bank-primary-light-rgb), 0.4);
}

.bank-share-button:hover {
  background: rgba(var(--bank-primary-rgb), 0.1);
  border-color: rgba(var(--bank-primary-light-rgb), 0.6);
}

/* Disclaimer link */
.disclaimer-link {
  color: rgba(var(--bank-accent-rgb), 0.8);
  transition: color 200ms;
}

.disclaimer-link:hover {
  color: var(--bank-accent);
  text-decoration: underline;
}
</style>
