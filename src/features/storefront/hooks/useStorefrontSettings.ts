import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as storefrontService from '../../../services/storefront.service'
import type { StorefrontSettingsInput } from '../../../types'
import { toast } from '../../../lib/toast'

const key = ['storefront', 'settings'] as const

export function useStorefrontSettings() {
  return useQuery({
    queryKey: key,
    queryFn: storefrontService.getStorefrontSettings,
  })
}

export function useUpdateStorefrontSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StorefrontSettingsInput) => storefrontService.updateStorefrontSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Storefront content updated')
    },
    onError: (error) => toast.fromError(error),
  })
}
