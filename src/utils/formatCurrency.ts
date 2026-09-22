export function formatCurrency(value: number | string | null | undefined) {
  const num = typeof value === 'string' ? Number(value) : value
  if (num === null || num === undefined || Number.isNaN(num)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num)
}
