<script setup lang="ts">
import { BANKS_ARRAY } from '@/config/banks'
import ItauLogo from '@/components/ItauLogo.vue'
import { rgbaFromBank, getAccentColor, type BankId } from '@/utils/bank-colors'

// En modo dev, los bancos "próximamente" son clickeables
const isDev = import.meta.env.DEV
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center p-6 bg-gradient-to-br from-dark-bg-1 via-dark-bg-2 to-dark-bg-3">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          🏦 La Media
        </h1>
        <p class="text-white/60 text-base md:text-lg">
          Cotizaciones USD/UYU en tiempo real
        </p>
      </header>

      <!-- Grid de Bancos (centrado y balanceado) -->
      <div class="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        <!-- Bancos activos (con link) -->
        <RouterLink
          v-for="bank in BANKS_ARRAY.filter(b => !b.comingSoon)"
          :key="bank.id"
          :to="bank.route"
          class="group relative overflow-hidden bg-white/[0.03] backdrop-blur-lg
                 border border-white/[0.08] rounded-2xl p-6 md:p-8
                 transition-all duration-300
                 hover:bg-white/[0.06] hover:border-white/20 hover:scale-105
                 active:scale-95
                 w-[calc(50%-0.5rem)] md:w-[200px]"
        >
          <!-- Glow effect con color del banco -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
            :style="{
              background: `radial-gradient(circle at center, ${rgbaFromBank(bank.id as BankId, 0.2)}, transparent 70%)`
            }"
          ></div>

          <!-- Content -->
          <div class="relative z-10 flex flex-col items-center gap-3">
            <!-- Logo -->
            <div
              class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/[0.05] border border-white/[0.08]
                     flex items-center justify-center p-3
                     group-hover:border-white/20 transition-all"
              :style="{
                boxShadow: `0 0 20px ${rgbaFromBank(bank.id as BankId, 0.3)}`,
                color: getAccentColor(bank.id as BankId)
              }"
            >
              <!-- Logo inline para Itaú (usa currentColor) -->
              <ItauLogo v-if="bank.id === 'itau'" class="w-full h-full" />

              <!-- Logo img para otros bancos -->
              <img
                v-else
                :src="bank.logoUrl"
                :alt="bank.name"
                class="w-full h-full object-contain"
              />
            </div>

            <!-- Bank Name -->
            <h3
              class="text-lg md:text-xl font-bold text-center transition-colors"
              :style="{ color: getAccentColor(bank.id as BankId) }"
            >
              {{ bank.name }}
            </h3>

            <!-- CTA -->
            <div class="text-white/50 text-sm group-hover:text-white/80 transition-colors flex items-center gap-1">
              <span>Ver cotización</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </RouterLink>

        <!-- Bancos próximamente (clickeables solo en dev) -->
        <component
          :is="isDev ? 'RouterLink' : 'div'"
          v-for="bank in BANKS_ARRAY.filter(b => b.comingSoon)"
          :key="bank.id"
          :to="isDev ? bank.route : undefined"
          class="group relative overflow-hidden bg-white/[0.02] backdrop-blur-lg
                 border border-white/[0.05] rounded-2xl p-6 md:p-8
                 transition-all duration-300
                 w-[calc(50%-0.5rem)] md:w-[200px]"
          :class="[
            isDev
              ? 'hover:bg-white/[0.06] hover:border-white/20 hover:scale-105 active:scale-95 cursor-pointer opacity-80'
              : 'cursor-not-allowed opacity-60'
          ]"
        >
          <!-- Badge "Próximamente" o "DEV MODE" -->
          <div
            class="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
            :style="{
              background: rgbaFromBank(bank.id as BankId, 0.2),
              color: getAccentColor(bank.id as BankId),
              border: `1px solid ${rgbaFromBank(bank.id as BankId, 0.3)}`
            }"
          >
            {{ isDev ? 'Dev Mode' : 'Próximamente' }}
          </div>

          <!-- Glow effect en dev mode -->
          <div
            v-if="isDev"
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
            :style="{
              background: `radial-gradient(circle at center, ${rgbaFromBank(bank.id as BankId, 0.2)}, transparent 70%)`
            }"
          ></div>

          <!-- Content -->
          <div class="relative z-10 flex flex-col items-center gap-3">
            <!-- Logo -->
            <div
              class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05]
                     flex items-center justify-center p-3"
              :class="[isDev ? 'group-hover:border-white/20' : '']"
              :style="{
                boxShadow: `0 0 ${isDev ? '20' : '10'}px ${rgbaFromBank(bank.id as BankId, isDev ? 0.3 : 0.15)}`,
                color: getAccentColor(bank.id as BankId)
              }"
            >
              <img
                :src="bank.logoUrl"
                :alt="bank.name"
                class="w-full h-full object-contain"
                :class="[isDev ? '' : 'grayscale-[30%] opacity-70']"
              />
            </div>

            <!-- Bank Name -->
            <h3
              class="text-lg md:text-xl font-bold text-center"
              :style="{ color: getAccentColor(bank.id as BankId) }"
            >
              {{ bank.name }}
            </h3>

            <!-- CTA -->
            <div
              class="text-sm flex items-center gap-1"
              :class="[isDev ? 'text-white/50 group-hover:text-white/80' : 'text-white/30']"
            >
              <template v-if="isDev">
                <span>Ver demo</span>
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </template>
              <template v-else>
                <span>Próximamente</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </template>
            </div>
          </div>
        </component>
      </div>

      <!-- Footer -->
      <footer class="text-center mt-12 text-white/40 text-sm">
        <p>Datos obtenidos de los sitios oficiales de cada banco</p>
        <p class="mt-2">
          Hecho con 💙 por
          <a
            href="https://github.com/acabreragnz"
            target="_blank"
            rel="noopener"
            class="text-white/60 hover:text-white transition-colors underline"
          >
            @acabreragnz
          </a>
        </p>
      </footer>
    </div>
  </div>
</template>
