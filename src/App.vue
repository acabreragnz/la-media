<script setup lang="ts">
import { onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useCurrency } from '@/composables/useCurrency'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import CurrencyValue from '@/components/CurrencyValue.vue'
import { AlertTriangle, RefreshCw, X } from 'lucide-vue-next'

const {
  rates,
  loading,
  error,
  inputRef,
  numberValue,
  direction,
  convertedAmount,
  fetchRates,
  swapDirection,
  shareViaWhatsApp
} = useCurrency()

// Detectar dispositivos de baja gama
const { isLowEndDevice } = useDeviceDetection()

// Estado del disclaimer con VueUse
const disclaimerDismissed = useLocalStorage('broumedia_disclaimer_dismissed', false)

// Formatear número sin animación para dispositivos de baja gama
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

onMounted(() => {
  fetchRates()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background: linear-gradient(135deg, #0a0e1f 0%, #0f1a2e 30%, #0d2744 60%, #08528D 100%);">
    <div class="w-full max-w-[440px]">
      <!-- Loading State -->
      <div v-if="loading && !rates" class="space-y-5">
        <!-- Header skeleton -->
        <div class="text-center mb-7">
          <div class="h-8 bg-white/[0.1] rounded-lg w-48 mx-auto animate-pulse"></div>
        </div>

        <!-- Línea amarilla decorativa -->
        <div class="h-[2px] bg-white/[0.05] rounded animate-pulse"></div>

        <!-- Exchange Rates skeleton -->
        <div class="space-y-2">
          <div class="bg-white/[0.04] rounded-xl px-5 py-3.5 border border-white/[0.05] animate-pulse">
            <div class="flex items-center justify-center gap-3 mb-3">
              <div class="h-5 bg-white/[0.1] rounded w-20"></div>
              <div class="h-5 bg-brou-yellow/20 rounded w-24"></div>
              <div class="h-5 bg-white/[0.1] rounded w-20"></div>
            </div>
            <div class="border-t border-white/[0.05] pt-3">
              <div class="h-3 bg-white/[0.08] rounded w-40 mx-auto"></div>
            </div>
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
          <div class="w-12 h-12 bg-gradient-to-br from-brou-blue/50 to-brou-blue-light/50 rounded-full animate-pulse"></div>
        </div>

        <!-- Result Display skeleton -->
        <div class="bg-gradient-to-br from-brou-blue/10 to-brou-blue-light/8 border border-brou-blue-light/20 rounded-[20px] p-5 animate-pulse">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 bg-white/[0.1] rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-white/[0.08] rounded w-20"></div>
              <div class="h-7 bg-white/[0.1] rounded w-40"></div>
            </div>
          </div>
        </div>

        <!-- Footer skeleton -->
        <div class="bg-white/[0.03] backdrop-blur-lg rounded-2xl p-5 border border-white/[0.08] animate-pulse">
          <div class="space-y-4">
            <div class="h-4 bg-white/[0.08] rounded w-48 mx-auto"></div>
            <div class="h-3 bg-white/[0.06] rounded w-32 mx-auto"></div>
            <div class="h-10 bg-gradient-to-br from-brou-blue/30 to-brou-blue-light/30 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white/[0.03] backdrop-blur-lg rounded-2xl p-6 border border-white/[0.08]">
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <AlertTriangle :size="64" class="text-yellow-400" />
          </div>
          <h2 class="text-xl font-bold text-white mb-2">Error al cargar cotizaciones</h2>
          <p class="text-white/80 mb-4">{{ error }}</p>
          <button
            @click="fetchRates"
            class="bg-gradient-to-br from-brou-blue to-brou-blue-light text-white font-semibold py-2 px-6 rounded-lg transition-all hover:scale-105 shadow-[0_8px_20px_rgba(8,82,141,0.5)]"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-5">
        <!-- Header -->
        <div class="text-center mb-5">
          <h1 class="text-[1.35rem] font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Media dólar eBROU
          </h1>
        </div>

        <!-- Disclaimer Legal -->
        <div v-if="!disclaimerDismissed" class="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-4 mb-5 relative">
          <!-- Botón cerrar -->
          <button
            @click="disclaimerDismissed = true"
            class="absolute top-3 right-3 text-white/50 hover:text-white/90 transition-colors"
            aria-label="Cerrar aviso"
          >
            <X :size="20" />
          </button>

          <div class="flex items-start gap-3 pr-8">
            <AlertTriangle :size="24" class="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <h3 class="text-yellow-400 font-bold text-[0.9rem] mb-1">Sitio NO oficial del BROU</h3>
              <p class="text-white/80 text-[0.75rem] leading-relaxed mb-2">
                Este conversor <strong>no está afiliado, asociado ni respaldado</strong> por el Banco de la República Oriental del Uruguay (BROU).
              </p>
              <p class="text-white/80 text-[0.75rem] leading-relaxed">
                Los datos pueden contener errores o estar desactualizados. <strong>No nos hacemos responsables</strong> por pérdidas derivadas del uso de esta información. Verifica siempre en <a href="https://www.brou.com.uy/cotizaciones" target="_blank" rel="noopener" class="text-yellow-400 underline font-semibold">brou.com.uy</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Subtle yellow accent stripe (eBROU brand) -->
        <div class="relative h-[2px] mb-6 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-brou-yellow/60 to-transparent blur-[1px]"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-brou-yellow/40 to-transparent"></div>
        </div>

        <!-- Exchange Rates Display -->
        <div class="space-y-2">
          <div class="bg-white/[0.04] rounded-xl px-5 py-3.5 text-sm border border-white/[0.05]">
            <div class="flex items-center justify-center gap-1.5">
              <!-- Compra -->
              <div class="flex items-center gap-1 text-white/70">
                <span>Compra</span>
                <span v-if="rates" class="text-white font-semibold">
                  {{ formatNumber(rates.compra) }}
                </span>
              </div>

              <span class="text-white/15 text-[0.5rem]">●</span>

              <!-- Media (highlighted with eBROU yellow) -->
              <div class="flex items-center gap-1 bg-brou-yellow/25 px-2.5 py-2 rounded-lg -my-1 mx-0.5 border-2 border-brou-yellow/40 shadow-[0_0_20px_rgba(255,203,5,0.15)]">
                <span class="text-white/85">Media</span>
                <span v-if="rates" class="text-brou-yellow font-bold">
                  {{ formatNumber(rates.media) }}
                </span>
              </div>

              <span class="text-white/15 text-[0.5rem]">●</span>

              <!-- Venta -->
              <div class="flex items-center gap-1 text-white/70">
                <span>Venta</span>
                <span v-if="rates" class="text-white font-semibold">
                  {{ formatNumber(rates.venta) }}
                </span>
              </div>
            </div>

            <!-- Disclaimer sutil dentro de la card (solo cuando el disclaimer principal está cerrado) -->
            <div v-if="disclaimerDismissed" class="text-center text-[0.6rem] text-white/50 leading-relaxed mt-3.5 pt-3.5 border-t border-white/[0.05]">
              ⚠️ Sitio no oficial. <a href="https://www.brou.com.uy/cotizaciones" target="_blank" rel="noopener" class="text-yellow-400/80 hover:text-yellow-400 hover:underline">Verificar en brou.com.uy</a>
            </div>
          </div>
        </div>

        <!-- Currency Input -->
        <div class="bg-white/[0.05] border border-white/[0.08] rounded-[20px] p-5 flex items-center gap-4 transition-all focus-within:border-brou-blue-light/60 focus-within:bg-brou-blue/[0.06] focus-within:shadow-[0_0_30px_rgba(8,82,141,0.25)]">
          <span class="text-[2.25rem] leading-none">{{ direction === 'usdToUyu' ? '🇺🇸' : '🇺🇾' }}</span>
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
              {{ direction === 'usdToUyu' ? 'Dólares (USD)' : 'Pesos (UYU)' }}
            </label>
            <input
              ref="inputRef"
              type="text"
              autofocus
              class="w-full bg-transparent border-none text-white text-[1.75rem] font-semibold tracking-tight outline-none"
              placeholder="0,00"
            />
          </div>
        </div>

        <!-- Swap Button -->
        <div class="flex justify-center my-4">
          <button
            @click="swapDirection"
            class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brou-blue to-brou-blue-light rounded-full border-none cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-[0_8px_20px_rgba(8,82,141,0.5),0_0_40px_rgba(13,94,161,0.3)] hover:shadow-[0_12px_30px_rgba(8,82,141,0.7),0_0_60px_rgba(13,94,161,0.5)]"
            aria-label="Intercambiar monedas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5.5 h-5.5 text-white transition-transform duration-400 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <!-- Result Display -->
        <div class="bg-gradient-to-br from-brou-blue/10 to-brou-blue-light/8 border border-brou-blue-light/20 rounded-[20px] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_40px_rgba(8,82,141,0.15)] flex items-center gap-4">
          <span class="text-[2.25rem] leading-none">{{ direction === 'usdToUyu' ? '🇺🇾' : '🇺🇸' }}</span>
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
              {{ direction === 'usdToUyu' ? 'Pesos (UYU)' : 'Dólares (USD)' }}
            </label>
            <div class="text-white text-[1.75rem] font-semibold tracking-tight">
              <CurrencyValue v-if="!isLowEndDevice" :value="convertedAmount" />
              <span v-else>{{ formatNumber(convertedAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-white/[0.03] backdrop-blur-lg rounded-2xl p-5 border border-white/[0.08]">
          <!-- Conversion rate info -->
          <div class="text-center text-white/70 text-[0.85rem] mb-4 pt-1">
            1 {{ direction === 'usdToUyu' ? 'USD' : 'UYU' }} = {{ direction === 'usdToUyu' ? rates?.media.toFixed(2) : (1 / (rates?.media || 1)).toFixed(4) }} {{ direction === 'usdToUyu' ? 'UYU' : 'USD' }}
          </div>

          <!-- Last update + refresh button -->
          <div class="flex items-center justify-center gap-2 mb-4 text-[0.75rem] text-white/60">
            <span v-if="rates">{{ new Date(rates.timestamp).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short', hour12: false }) }}</span>
            <button
              @click="fetchRates"
              :disabled="loading"
              class="bg-transparent border-none text-white/30 cursor-pointer p-2 rounded transition-all hover:text-white/60 hover:bg-white/[0.05] disabled:opacity-50"
              :class="{ 'animate-spin': loading }"
              aria-label="Actualizar cotizaciones"
            >
              <RefreshCw :size="14" />
            </button>
          </div>

          <!-- WhatsApp share button -->
          <button
            @click="shareViaWhatsApp"
            class="flex items-center justify-center gap-2 w-full py-3 px-5 bg-gradient-to-br from-brou-blue to-brou-blue-light border border-brou-blue-light/20 rounded-xl text-white text-[0.85rem] font-semibold cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(8,82,141,0.5),0_0_40px_rgba(13,94,161,0.3)]"
            aria-label="Compartir en WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            Compartir {{ numberValue ? 'conversión' : 'cotización' }}
          </button>
        </div>
      </div>

      <!-- Footer Credits -->
      <div class="text-center mt-6 text-white/60 text-[0.8rem]">
        Hecho con 💙 por
        <a href="https://github.com/acabreragnz"
           target="_blank"
           rel="noopener"
           class="text-brou-blue-light/90 no-underline font-medium transition-colors hover:text-brou-yellow hover:underline decoration-brou-yellow decoration-2">
          @acabreragnz
        </a>
      </div>
    </div>
  </div>
</template>
