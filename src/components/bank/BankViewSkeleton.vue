<script setup lang="ts">
import type { BankId } from '@/types/banks'

interface Props {
  bankId: BankId
  showOnlyContent?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-5">
    <!-- Exchange Rates skeleton -->
    <div class="space-y-2">
      <div
        class="bg-white/[0.04] rounded-xl px-5 border border-white/[0.05] animate-pulse relative"
      >
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
            <div class="h-3.5 bg-white/[0.08] rounded w-10"></div>
            <div class="h-8 bg-[rgba(var(--bank-accent-rgb),0.2)] rounded w-16"></div>
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

    <!-- Accent Stripe skeleton -->
    <div class="stripe-skeleton"></div>

    <!-- USD Input skeleton -->
    <div class="card-gradient border border-white/[0.08] rounded-[20px] p-5 animate-pulse">
      <div class="flex items-center gap-4">
        <!-- Flag emoji placeholder -->
        <span class="text-[2.25rem] leading-none opacity-30">🇺🇸</span>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-white/[0.08] rounded w-16"></div>
          <div class="h-7 bg-white/[0.1] rounded w-32"></div>
        </div>
      </div>
    </div>

    <!-- Rate display skeleton (between inputs) -->
    <div class="text-center py-2">
      <div class="h-4 bg-white/[0.06] rounded w-48 mx-auto animate-pulse"></div>
    </div>

    <!-- UYU Input skeleton -->
    <div class="card-gradient border border-white/[0.08] rounded-[20px] p-5 animate-pulse">
      <div class="flex items-center gap-4">
        <!-- Flag emoji placeholder -->
        <span class="text-[2.25rem] leading-none opacity-30">🇺🇾</span>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-white/[0.08] rounded w-16"></div>
          <div class="h-7 bg-white/[0.1] rounded w-32"></div>
        </div>
      </div>
    </div>

    <!-- Footer skeleton -->
    <div
      class="bg-white/[0.03] backdrop-blur-lg rounded-2xl p-4 border border-white/[0.08] animate-pulse"
    >
      <div class="space-y-3">
        <!-- Stats skeleton (Última / Próxima) -->
        <div class="h-3 bg-white/[0.06] rounded w-48 mx-auto"></div>
        <!-- Share button skeleton -->
        <div class="h-10 rounded-xl skeleton-share-button"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Card gradient matching BankView inputs */
.card-gradient {
  background: linear-gradient(
    135deg,
    rgba(var(--bank-primary-rgb), 0.05) 0%,
    rgba(var(--bank-primary-light-rgb), 0.03) 100%
  );
}

/* Accent stripe skeleton */
.stripe-skeleton {
  height: 2px;
  width: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--bank-accent-rgb), 0.5) 50%,
    transparent 100%
  );
  border-radius: 2px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-share-button {
  background: rgba(var(--bank-primary-rgb), 0.05);
  border: 1px solid rgba(var(--bank-primary-light-rgb), 0.2);
}
</style>
