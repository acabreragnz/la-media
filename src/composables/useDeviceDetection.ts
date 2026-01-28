import { ref, onMounted } from 'vue'

/**
 * Detecta dispositivos de baja gama usando APIs modernas del navegador
 * Basado en: https://addyosmani.com/blog/adaptive-loading/
 */
export function useDeviceDetection() {
  const isLowEndDevice = ref(false)

  onMounted(() => {
    // 1. Preferencias de accesibilidad (reduce-motion)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 2. Network Information API - Conexión lenta (2G/slow-2G)
    // @ts-expect-error - connection API no está en todos los navegadores
    const effectiveType = navigator.connection?.effectiveType || '4g'
    const slowConnection = effectiveType === 'slow-2g' || effectiveType === '2g'

    // 3. CPU cores (< 4 = gama baja)
    const lowCPU = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false

    // 4. RAM disponible (< 4GB = gama baja)
    // @ts-expect-error - deviceMemory no está en todos los navegadores
    const lowMemory = navigator.deviceMemory ? navigator.deviceMemory < 4 : false

    // Detectar si es dispositivo de baja gama
    isLowEndDevice.value = prefersReducedMotion || slowConnection || lowCPU || lowMemory

    // Debug info
    console.log('[Device Detection]', {
      isLowEnd: isLowEndDevice.value,
      prefersReducedMotion,
      effectiveType,
      slowConnection,
      cpuCores: navigator.hardwareConcurrency,
      // @ts-expect-error - deviceMemory no está en todos los navegadores
      memory: navigator.deviceMemory,
    })
  })

  return {
    isLowEndDevice,
  }
}
