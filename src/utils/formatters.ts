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
