<script setup lang="ts">
import type { BankId } from '@/utils/bank-colors'

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
  </div>
</template>
