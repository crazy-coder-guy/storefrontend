import { api } from './api'
import type { PaginatedResponse } from '../types'

export type ExchangeReason = 'DAMAGED' | 'DEFECTIVE' | 'WRONG_ITEM' | 'SIZE_FIT' | 'OTHER'
export type ExchangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'

export interface ExchangeRequest {
  id: string
  orderId: string
  orderNumber: string
  orderItemId: string
  productId: string
  productName: string
  productImage: string | null
  colorName: string
  colorHex: string
  sizeCode: string
  reason: ExchangeReason
  description: string
  images: string[]
  status: ExchangeStatus
  adminNote: string | null
  createdAt: string
  updatedAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
}

export interface ListExchangesParams {
  page?: number
  limit?: number
  status?: ExchangeStatus
  search?: string
}

export async function listExchanges(params: ListExchangesParams) {
  const { data } = await api.get<PaginatedResponse<ExchangeRequest>>('/exchanges', { params })
  return data
}

export async function updateExchangeStatus(id: string, status: ExchangeStatus, adminNote?: string) {
  const { data } = await api.patch<ExchangeRequest>(`/exchanges/${id}/status`, { status, adminNote })
  return data
}
