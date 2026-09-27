import { api } from './api'
import type { PaginatedResponse } from '../types'

export interface AbandonedCartRow {
  userId: string
  customerName: string
  customerEmail: string
  itemsCount: number
  cartTotal: number
  lastActivityAt: string
}

export interface ListCartsParams {
  search?: string
  page?: number
  limit?: number
}

export async function listAbandonedCarts(params: ListCartsParams) {
  const { data } = await api.get<PaginatedResponse<AbandonedCartRow>>('/carts', { params })
  return data
}
