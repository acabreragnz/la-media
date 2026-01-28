/**
 * Formats a number with Uruguayan locale (es-UY)
 * Period as thousands separator, comma as decimal
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formats an ISO 8601 timestamp to Uruguayan locale (es-UY)
 * Returns format: "dd/mm/yy HH:MM" (24-hour format)
 * Example: "22/1/26 14:30"
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('es-UY', {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false,
  })
}

/**
 * Formats a timestamp as relative time using Intl.RelativeTimeFormat
 * Works for both past and future timestamps
 * Examples:
 * - "hace 5 minutos" (past)
 * - "en 15 minutos" (future)
 * - "hace 2 horas" / "en 2 horas"
 * - "ayer" / "mañana"
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = date.getTime() - now.getTime() // positive = future, negative = past
  const seconds = Math.floor(Math.abs(diff) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat('es-UY', { numeric: 'always', style: 'short' })

  if (days >= 1) {
    return rtf.format(diff > 0 ? days : -days, 'day')
  } else if (hours >= 1) {
    return rtf.format(diff > 0 ? hours : -hours, 'hour')
  } else if (minutes >= 1) {
    return rtf.format(diff > 0 ? minutes : -minutes, 'minute')
  } else {
    return rtf.format(diff > 0 ? seconds : -seconds, 'second')
  }
}
