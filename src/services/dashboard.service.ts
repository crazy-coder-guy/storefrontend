import { api } from './api'
import type { DashboardSummary } from '../types'

export async function getDashboardSummary(threshold: number) {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary', { params: { threshold } })
  return data
}
