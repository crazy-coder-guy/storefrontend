import { api } from './api'
import type { DashboardProfitability, DashboardSummary } from '../types'

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
