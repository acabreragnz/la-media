<script setup lang="ts">
import { PhX, PhWarning } from '@phosphor-icons/vue'

interface Props {
  bankName: string
  websiteUrl: string
}

defineProps<Props>()

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <div class="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4 mb-5 relative">
    <!-- Botón cerrar -->
    <button
      @click="emit('dismiss')"
      class="absolute top-3 right-3 text-white/50 hover:text-white/90 transition-colors"
      aria-label="Cerrar aviso"
    >
      <PhX :size="20" />
    </button>

    <div class="flex items-start gap-3 pr-8">
      <PhWarning :size="24" class="text-yellow-500 flex-shrink-0 mt-0.5" />
      <div class="flex-1">
        <h3 class="text-yellow-400 font-bold text-[0.9rem] mb-1">Sitio NO oficial de {{ bankName }}</h3>
        <p class="text-white/80 text-[0.75rem] leading-relaxed mb-2">
          Este conversor <strong>no está afiliado, asociado ni respaldado</strong> por {{ bankName }}.
        </p>
        <p class="text-white/80 text-[0.75rem] leading-relaxed">
          Los datos pueden contener errores o estar desactualizados. <strong>No nos hacemos responsables</strong> por pérdidas derivadas del uso de esta información. Verifica siempre en <a :href="websiteUrl" target="_blank" rel="noopener" class="text-yellow-400 underline font-semibold">{{ bankName }}</a>
        </p>
      </div>
    </div>
  </div>
</template>
