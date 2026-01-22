<script setup lang="ts">
import NumberFlow from '@number-flow/vue'

interface Props {
  value: number
  prefix?: string
}

const { value, prefix = '' } = defineProps<Props>()
</script>

<template>
  <span>
    {{ prefix }}<NumberFlow
      :value="value"
      :format="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
      locales="es-UY"
    />
  </span>
</template>
