import { api } from './api'
import type { Customer, EntityStatus, PaginatedResponse } from '../types'

export interface CustomerCartItem {
  id: string
  variantId: string
  productId: string
  name: string
  subtitle: string
  price: number
  mrp: number
  image: string | null
  size: string
  color: { name: string; hex: string }
  quantity: number
  stockQuantity: number
}

export interface CustomerCartSummary {
  subtotal: number
  mrpTotal: number
  discount: number
  deliveryFee: number
  total: number
  freeDeliveryThreshold: number
}

export interface CustomerCart {
  items: CustomerCartItem[]
  summary: CustomerCartSummary
  lastActivityAt: string | null
}

export interface ListCustomersParams {
  search?: string
  status?: EntityStatus
  page?: number
  limit?: number
}

function coerceCustomer<T extends Customer>(customer: T): T {
  return { ...customer, totalSpent: Number(customer.totalSpent) }
}

export async function listCustomers(params: ListCustomersParams) {
  const { data } = await api.get<PaginatedResponse<Customer>>('/customers', { params })
  return { ...data, items: data.items.map(coerceCustomer) }
}

export async function getCustomer(id: string) {
  const { data } = await api.get<Customer>(`/customers/${id}`)
  return coerceCustomer(data)
}

export async function getCustomerCart(id: string) {
  const { data } = await api.get<CustomerCart>(`/customers/${id}/cart`)
  return data
}
