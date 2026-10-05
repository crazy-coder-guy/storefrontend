import { useQuery } from '@tanstack/react-query'
import { getDashboardProfitability } from '../../../services/dashboard.service'

// All-time profitability for v1 — no date-range picker exists elsewhere in the
// admin yet, so we intentionally omit from/to rather than build a new one.
export function useDashboardProfitability() {
  return useQuery({
    queryKey: ['dashboard-profitability'],
    queryFn: () => getDashboardProfitability(),
  })
}
