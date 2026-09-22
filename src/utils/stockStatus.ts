import type { StockStatus } from '../types'

export function stockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return 'out-of-stock'
  if (quantity <= threshold) return 'low-stock'
  return 'in-stock'
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
}
