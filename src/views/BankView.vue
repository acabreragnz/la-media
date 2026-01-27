<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import { BANKS } from '@/config/banks'
import { useBrouCurrency } from '@/composables/currency/useBrouCurrency'
import { useItauCurrency } from '@/composables/currency/useItauCurrency'
import CurrencyValue from '@/components/CurrencyValue.vue'
import ItauLogo from '@/components/ItauLogo.vue'
import { PhX, PhClock, PhWarning, PhArrowSquareOut, PhArrowLeft } from '@phosphor-icons/vue'
import { formatNumber } from '@/utils/formatters'

// Props
const props = defineProps<{
  bankId: 'brou' | 'itau' | 'santander' | 'bbva' | 'bcu'
}>()

// Obtener configuración del banco
const bank = computed(() => {
  const bankConfig = BANKS[props.bankId]
  if (!bankConfig) {
    throw new Error(`Bank configuration not found for: ${props.bankId}`)
  }
  return bankConfig
})

// Seleccionar composable según el banco (fallback para bancos sin scraper)
const currencyComposable = computed(() => {
  switch (props.bankId) {
    case 'brou':
      return useBrouCurrency()
    case 'itau':
      return useItauCurrency()
    case 'santander':
      // Fallback: usa el endpoint de BROU en dev
      return useBrouCurrency()
    case 'bbva':
      // Fallback: usa el endpoint de Itaú en dev
      return useItauCurrency()
    case 'bcu':
      // Fallback: usa el endpoint de BROU en dev
      return useBrouCurrency()
    default:
      return useBrouCurrency()
  }
}).value

const {
  rates,
  loading,
  isFetching,
  error,
  inputRef,
  direction,
  convertedAmount,
  refetch,
  swapDirection,
  shareViaWhatsApp,
  nextUpdateTime,
  lastScrapedAt
} = currencyComposable

// Detectar dispositivos de baja gama
const { isLowEndDevice } = useDeviceDetection()

// Seleccionar todo el texto del input al hacer click en la card
function selectInputText() {
  inputRef.value?.select()
}

// Autofocus cuando los datos se cargan (para navegación SPA)
watch(() => rates.value, async (newRates) => {
  if (newRates && inputRef.value) {
    await nextTick()
    inputRef.value.focus()
  }
}, { immediate: true })

// Feature flags
const DISCLAIMER_ENABLED = false

// Estado del disclaimer con VueUse (único por banco)
const disclaimerDismissed = useLocalStorage(`${props.bankId}media_disclaimer_dismissed`, false)
</script>

<template>
  <div :data-bank="bankId" class="min-h-dvh flex justify-center p-4 app-gradient">
    <!-- Back button -->
    <RouterLink
      to="/"
      class="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-3 py-2
             bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-lg rounded-full
             text-white/70 hover:text-white text-sm transition-all hover:scale-105
             border border-white/10 hover:border-[rgba(var(--bank-accent-rgb),0.3)]"
    >
      <PhArrowLeft :size="16" weight="bold" />
      <span class="hidden sm:inline">Otros bancos</span>
    </RouterLink>

    <div class="w-full max-w-[440px]">
      <!-- Loading State -->
      <div v-if="loading && !rates" class="space-y-5">
        <!-- Header (siempre visible, no skeleton) -->
        <div class="flex items-center justify-center gap-3 mb-7">
          <a :href="bank.websiteUrl" target="_blank" rel="noopener noreferrer" class="hover:opacity-80 transition-opacity">
            <!-- Logo inline para Itaú (usa currentColor) -->
            <ItauLogo v-if="bankId === 'itau'" class="h-10 w-auto" style="color: var(--bank-accent)" />
            <!-- Logo img para otros bancos -->
            <img v-else :src="bank.logoUrl" :alt="bank.name" class="h-10 w-auto" />
          </a>
          <h1 class="text-[1.6rem] font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {{ bank.displayName }}
          </h1>
        </div>

        <!-- Subtle accent stripe (siempre visible, no skeleton) -->
        <div class="relative h-[2px] mb-6 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(var(--bank-accent-rgb),0.6)] to-transparent blur-[1px]"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(var(--bank-accent-rgb),0.4)] to-transparent"></div>
        </div>

        <!-- Exchange Rates skeleton -->
        <div class="space-y-2">
          <div class="bg-white/[0.04] rounded-xl px-5 py-3 border border-white/[0.05] animate-pulse relative">
            <div class="flex items-center justify-center gap-3">
              <!-- Compra skeleton -->
              <div class="flex flex-col items-center gap-1">
                <div class="h-2 bg-white/[0.08] rounded w-12"></div>
                <div class="h-4 bg-white/[0.1] rounded w-14"></div>
              </div>
              <!-- Separador -->
              <div class="h-4 bg-white/[0.05] rounded w-1"></div>
              <!-- Media skeleton -->
              <div class="flex flex-col items-center gap-1">
                <div class="h-2.5 bg-white/[0.08] rounded w-10"></div>
                <div class="h-7 bg-[rgba(var(--bank-accent-rgb),0.2)] rounded w-16"></div>
              </div>
              <!-- Separador -->
              <div class="h-4 bg-white/[0.05] rounded w-1"></div>
              <!-- Venta skeleton -->
              <div class="flex flex-col items-center gap-1">
                <div class="h-2 bg-white/[0.08] rounded w-12"></div>
                <div class="h-4 bg-white/[0.1] rounded w-14"></div>
              </div>
            </div>
            <!-- Bank link skeleton -->
            <div class="absolute bottom-2 right-2 h-3 bg-white/[0.06] rounded w-12"></div>
          </div>
        </div>

        <!-- Currency Input skeleton -->
        <div class="bg-white/[0.05] border border-white/[0.08] rounded-[20px] p-5 animate-pulse">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 bg-white/10 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-white/[0.08] rounded w-20"></div>
              <div class="h-7 bg-white/[0.1] rounded w-32"></div>
            </div>
          </div>
        </div>

        <!-- Swap button skeleton -->
        <div class="flex justify-center my-4">
          <div class="w-12 h-12 rounded-full animate-pulse"
               style="background: linear-gradient(to bottom right, var(--bank-primary), var(--bank-primary-light)); opacity: 0.5;"></div>
        </div>

        <!-- Result Display skeleton -->
        <div class="rounded-[20px] p-5 animate-pulse"
             style="background: linear-gradient(to bottom right, rgba(var(--bank-primary-rgb), 0.1), rgba(var(--bank-primary-light-rgb), 0.08)); border: 1px solid rgba(var(--bank-primary-light-rgb), 0.2);">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 bg-white/[0.1] rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-white/[0.08] rounded w-20"></div>
              <div class="h-7 bg-white/[0.1] rounded w-40"></div>
            </div>
          </div>
        </div>

        <!-- Footer skeleton -->
        <div class="bg-white/[0.03] backdrop-blur-lg rounded-2xl p-4 border border-white/[0.08] animate-pulse">
          <div class="space-y-3">
            <!-- Stats skeleton (Última / Próxima) -->
            <div class="h-3 bg-white/[0.06] rounded w-48 mx-auto"></div>
            <!-- Share button skeleton -->
            <div class="h-10 rounded-xl"
                 style="background: rgba(var(--bank-primary-rgb), 0.05); border: 1px solid rgba(var(--bank-primary-light-rgb), 0.2);"></div>
          </div>
        </div>
      </div>

      <!-- Content or Error State -->
      <div v-else class="space-y-5">
        <!-- Header (siempre visible) -->
        <div class="flex items-center justify-center gap-3 mb-7">
          <a :href="bank.websiteUrl" target="_blank" rel="noopener noreferrer" class="hover:opacity-80 transition-opacity">
            <!-- Logo inline para Itaú (usa currentColor) -->
            <ItauLogo v-if="bankId === 'itau'" class="h-10 w-auto" style="color: var(--bank-accent)" />
            <!-- Logo img para otros bancos -->
            <img v-else :src="bank.logoUrl" :alt="bank.name" class="h-10 w-auto" />
          </a>
          <h1 class="text-[1.6rem] font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {{ bank.displayName }}
          </h1>
        </div>

        <!-- Subtle accent stripe (siempre visible) -->
        <div class="relative h-[2px] mb-6 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(var(--bank-accent-rgb),0.6)] to-transparent blur-[1px]"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(var(--bank-accent-rgb),0.4)] to-transparent"></div>
        </div>

        <!-- Error Banner (para cualquier error) -->
        <div v-if="error" class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-3">
          <PhWarning :size="20" class="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-yellow-200 text-[0.8rem] font-medium mb-1">
              {{ rates ? 'Problemas para actualizar' : 'Error al cargar cotizaciones' }}
            </p>
            <p class="text-white/70 text-[0.7rem] leading-relaxed">
              {{ rates ? `No pudimos obtener datos actualizados de ${bank.name}. Mostrando última cotización disponible.` : error }}
            </p>
          </div>
          <button
            @click="() => refetch()"
            class="text-yellow-300 hover:text-yellow-100 text-[0.7rem] font-medium underline flex-shrink-0"
            :disabled="isFetching"
          >
            {{ isFetching ? 'Reintentando...' : 'Reintentar' }}
          </button>
        </div>

        <!-- Skeletons SOLO cuando está cargando SIN error -->
        <template v-if="!rates && !error">
          <!-- Exchange Rates skeleton -->
          <div class="space-y-2">
            <div class="bg-white/[0.04] rounded-xl px-5 py-3 border border-white/[0.05] animate-pulse relative">
              <div class="flex items-center justify-center gap-3">
                <!-- Compra skeleton -->
                <div class="flex flex-col items-center gap-1">
                  <div class="h-2 bg-white/[0.08] rounded w-12"></div>
                  <div class="h-4 bg-white/[0.1] rounded w-14"></div>
                </div>
                <!-- Separador -->
                <div class="h-4 bg-white/[0.05] rounded w-1"></div>
                <!-- Media skeleton -->
                <div class="flex flex-col items-center gap-1">
                  <div class="h-2.5 bg-white/[0.08] rounded w-10"></div>
                  <div class="h-7 bg-[rgba(var(--bank-accent-rgb),0.2)] rounded w-16"></div>
                </div>
                <!-- Separador -->
                <div class="h-4 bg-white/[0.05] rounded w-1"></div>
                <!-- Venta skeleton -->
                <div class="flex flex-col items-center gap-1">
                  <div class="h-2 bg-white/[0.08] rounded w-12"></div>
                  <div class="h-4 bg-white/[0.1] rounded w-14"></div>
                </div>
              </div>
              <!-- Bank link skeleton -->
              <div class="absolute bottom-2 right-2 h-3 bg-white/[0.06] rounded w-12"></div>
            </div>
          </div>

          <!-- Currency Input skeleton -->
          <div class="bg-white/[0.05] border border-white/[0.08] rounded-[20px] p-5 animate-pulse">
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 bg-white/[0.1] rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-white/[0.08] rounded w-20"></div>
                <div class="h-7 bg-white/[0.1] rounded w-32"></div>
              </div>
            </div>
          </div>

          <!-- Swap button skeleton -->
          <div class="flex justify-center my-4">
            <div class="w-12 h-12 rounded-full animate-pulse"
                 style="background: linear-gradient(to bottom right, var(--bank-primary), var(--bank-primary-light)); opacity: 0.5;"></div>
          </div>

          <!-- Result Display skeleton -->
          <div class="rounded-[20px] p-5 animate-pulse"
               style="background: linear-gradient(to bottom right, rgba(var(--bank-primary-rgb), 0.1), rgba(var(--bank-primary-light-rgb), 0.08)); border: 1px solid rgba(var(--bank-primary-light-rgb), 0.2);">
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 bg-white/[0.1] rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-white/[0.08] rounded w-20"></div>
                <div class="h-7 bg-white/[0.1] rounded w-40"></div>
              </div>
            </div>
          </div>

          <!-- Footer skeleton -->
          <div class="bg-white/[0.03] backdrop-blur-lg rounded-2xl p-4 border border-white/[0.08] animate-pulse">
            <div class="space-y-3">
              <!-- Stats skeleton (Última / Próxima) -->
              <div class="h-3 bg-white/[0.06] rounded w-48 mx-auto"></div>
              <!-- Share button skeleton -->
              <div class="h-10 rounded-xl"
                   style="background: rgba(var(--bank-primary-rgb), 0.05); border: 1px solid rgba(var(--bank-primary-light-rgb), 0.2);"></div>
            </div>
          </div>
        </template>

        <!-- Contenido cuando HAY datos -->
        <template v-else>
        <!-- Disclaimer Legal -->
        <div v-if="DISCLAIMER_ENABLED && !disclaimerDismissed" class="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4 mb-5 relative">
          <!-- Botón cerrar -->
          <button
            @click="disclaimerDismissed = true"
            class="absolute top-3 right-3 text-white/50 hover:text-white/90 transition-colors"
            aria-label="Cerrar aviso"
          >
            <PhX :size="20" />
          </button>

          <div class="flex items-start gap-3 pr-8">
            <PhWarning :size="24" class="text-yellow-500 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <h3 class="text-yellow-400 font-bold text-[0.9rem] mb-1">Sitio NO oficial de {{ bank.name }}</h3>
              <p class="text-white/80 text-[0.75rem] leading-relaxed mb-2">
                Este conversor <strong>no está afiliado, asociado ni respaldado</strong> por {{ bank.name }}.
              </p>
              <p class="text-white/80 text-[0.75rem] leading-relaxed">
                Los datos pueden contener errores o estar desactualizados. <strong>No nos hacemos responsables</strong> por pérdidas derivadas del uso de esta información. Verifica siempre en <a :href="bank.websiteUrl" target="_blank" rel="noopener" class="text-yellow-400 underline font-semibold">{{ bank.name }}</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Exchange Rates Display -->
        <div class="space-y-2">
          <div class="bg-white/[0.04] rounded-xl px-5 py-3 text-sm border border-white/[0.05] relative">
            <!-- Tres columnas: Compra • Media • Venta -->
            <div class="flex items-center justify-center gap-3">
              <!-- Compra -->
              <div class="flex flex-col items-center text-xs text-white/70">
                <span class="text-white/50 text-[0.65rem] uppercase tracking-wider">Compra</span>
                <strong v-if="rates" class="text-white text-sm">{{ formatNumber(rates.buy) }}</strong>
              </div>

              <!-- Separador -->
              <span class="text-white/20 text-lg">•</span>

              <!-- Media (centro, destacado) -->
              <div class="flex flex-col items-center">
                <span class="text-xs uppercase tracking-wider font-medium" style="color: rgba(var(--bank-accent-rgb), 0.8)">Media</span>
                <span v-if="rates" class="font-bold text-2xl" style="color: var(--bank-accent)">
                  {{ formatNumber(rates.average) }}
                </span>
              </div>

              <!-- Separador -->
              <span class="text-white/20 text-lg">•</span>

              <!-- Venta -->
              <div class="flex flex-col items-center text-xs text-white/70">
                <span class="text-white/50 text-[0.65rem] uppercase tracking-wider">Venta</span>
                  <strong v-if="rates" class="text-white text-sm">{{ formatNumber(rates.sell) }}</strong>
              </div>
            </div>

            <!-- Enlace banco -->
            <a
              :href="bank.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="absolute bottom-2 right-2 flex items-center gap-1 text-[0.65rem] text-white/30 hover:text-white/50 transition-colors"
            >
              <PhArrowSquareOut :size="12" weight="bold" />
              <span>{{ bank.name }}</span>
            </a>
          </div>
        </div>

        <!-- Currency Input -->
        <label
          @click="selectInputText"
          class="bg-white/[0.05] border border-white/[0.08] rounded-[20px] p-5 flex items-center gap-4 transition-all cursor-text bank-input-focus"
        >
          <span class="text-[2.25rem] leading-none">{{ direction === 'usdToUyu' ? '🇺🇸' : '🇺🇾' }}</span>
          <span class="flex-1 flex flex-col gap-1">
            <span class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
              {{ direction === 'usdToUyu' ? 'Dólares' : 'Pesos' }}
            </span>
            <input
              ref="inputRef"
              type="text"
              autofocus
              class="w-full bg-transparent border-none text-white text-[1.75rem] font-semibold tracking-tight outline-none"
              placeholder="0,00"
            />
          </span>
        </label>

        <!-- Swap Button -->
        <div class="flex justify-center my-4">
          <button
            @click="swapDirection"
            class="flex items-center justify-center w-12 h-12 rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 bank-swap-button"
            aria-label="Intercambiar monedas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5.5 h-5.5 text-white transition-transform duration-400 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <!-- Result Display -->
        <div class="rounded-[20px] p-5 flex items-center gap-4 bank-result-card">
          <span class="text-[2.25rem] leading-none">{{ direction === 'usdToUyu' ? '🇺🇾' : '🇺🇸' }}</span>
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
              {{ direction === 'usdToUyu' ? 'Pesos' : 'Dólares' }}
            </label>
            <div class="text-white text-[1.75rem] font-semibold tracking-tight">
              <CurrencyValue v-if="!isLowEndDevice" :value="convertedAmount" />
              <span v-else>{{ formatNumber(convertedAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-white/[0.03] backdrop-blur-lg rounded-2xl p-3 sm:p-4">
          <div class="text-center space-y-2.5">
            <!-- Stats inline con pipes (flex-wrap para móviles muy pequeños) -->
            <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[0.65rem] sm:text-xs text-white/60">
              <span class="flex items-center gap-1 whitespace-nowrap">
                <PhClock :size="12" />
                Última: {{ lastScrapedAt }}
              </span>
              <span class="text-white/30 hidden sm:inline">|</span>
              <span class="whitespace-nowrap">Próxima: {{ nextUpdateTime }}</span>
              <span v-if="isFetching" class="flex items-center gap-1 whitespace-nowrap">
                <span class="text-white/30 hidden sm:inline">|</span>
                <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizando...
              </span>
            </div>

            <!-- Disclaimer (más corto en móviles) -->
            <div v-if="DISCLAIMER_ENABLED" class="text-[0.55rem] sm:text-[0.6rem] text-white/60 flex items-start justify-center gap-1 leading-tight">
              <PhWarning :size="12" class="text-yellow-500/70 flex-shrink-0" />
              <span class="text-left sm:text-center">
                Sitio no oficial. <a :href="bank.websiteUrl" target="_blank" rel="noopener" class="hover:underline font-medium" style="color: rgba(var(--bank-accent-rgb), 0.8)">Verificar en {{ bank.name }}</a>
              </span>
            </div>

            <!-- WhatsApp share button -->
            <button
              @click="shareViaWhatsApp"
              class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-white text-[0.8rem] font-semibold cursor-pointer transition-all bank-share-button"
              aria-label="Compartir cotización por WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              Compartir cotización
            </button>
          </div>
        </div>
        </template>
      </div>

      <!-- Footer Credits -->
      <div class="text-center mt-6 text-white/60 text-[0.8rem]">
        Hecho con 💙 por
        <a href="https://github.com/acabreragnz"
           target="_blank"
           rel="noopener"
           class="no-underline font-medium transition-colors bank-footer-link">
          @acabreragnz
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Focus states usando CSS variables del banco */
.bank-input-focus:focus-within {
  border-color: rgba(var(--bank-primary-light-rgb), 0.6) !important;
  background-color: rgba(var(--bank-primary-rgb), 0.06) !important;
  box-shadow: 0 0 30px rgba(var(--bank-primary-rgb), 0.25) !important;
}

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

/* Result card con fondo del banco */
.bank-result-card {
  background: linear-gradient(to bottom right, rgba(var(--bank-primary-rgb), 0.1), rgba(var(--bank-primary-light-rgb), 0.08));
  border: 1px solid rgba(var(--bank-primary-light-rgb), 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 40px rgba(var(--bank-primary-rgb), 0.15);
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

/* Footer link */
.bank-footer-link {
  color: rgba(var(--bank-primary-light-rgb), 0.9);
}

.bank-footer-link:hover {
  color: var(--bank-accent);
  text-decoration: underline;
  text-decoration-color: var(--bank-accent);
  text-decoration-thickness: 2px;
}
</style>
