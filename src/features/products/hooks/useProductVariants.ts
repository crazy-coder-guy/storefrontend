import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as variantService from '../../../services/productVariant.service'
import type { ProductVariantInput } from '../../../types'
import { toast } from '../../../lib/toast'

const key = (productId: string) => ['product-variants', productId] as const

export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: key(productId),
    queryFn: () => variantService.listProductVariants(productId),
    enabled: !!productId,
  })
}

export function useCreateProductVariant(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductVariantInput) => variantService.createProductVariant(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId) })
      toast.success('Variant added')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateProductVariant(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, input }: { variantId: string; input: Partial<ProductVariantInput> }) =>
      variantService.updateProductVariant(productId, variantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId) })
      toast.success('Variant updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteProductVariant(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variantId: string) => variantService.deleteProductVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId) })
      toast.success('Variant deactivated')
    },
    onError: (error) => toast.fromError(error),
  })
}
