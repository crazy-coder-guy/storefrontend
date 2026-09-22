import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as imageService from '../../../services/productImage.service'
import type { UploadProductImageInput } from '../../../services/productImage.service'
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

export function useUploadProductImage(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UploadProductImageInput) => imageService.uploadProductImage(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(productId) })
      toast.success('Image uploaded')
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
