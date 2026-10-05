import { api } from './api'
import type {
  CategoryPerformanceResponse,
  DashboardProfitability,
  DashboardSummary,
  OrderStatusBreakdown,
  ProfitabilityTimeseries,
  TopProductsResponse,
} from '../types'

export async function getDashboardSummary(threshold: number) {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary', { params: { threshold } })
  return data
}

export interface GetProfitabilityParams {
  from?: string
  to?: string
}

export async function getDashboardProfitability(params: GetProfitabilityParams = {}) {
  const { data } = await api.get<DashboardProfitability>('/dashboard/profitability', { params })
  return data
}

export async function getProfitabilityTimeseries(days: 7 | 15 | 30) {
  const { data } = await api.get<ProfitabilityTimeseries>('/dashboard/profitability/timeseries', {
    params: { days },
  })
  return data
}

export async function getTopProducts(days: 7 | 15 | 30, limit = 5) {
  const { data } = await api.get<TopProductsResponse>('/dashboard/top-products', {
    params: { days, limit },
  })
  return data
}

export async function getCategoryPerformance(days: 7 | 15 | 30) {
  const { data } = await api.get<CategoryPerformanceResponse>('/dashboard/category-performance', {
    params: { days },
  })
  return data
}

export async function getOrderStatusBreakdown(days: 7 | 15 | 30) {
  const { data } = await api.get<OrderStatusBreakdown>('/dashboard/order-status', {
    params: { days },
  })
  return data
}
