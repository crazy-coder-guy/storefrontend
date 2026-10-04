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
 *
 * @example toCm(20) // → 50.8
 */
export function toCm(inches: number): number {
  return Math.round(inches * IN_TO_CM * 10) / 10
}

/**
 * Formats a single measurement value (stored in inches) as a dual-unit string.
 *
 * @param inches - Measurement in inches (from DB)
 * @param decimals - Decimal places for the inches value (default 1)
 * @returns e.g. `20.0" / 50.8 cm`
 *
 * @example
 * formatMeasurement(20)      // → '20.0" / 50.8 cm'
 * formatMeasurement(28.5)    // → '28.5" / 72.4 cm'
 * formatMeasurement(null)    // → '—'
 */
export function formatMeasurement(
  inches: number | null | undefined,
  decimals = 1
): string {
  if (inches == null) return '—'
  const inStr = inches.toFixed(decimals)
  const cmVal = toCm(inches)
  return `${inStr}" / ${cmVal} cm`
}

/**
 * Formats only the inches portion, e.g. `20.0"`.
 */
export function formatInches(inches: number | null | undefined, decimals = 1): string {
  if (inches == null) return '—'
  return `${inches.toFixed(decimals)}"`
}

/**
 * Formats only the centimetres portion, e.g. `50.8 cm`.
 */
export function formatCm(inches: number | null | undefined): string {
  if (inches == null) return '—'
  return `${toCm(inches)} cm`
}
