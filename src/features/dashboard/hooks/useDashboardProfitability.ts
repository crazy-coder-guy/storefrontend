import { useQuery } from '@tanstack/react-query'
import {
  getCategoryPerformance,
  getDashboardProfitability,
  getOrderStatusBreakdown,
  getProfitabilityTimeseries,
  getTopProducts,
} from '../../../services/dashboard.service'

// All-time profitability for v1 — no date-range picker exists elsewhere in the
// admin yet, so we intentionally omit from/to rather than build a new one.
export function useDashboardProfitability() {
  return useQuery({
    queryKey: ['dashboard-profitability'],
    queryFn: () => getDashboardProfitability(),
  })
}

export function useProfitabilityTimeseries(days: 7 | 15 | 30) {
  return useQuery({
    queryKey: ['dashboard-profitability-timeseries', days],
    queryFn: () => getProfitabilityTimeseries(days),
    placeholderData: (prev) => prev,
  })
}

export function useTopProducts(days: 7 | 15 | 30) {
  return useQuery({
    queryKey: ['dashboard-top-products', days],
    queryFn: () => getTopProducts(days),
    placeholderData: (prev) => prev,
  })
}

export function useCategoryPerformance(days: 7 | 15 | 30) {
  return useQuery({
    queryKey: ['dashboard-category-performance', days],
    queryFn: () => getCategoryPerformance(days),
    placeholderData: (prev) => prev,
  })
}

export function useOrderStatusBreakdown(days: 7 | 15 | 30) {
  return useQuery({
    queryKey: ['dashboard-order-status', days],
    queryFn: () => getOrderStatusBreakdown(days),
    placeholderData: (prev) => prev,
  })
}
