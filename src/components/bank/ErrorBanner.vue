<script setup lang="ts">
import { PhWarning } from '@phosphor-icons/vue'

interface Props {
  error: string | null
  hasRates: boolean
  bankName: string
  isFetching: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    v-if="error"
    class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-3"
  >
    <PhWarning :size="20" class="text-yellow-500 flex-shrink-0 mt-0.5" />
    <div class="flex-1">
      <p class="text-yellow-200 text-[0.8rem] font-medium mb-1">
        {{ hasRates ? 'Problemas para actualizar' : 'Error al cargar cotizaciones' }}
      </p>
      <p class="text-white/70 text-[0.7rem] leading-relaxed">
        {{
          hasRates
            ? `No pudimos obtener datos actualizados de ${bankName}. Mostrando última cotización disponible.`
            : error
        }}
      </p>
    </div>
    <button
      @click="emit('retry')"
      class="text-yellow-300 hover:text-yellow-100 text-[0.7rem] font-medium underline flex-shrink-0"
      :disabled="isFetching"
    >
      {{ isFetching ? 'Reintentando...' : 'Reintentar' }}
    </button>
  </div>
</template>
