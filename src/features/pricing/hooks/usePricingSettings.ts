import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as pricingService from '../../../services/pricing.service'
import type { PricingSettingsInput } from '../../../types'
import { toast } from '../../../lib/toast'

const key = ['pricing', 'settings'] as const

export function usePricingSettings() {
  return useQuery({
    queryKey: key,
    queryFn: pricingService.getPricingSettings,
  })
}

export function useUpdatePricingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PricingSettingsInput) => pricingService.updatePricingSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Pricing settings updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

// Used for the live "recommended selling price" preview — called on demand
// (debounced by the caller) rather than cached as a query, since it's a
// pure function of the cost price typed into the form.
export function usePricingRecommendation() {
  return useMutation({
    mutationFn: (productCost: number) => pricingService.getPricingRecommendation(productCost),
  })
}
