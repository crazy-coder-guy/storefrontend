import { api } from './api'
import type { Customer, EntityStatus, PaginatedResponse } from '../types'

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
