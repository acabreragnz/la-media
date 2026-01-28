<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { BANKS } from '@/config/banks'
import { useBankCurrency } from '@/composables/currency/useBankCurrency'
import type { BankId } from '@/types/banks'
import { PhArrowLeft } from '@phosphor-icons/vue'
import { formatNumber } from '@/utils/formatters'

// Components
import BankViewSkeleton from '@/components/bank/BankViewSkeleton.vue'
import BankViewHeader from '@/components/bank/BankViewHeader.vue'
import BankAccentStripe from '@/components/bank/BankAccentStripe.vue'
import ExchangeRatesDisplay from '@/components/bank/ExchangeRatesDisplay.vue'
import ErrorBanner from '@/components/bank/ErrorBanner.vue'
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
  usdInputRef,
  uyuInputRef,
  setDirection,
  direction,
  refetch,
  shareViaWhatsApp,
  nextUpdateTime,
  lastScrapedAt,
} = useBankCurrency(props.bankId)

// Text selection state
const usdHadInitialSelect = ref(false)
const uyuHadInitialSelect = ref(false)

// Selection handlers
function selectUsdInput() {
  if (!usdHadInitialSelect.value) {
    usdInputRef.value?.select()
    usdHadInitialSelect.value = true
  }
}

function selectUyuInput() {
  if (!uyuHadInitialSelect.value) {
    uyuInputRef.value?.select()
    uyuHadInitialSelect.value = true
  }
}

// Focus/blur handlers
function onUsdFocus(event: FocusEvent) {
  setDirection('usdToUyu')
  usdHadInitialSelect.value = false
  const target = event.target as HTMLElement
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

function onUyuFocus(event: FocusEvent) {
  setDirection('uyuToUsd')
  uyuHadInitialSelect.value = false
  const target = event.target as HTMLElement
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

function onUsdBlur() {
  usdHadInitialSelect.value = false
}

function onUyuBlur() {
  uyuHadInitialSelect.value = false
}

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
      class="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-3 py-2 back-button-gradient backdrop-blur-lg rounded-full text-sm transition-all hover:scale-105 border border-white/10 hover:border-[rgba(var(--bank-accent-rgb),0.3)] back-button"
    >
      <PhArrowLeft :size="16" weight="bold" class="back-button-icon" />
      <span class="hidden sm:inline back-button-text">Otros bancos</span>
    </RouterLink>

    <div class="w-full max-w-[440px]">
      <!-- Loading State: Full skeleton with header and stripe -->
      <div v-if="loading && !rates" class="space-y-5">
        <div class="space-y-2">
          <BankViewHeader :bank-id="bankId" />
          <BankAccentStripe />
        </div>
        <BankViewSkeleton :bank-id="bankId" />
      </div>

      <!-- Content or Error State -->
      <div v-else class="space-y-5">
        <div class="space-y-2">
          <BankViewHeader :bank-id="bankId" />
          <BankAccentStripe />
        </div>

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

          <BankAccentStripe />

          <!-- USD Input -->
          <label
            @click="selectUsdInput"
            class="card-gradient border border-white/[0.08] rounded-[20px] p-5 flex items-center gap-4 transition-all cursor-text bank-input-focus"
          >
            <span class="text-[2.25rem] leading-none">🇺🇸</span>
            <span class="flex-1 flex flex-col gap-1">
              <span class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
                Dólares
              </span>
              <input
                ref="usdInputRef"
                type="text"
                inputmode="decimal"
                autofocus
                class="w-full bg-transparent border-none text-white text-[1.75rem] font-semibold tracking-tight outline-none"
                placeholder="0,00"
                @focus="onUsdFocus"
                @blur="onUsdBlur"
              />
            </span>
          </label>

          <!-- Dynamic Rate Display (between inputs) -->
          <div v-if="rates" class="text-center text-white/50 text-sm py-2">
            <span v-if="direction === 'usdToUyu'">
              1 USD = <span class="text-[var(--bank-accent)] font-medium">{{ formatNumber(rates.average) }}</span> UYU
            </span>
            <span v-else>
              1 UYU = <span class="text-[var(--bank-accent)] font-medium">{{ formatNumber(1 / rates.average) }}</span> USD
            </span>
          </div>

          <!-- UYU Input -->
          <label
            @click="selectUyuInput"
            class="card-gradient border border-white/[0.08] rounded-[20px] p-5 flex items-center gap-4 transition-all cursor-text bank-input-focus"
          >
            <span class="text-[2.25rem] leading-none">🇺🇾</span>
            <span class="flex-1 flex flex-col gap-1">
              <span class="text-white/60 text-[0.7rem] uppercase tracking-wider font-medium">
                Pesos
              </span>
              <input
                ref="uyuInputRef"
                type="text"
                inputmode="decimal"
                class="w-full bg-transparent border-none text-white text-[1.75rem] font-semibold tracking-tight outline-none"
                placeholder="0,00"
                @focus="onUyuFocus"
                @blur="onUyuBlur"
              />
            </span>
          </label>

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

      <!-- Footer -->
      <footer class="mt-8 space-y-4">
        <!-- Logo con link al home -->
        <RouterLink to="/" class="block group" aria-label="Volver al inicio">
          <img
            src="/assets/brand/logo-full.webp"
            alt="La Media"
            class="h-12 w-auto mx-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
        </RouterLink>

        <!-- Credits -->
        <div class="text-center text-white/60 text-[0.8rem]">
          Hecho con 💙 por
          <a
            href="https://github.com/acabreragnz"
            target="_blank"
            rel="noopener"
            class="no-underline font-medium transition-colors bank-footer-link"
          >
            @acabreragnz
          </a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Card gradient background (same as exchange rates card) */
.card-gradient {
  background: linear-gradient(
    135deg,
    rgba(var(--bank-primary-rgb), 0.05) 0%,
    rgba(var(--bank-primary-light-rgb), 0.03) 100%
  );
}

/* Back button gradient */
.back-button-gradient {
  background: linear-gradient(
    135deg,
    rgba(var(--bank-primary-rgb), 0.08) 0%,
    rgba(var(--bank-primary-light-rgb), 0.05) 100%
  );
}

/* Back button icon and text with bank accent color */
.back-button-icon,
.back-button-text {
  color: var(--bank-accent);
  filter: brightness(1.3); /* Brighter for better contrast on dark background */
}

.back-button:hover .back-button-icon,
.back-button:hover .back-button-text {
  filter: brightness(1.5);
}

/* Input focus styles (matching main branch) */
.bank-input-focus:focus-within {
  border-color: rgba(var(--bank-primary-light-rgb), 0.6);
  background-color: rgba(var(--bank-primary-rgb), 0.06);
  box-shadow: 0 0 30px rgba(var(--bank-primary-rgb), 0.25);
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
