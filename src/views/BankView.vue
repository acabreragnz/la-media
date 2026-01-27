<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import { BANKS } from '@/config/banks'
import { useBankCurrency } from '@/composables/currency/useBankCurrency'
import type { BankId } from '@/utils/bank-colors'
import { PhArrowLeft } from '@phosphor-icons/vue'

// Components
import BankViewSkeleton from '@/components/bank/BankViewSkeleton.vue'
import BankViewHeader from '@/components/bank/BankViewHeader.vue'
import BankAccentStripe from '@/components/bank/BankAccentStripe.vue'
import ExchangeRatesDisplay from '@/components/bank/ExchangeRatesDisplay.vue'
import ErrorBanner from '@/components/bank/ErrorBanner.vue'
import CurrencyInput from '@/components/bank/CurrencyInput.vue'
import SwapButton from '@/components/bank/SwapButton.vue'
import ConversionResult from '@/components/bank/ConversionResult.vue'
import BankFooter from '@/components/bank/BankFooter.vue'
import DisclaimerBanner from '@/components/bank/DisclaimerBanner.vue'

// Props
const props = defineProps<{
  bankId: BankId
}>()

// Obtener configuración del banco
const bank = computed(() => {
  const bankConfig = BANKS[props.bankId]
  if (!bankConfig) {
    throw new Error(`Bank configuration not found for: ${props.bankId}`)
  }
  return bankConfig
})

// Use centralized bank selector
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
} = useBankCurrency(props.bankId)

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
      <!-- Loading State: Full skeleton with header and stripe -->
      <div v-if="loading && !rates" class="space-y-5">
        <BankViewHeader :bank-id="bankId" />
        <BankAccentStripe />
        <BankViewSkeleton :bank-id="bankId" />
      </div>

      <!-- Content or Error State -->
      <div v-else class="space-y-5">
        <BankViewHeader :bank-id="bankId" />
        <BankAccentStripe />

        <ErrorBanner
          v-if="error"
          :error="error"
          :has-rates="!!rates"
          :bank-name="bank.name"
          :is-fetching="isFetching"
          @retry="refetch"
        />

        <!-- Skeletons SOLO cuando está cargando SIN error -->
        <BankViewSkeleton v-if="!rates && !error" :bank-id="bankId" show-only-content />

        <!-- Contenido cuando HAY datos -->
        <template v-else>
          <DisclaimerBanner
            v-if="DISCLAIMER_ENABLED && !disclaimerDismissed"
            :bank-name="bank.name"
            :website-url="bank.websiteUrl"
            @dismiss="disclaimerDismissed = true"
          />

          <ExchangeRatesDisplay :rates="rates" :bank-id="bankId" />

          <CurrencyInput
            :direction="direction"
            :input-ref="inputRef"
            @click="selectInputText"
          />

          <SwapButton @swap="swapDirection" />

          <ConversionResult
            :direction="direction"
            :converted-amount="convertedAmount"
            :is-low-end-device="isLowEndDevice"
          />

          <BankFooter
            :last-scraped-at="lastScrapedAt"
            :next-update-time="nextUpdateTime"
            :is-fetching="isFetching"
            :disclaimer-enabled="DISCLAIMER_ENABLED"
            :bank-name="bank.name"
            :website-url="bank.websiteUrl"
            @share="shareViaWhatsApp"
          />
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
