/**
 * Formats a number with Uruguayan locale (es-UY)
 * Period as thousands separator, comma as decimal
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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
    hour12: false
  })
}
