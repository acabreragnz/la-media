<script setup lang="ts">
import { BANKS_ARRAY } from '@/config/banks'
import ItauLogo from '@/components/ItauLogo.vue'

// En modo dev, los bancos "próximamente" son clickeables
const isDev = import.meta.env.DEV
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center p-6 app-gradient">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <header class="text-center mb-12">
        <img
          src="/assets/brand/logo-full.webp"
          alt="La Media"
          class="h-16 md:h-20 w-auto mx-auto mb-4"
        />
        <p class="text-white/60 text-base md:text-lg">Cotizaciones USD/UYU actualizadas</p>
      </header>

      <!-- Grid de Bancos (centrado y balanceado) -->
      <div class="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        <!-- Bancos activos (con link) -->
        <RouterLink
          v-for="bank in BANKS_ARRAY.filter((b) => !b.comingSoon)"
          :key="bank.id"
          :to="bank.route"
          :data-bank="bank.id"
          class="group relative overflow-hidden bank-card-gradient backdrop-blur-lg rounded-2xl p-6 md:p-8 hover:scale-105 active:scale-95 w-[calc(50%-0.5rem)] sm:w-[180px] md:w-[200px] bank-card"
        >
          <!-- Glow effect con color del banco -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bank-glow"
          ></div>

          <!-- Content -->
          <div class="relative z-10 flex flex-col items-center gap-3">
            <!-- Logo -->
            <div
              class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center p-3 group-hover:border-white/20 transition-all bank-logo"
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
            <h3 class="text-lg md:text-xl font-bold text-center transition-colors bank-name">
              {{ bank.name }}
            </h3>

            <!-- CTA -->
            <div
              class="text-white/50 text-sm group-hover:text-white/80 transition-colors flex items-center gap-1"
            >
              <span>Ver cotización</span>
              <svg
                class="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </RouterLink>

        <!-- Bancos próximamente (clickeables solo en dev) -->
        <component
          :is="isDev ? 'RouterLink' : 'div'"
          v-for="bank in BANKS_ARRAY.filter((b) => b.comingSoon)"
          :key="bank.id"
          :data-bank="bank.id"
          :to="isDev ? bank.route : undefined"
          :class="[
            'group relative overflow-hidden backdrop-blur-lg rounded-2xl p-6 md:p-8 w-[calc(50%-0.5rem)] sm:w-[180px] md:w-[200px]',
            isDev
              ? 'bank-card-gradient hover:scale-105 active:scale-95 cursor-pointer bank-card'
              : 'bank-card-gradient-muted cursor-not-allowed opacity-60 bank-card-coming-soon',
          ]"
        >
          <!-- Badge "Próximamente" o "DEV MODE" -->
          <div
            class="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bank-badge"
          >
            {{ isDev ? 'Dev Mode' : 'Próximamente' }}
          </div>

          <!-- Glow effect en dev mode -->
          <div
            v-if="isDev"
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bank-glow"
          ></div>

          <!-- Content -->
          <div class="relative z-10 flex flex-col items-center gap-3">
            <!-- Logo -->
            <div
              :class="[
                'w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center p-3',
                isDev
                  ? 'bg-white/[0.05] border border-white/[0.08] group-hover:border-white/20 bank-logo'
                  : 'bg-white/[0.03] border border-white/[0.05] bank-logo-disabled',
              ]"
            >
              <img
                :src="bank.logoUrl"
                :alt="bank.name"
                class="w-full h-full object-contain"
                :class="[isDev ? '' : 'grayscale-[30%] opacity-70']"
              />
            </div>

            <!-- Bank Name -->
            <h3 class="text-lg md:text-xl font-bold text-center bank-name">
              {{ bank.name }}
            </h3>

            <!-- CTA -->
            <div
              class="text-sm flex items-center gap-1"
              :class="[isDev ? 'text-white/50 group-hover:text-white/80' : 'text-white/30']"
            >
              <template v-if="isDev">
                <span>Ver demo</span>
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </template>
              <template v-else>
                <span>Próximamente</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
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

<style scoped>
/* ===== Cards de bancos activos ===== */

/* Gradiente sutil para cards (consistent con otras cards) */
.bank-card-gradient {
  background: linear-gradient(
    135deg,
    rgba(var(--bank-primary-rgb), 0.05) 0%,
    rgba(var(--bank-primary-light-rgb), 0.03) 100%
  );
}

.bank-card-gradient-muted {
  background: linear-gradient(
    135deg,
    rgba(var(--bank-primary-rgb), 0.02) 0%,
    rgba(var(--bank-primary-light-rgb), 0.01) 100%
  );
}

/* Borde constante en 2px para evitar layout shift */
.bank-card {
  border: 2px solid rgba(255, 255, 255, 0.08);
  transition:
    border-color 0.3s ease-in-out,
    background-color 0.3s ease-in-out,
    transform 0.3s ease-in-out,
    scale 0.3s ease-in-out;
}

/* Hover: borde con color del banco, intensidad alta */
.bank-card:hover {
  border-color: rgba(var(--bank-accent-rgb), 0.85);
}

/* Glow effect usando el color del banco */
.bank-glow {
  background: radial-gradient(circle at center, rgba(var(--bank-accent-rgb), 0.2), transparent 70%);
}

/* Logo con shadow y color del banco */
.bank-logo {
  box-shadow: 0 0 20px rgba(var(--bank-accent-rgb), 0.3);
  color: var(--bank-accent);
}

/* Nombre del banco con color del banco */
.bank-name {
  color: var(--bank-accent);
}

/* ===== Cards de bancos "coming soon" ===== */

/* Borde con color del banco (más sutil para coming soon) */
.bank-card-coming-soon {
  border: 2px solid rgba(var(--bank-accent-rgb), 0.15);
}

/* Hover del borde en dev mode */
.bank-card-coming-soon:hover {
  border-color: rgba(var(--bank-accent-rgb), 0.35);
}

/* Badge con color del banco */
.bank-badge {
  background: rgba(var(--bank-accent-rgb), 0.2);
  color: var(--bank-accent);
  border: 1px solid rgba(var(--bank-accent-rgb), 0.3);
}

/* Logo en dev mode */
.bank-logo-dev {
  box-shadow: 0 0 20px rgba(var(--bank-accent-rgb), 0.3);
  color: var(--bank-accent);
}

/* Logo deshabilitado */
.bank-logo-disabled {
  box-shadow: 0 0 10px rgba(var(--bank-accent-rgb), 0.15);
  color: var(--bank-accent);
}
</style>
