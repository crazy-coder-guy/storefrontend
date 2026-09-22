import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as imageService from '../../../services/productImage.service'
import type { ProductImageInput } from '../../../types'
import { toast } from '../../../lib/toast'

const key = (productId: string) => ['product-images', productId] as const

export function useProductImages(productId: string) {
  return useQuery({
    queryKey: key(productId),
    queryFn: () => imageService.listProductImages(productId),
    enabled: !!productId,
  })
}

export function useCreateProductImage(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductImageInput) => imageService.createProductImage(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId) })
      toast.success('Image added')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateProductImage(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ imageId, input }: { imageId: string; input: Partial<ProductImageInput> }) =>
      imageService.updateProductImage(productId, imageId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId) })
      toast.success('Image updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteProductImage(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => imageService.deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId) })
      toast.success('Image deleted')
    },
    onError: (error) => toast.fromError(error),
  })
}
