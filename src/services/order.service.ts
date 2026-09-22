import { api } from './api'
import type { Order, OrderStatus, PaginatedResponse, PaymentStatus } from '../types'

export interface ListOrdersParams {
  search?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  page?: number
  limit?: number
}

export interface CreateOrderItemInput {
  variantId: string
  quantity: number
}

export interface CreateOrderInput {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  paymentStatus?: PaymentStatus
  items: CreateOrderItemInput[]
}

function coerceOrder<T extends Order>(order: T): T {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
  }
}

export async function listOrders(params: ListOrdersParams) {
  const { data } = await api.get<PaginatedResponse<Order>>('/orders', { params })
  return { ...data, items: data.items.map(coerceOrder) }
}

export async function getOrder(id: string) {
  const { data } = await api.get<Order>(`/orders/${id}`)
  return coerceOrder(data)
}

export async function createOrder(input: CreateOrderInput) {
  const { data } = await api.post<Order>('/orders', input)
  return coerceOrder(data)
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await api.patch<Order>(`/orders/${id}/status`, { status })
  return coerceOrder(data)
}
