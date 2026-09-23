import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as storefrontService from '../../../services/storefront.service'
import { toast } from '../../../lib/toast'

const key = ['storefront', 'featured-products'] as const

export function useFeaturedProducts() {
  return useQuery({
    queryKey: key,
    queryFn: storefrontService.listFeaturedProducts,
  })
}

export function useSetFeaturedProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productIds: string[]) => storefrontService.setFeaturedProducts(productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Top selling products updated')
    },
    onError: (error) => toast.fromError(error),
  })
}
