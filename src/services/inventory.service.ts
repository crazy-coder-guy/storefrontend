import { api } from './api'
import type { InventoryItem, InventoryTransaction, PaginatedResponse, StockAdjustInput } from '../types'

export interface ListInventoryParams {
  sku?: string
  product_id?: string
  product_name?: string
  size_id?: string
  color_id?: string
  page?: number
  limit?: number
}

function coerceItem<T extends InventoryItem>(item: T): T {
  return {
    ...item,
    price: item.price === null || item.price === undefined ? null : Number(item.price),
    product: { ...item.product, basePrice: Number(item.product.basePrice), mrp: Number(item.product.mrp) },
  }
}

export async function listInventory(params: ListInventoryParams) {
  const { data } = await api.get<PaginatedResponse<InventoryItem>>('/inventory', { params })
  return { ...data, items: data.items.map(coerceItem) }
}

export async function getLowStock(threshold: number) {
  const { data } = await api.get<InventoryItem[]>('/inventory/low-stock', { params: { threshold } })
  return data.map(coerceItem)
}

export async function getOutOfStock() {
  const { data } = await api.get<InventoryItem[]>('/inventory/out-of-stock')
  return data.map(coerceItem)
}

export async function adjustStock(variantId: string, input: StockAdjustInput) {
  const { data } = await api.patch<{
    variant: InventoryItem
    transaction: InventoryTransaction
  }>(`/inventory/${variantId}`, input)
  return data
}

export async function getVariantHistory(variantId: string, page: number, limit: number) {
  const { data } = await api.get<PaginatedResponse<InventoryTransaction>>(
    `/inventory/${variantId}/history`,
    { params: { page, limit } }
  )
  return data
}
