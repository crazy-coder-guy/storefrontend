import { api } from './api'
import type { Coupon, CouponInput, EntityStatus, PaginatedResponse } from '../types'

export interface ListCouponsParams {
  status?: EntityStatus
  search?: string
  page?: number
  limit?: number
}

export async function listCoupons(params: ListCouponsParams) {
  const { data } = await api.get<PaginatedResponse<Coupon>>('/coupons', { params })
  return data
}

export async function createCoupon(input: CouponInput) {
  const { data } = await api.post<Coupon>('/coupons', input)
  return data
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  const { data } = await api.patch<Coupon>(`/coupons/${id}`, input)
  return data
}

export async function deleteCoupon(id: string) {
  const { data } = await api.delete<{ id: string }>(`/coupons/${id}`)
  return data
}
