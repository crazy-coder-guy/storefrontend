import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as inventoryService from '../../../services/inventory.service'
import type { ListInventoryParams } from '../../../services/inventory.service'
import type { StockAdjustInput } from '../../../types'
import { toast } from '../../../lib/toast'

const key = ['inventory'] as const

export function useInventory(params: ListInventoryParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => inventoryService.listInventory(params),
    placeholderData: (prev) => prev,
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, input }: { variantId: string; input: StockAdjustInput }) =>
      inventoryService.adjustStock(variantId, input),
    onSuccess: (_data, { variantId }) => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-history', variantId] })
      toast.success('Stock adjusted')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useVariantHistory(variantId: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['inventory-history', variantId, page, limit],
    queryFn: () => inventoryService.getVariantHistory(variantId, page, limit),
    enabled: !!variantId,
    placeholderData: (prev) => prev,
  })
}
