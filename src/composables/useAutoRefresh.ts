import { ref, computed, onMounted, onUnmounted } from 'vue'
import { REFRESH_SLOTS, REFRESH_DELAY_SECONDS } from '@/config/refresh'

/**
 * Composable para auto-refresh sincronizado con slots de tiempo
 * Backend actualiza a las XX:00, XX:15, XX:30, XX:45
 * Frontend hace fetch 60 segundos después (1 minuto)
 */
export function useAutoRefresh(onRefresh?: () => Promise<void> | void) {
  const tick = ref(0) // Forzar re-computation cada minuto
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let tickerInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Calcula el próximo slot de refresh (00, 15, 30, 45)
   * y le suma el delay configurado (60 segundos = 1 minuto)
   */
  function getNextRefreshTime(): Date {
    const now = new Date()
    const currentMinute = now.getMinutes()
    const currentSecond = now.getSeconds()

    // Encontrar el próximo slot
    let nextSlot = REFRESH_SLOTS.find((slot) => {
      // Si estamos antes del slot + delay, ese es el próximo
      if (currentMinute < slot) return true
      if (currentMinute === slot && currentSecond < REFRESH_DELAY_SECONDS) return true
      return false
    })

    // Si no encontramos slot en esta hora, el próximo es en la hora siguiente
    if (nextSlot === undefined) {
      nextSlot = REFRESH_SLOTS[0]
      now.setHours(now.getHours() + 1)
    }

    // Construir fecha del próximo refresh (slot + delay configurado)
    const next = new Date(now)
    next.setMinutes(nextSlot as number)
    next.setSeconds(REFRESH_DELAY_SECONDS)
    next.setMilliseconds(0)

    return next
  }

  /**
   * Calcula minutos hasta el próximo refresh
   */
  const minutesUntilRefresh = computed(() => {
    void tick.value // forzar re-computation
    const next = getNextRefreshTime()
    const diff = next.getTime() - Date.now()
    const minutes = Math.ceil(diff / 60000)
    return Math.max(0, minutes)
  })

  /**
   * Hora exacta del próximo refresh
   */
  const nextUpdateTime = computed(() => {
    void tick.value // forzar re-computation
    const next = getNextRefreshTime()
    return next.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })

  /**
   * Ejecutar refresh
   */
  async function triggerRefresh() {
    if (onRefresh) {
      await onRefresh()
    }
    tick.value++
  }

  /**
   * Programar próximo refresh
   */
  function scheduleNextRefresh() {
    const next = getNextRefreshTime()
    const delay = next.getTime() - Date.now()

    console.log(
      `[useAutoRefresh] Próximo refresh en ${Math.ceil(delay / 1000)}seg (${next.toLocaleTimeString()})`
    )

    timeoutId = setTimeout(async () => {
      await triggerRefresh()
      scheduleNextRefresh() // Programar el siguiente
    }, delay)
  }

  // Setup en mount
  onMounted(() => {
    // Programar primer refresh
    scheduleNextRefresh()

    // Ticker para actualizar UI cada minuto
    tickerInterval = setInterval(() => {
      tick.value++
    }, 60000)
  })

  // Cleanup en unmount
  onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
    if (tickerInterval) clearInterval(tickerInterval)
  })

  return {
    minutesUntilRefresh,
    nextUpdateTime,
    triggerRefresh
  }
}
