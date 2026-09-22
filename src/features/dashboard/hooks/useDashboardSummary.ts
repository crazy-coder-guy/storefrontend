import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../../../services/dashboard.service'
import { useSettings } from '../../settings/hooks/useSettings'
import { DEFAULT_SETTINGS } from '../../../services/settings.service'

export function useDashboardSummary() {
  const { data: settings } = useSettings()
  const threshold = settings?.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold

  return useQuery({
    queryKey: ['dashboard-summary', threshold],
    queryFn: () => getDashboardSummary(threshold),
  })
}
