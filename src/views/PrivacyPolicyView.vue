<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PhWarning, PhInfo } from '@phosphor-icons/vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="app-gradient min-h-screen p-4 sm:p-8 overflow-y-auto">
    <div
      class="max-w-[800px] mx-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
    >
      <!-- Header -->
      <div class="p-6 sm:p-8 border-b border-white/10 bg-white/[0.03]">
        <button
          @click="goHome"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:border-white/25 hover:-translate-x-0.5"
          aria-label="Volver al inicio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Volver al inicio
        </button>
        <h1 class="text-3xl sm:text-4xl font-bold text-white mt-6 mb-2">Privacidad y Datos</h1>
        <p class="text-sm text-white/60 italic">Última actualización: 4 de febrero de 2026</p>
      </div>

      <!-- Contenido -->
      <div class="p-6 sm:p-8 space-y-8">
        <!-- Qué es este sitio -->
        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-white pb-2 border-b-2 border-white/15">
            Qué es este sitio
          </h2>
          <p class="text-base leading-relaxed text-white/85">
            <strong>La Media</strong> es un sitio web <strong>NO oficial</strong> de comparación de
            tasas de cambio (USD/UYU) para bancos uruguayos. No estamos afiliados ni respaldados
            por ningún banco.
          </p>
          <p class="text-base leading-relaxed text-white/85">
            Es un proyecto educativo sin fines de lucro que agrega información pública disponible
            en los sitios oficiales de los bancos.
          </p>
        </section>

        <!-- Datos que recolectamos -->
        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-white pb-2 border-b-2 border-white/15">
            Datos que recolectamos
          </h2>
          <p class="text-base leading-relaxed text-white/85">
            Este sitio utiliza herramientas de análisis para mejorar la experiencia:
          </p>
          <ul class="list-disc pl-6 space-y-2">
            <li class="text-base leading-relaxed text-white/85">
              <strong>Navegación:</strong> Páginas visitadas, clics en botones
            </li>
            <li class="text-base leading-relaxed text-white/85">
              <strong>Dispositivo:</strong> Tipo de navegador, tamaño de pantalla (para diseño
              responsive)
            </li>
            <li class="text-base leading-relaxed text-white/85">
              <strong>Errores técnicos:</strong> Para detectar y corregir problemas
            </li>
          </ul>
          <div class="p-4 bg-white/[0.08] border-l-4 border-white/30 rounded">
            <p class="text-[15px] leading-relaxed text-white/85 inline-flex items-start gap-2">
              <PhWarning :size="18" weight="bold" class="flex-shrink-0 mt-0.5" />
              <span
                ><strong>Importante:</strong> NO recolectamos nombres, emails, direcciones IP, ni
                ningún dato personal identificable. Los valores ingresados (cantidades de dinero)
                están enmascarados y no son visibles.</span
              >
            </p>
          </div>
        </section>

        <!-- Herramientas utilizadas -->
        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-white pb-2 border-b-2 border-white/15">
            Herramientas utilizadas
          </h2>
          <div class="space-y-3">
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <p class="text-[15px] leading-relaxed text-white/85">
                <strong>PostHog</strong> - Análisis de uso y detección de errores.
                <a
                  href="https://posthog.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-white/90 underline hover:text-white transition-colors ml-1"
                  >Política de privacidad</a
                >
              </p>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <p class="text-[15px] leading-relaxed text-white/85">
                <strong>Sentry</strong> - Monitoreo de errores técnicos (sin IPs).
                <a
                  href="https://sentry.io/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-white/90 underline hover:text-white transition-colors ml-1"
                  >Política de privacidad</a
                >
              </p>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <p class="text-[15px] leading-relaxed text-white/85">
                <strong>Ahrefs</strong> - Análisis web y SEO.
                <a
                  href="https://ahrefs.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-white/90 underline hover:text-white transition-colors ml-1"
                  >Política de privacidad</a
                >
              </p>
            </div>
          </div>
        </section>

        <!-- Almacenamiento local -->
        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-white pb-2 border-b-2 border-white/15">
            Almacenamiento local
          </h2>
          <p class="text-base leading-relaxed text-white/85">
            El sitio guarda estas preferencias en tu navegador (localStorage):
          </p>
          <ul class="list-disc pl-6 space-y-2">
            <li class="text-base leading-relaxed text-white/85">
              Si cerraste el aviso legal de un banco
            </li>
            <li class="text-base leading-relaxed text-white/85">
              Tu dirección de conversión preferida (USD→UYU o UYU→USD)
            </li>
          </ul>
          <div class="p-4 bg-white/[0.08] border-l-4 border-white/30 rounded">
            <p class="text-[15px] leading-relaxed text-white/85 inline-flex items-start gap-2">
              <PhInfo :size="18" weight="bold" class="flex-shrink-0 mt-0.5" />
              <span
                >Estos datos están solo en tu navegador y <strong>NO se envían a servidores</strong
                >. Puedes borrarlos limpiando el localStorage.</span
              >
            </p>
          </div>
        </section>

        <!-- Actualizaciones -->
        <section class="space-y-4">
          <h2 class="text-2xl font-semibold text-white pb-2 border-b-2 border-white/15">
            Actualizaciones
          </h2>
          <p class="text-base leading-relaxed text-white/85">
            Esta política puede actualizarse ocasionalmente. La fecha de última actualización
            aparece al inicio de esta página.
          </p>
        </section>
      </div>

      <!-- Footer -->
      <div class="p-6 sm:p-8 border-t border-white/10 bg-white/[0.03] text-center">
        <button
          @click="goHome"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:border-white/25"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  </div>
</template>
