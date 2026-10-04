/**
 * Measurement formatting utilities.
 * All measurements are stored in **inches** and displayed as both
 * inches and centimetres so customers can use whichever they prefer.
 *
 * 1 inch = 2.54 cm
 */

const IN_TO_CM = 2.54

/**
 * Converts inches to centimetres, rounded to 1 decimal place.
 * Safely accepts number, string, null, or undefined.
 *
 * @example toCm(20) // → 50.8
 * @example toCm("36") // → 91.4
 */
export function toCm(inches: number | string | null | undefined): number {
  if (inches == null || inches === '') return 0
  const num = typeof inches === 'number' ? inches : Number(inches)
  if (Number.isNaN(num)) return 0
  return Math.round(num * IN_TO_CM * 10) / 10
}

/**
 * Formats a single measurement value (stored in inches) as a dual-unit string.
 * Safely handles both numbers and string decimals from API (e.g. "36", "8.5").
 *
 * @param inches - Measurement in inches (from DB)
 * @param decimals - Decimal places for the inches value (default 1)
 * @returns e.g. `20" / 50.8 cm` or `8.5" / 21.6 cm`
 *
 * @example
 * formatMeasurement("36")    // → '36" / 91.4 cm'
 * formatMeasurement(28.5)    // → '28.5" / 72.4 cm'
 * formatMeasurement(null)    // → '—'
 */
export function formatMeasurement(
  inches: number | string | null | undefined,
  decimals = 1
): string {
  if (inches == null || inches === '') return '—'
  const num = typeof inches === 'number' ? inches : Number(inches)
  if (Number.isNaN(num) || num <= 0) return '—'
  const inStr = num % 1 === 0 ? String(num) : num.toFixed(decimals)
  const cmVal = toCm(num)
  return `${inStr}" / ${cmVal} cm`
}

/**
 * Formats only the inches portion, e.g. `20"`, `8.5"`.
 */
export function formatInches(inches: number | string | null | undefined, decimals = 1): string {
  if (inches == null || inches === '') return '—'
  const num = typeof inches === 'number' ? inches : Number(inches)
  if (Number.isNaN(num) || num <= 0) return '—'
  const inStr = num % 1 === 0 ? String(num) : num.toFixed(decimals)
  return `${inStr}"`
}

/**
 * Formats only the centimetres portion, e.g. `50.8 cm`.
 */
export function formatCm(inches: number | string | null | undefined): string {
  if (inches == null || inches === '') return '—'
  const num = typeof inches === 'number' ? inches : Number(inches)
  if (Number.isNaN(num) || num <= 0) return '—'
  return `${toCm(num)} cm`
}
