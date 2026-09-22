import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productService from '../../../services/product.service'
import type { ListProductsParams } from '../../../services/product.service'
import type { ProductInput } from '../../../types'
import { toast } from '../../../lib/toast'

const listKey = ['products'] as const
const detailKey = (id: string) => ['products', id] as const

export function useProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: [...listKey, params],
    queryFn: () => productService.listProducts(params),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: detailKey(id ?? ''),
    queryFn: () => productService.getProduct(id as string),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => productService.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey })
      toast.success('Product created')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<ProductInput>) => productService.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: detailKey(id) })
      toast.success('Product updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: detailKey(id) })
      toast.success('Product deactivated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteProductPermanently() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.deleteProductPermanently(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: detailKey(id) })
      toast.success('Product permanently deleted')
    },
    onError: (error) => toast.fromError(error),
  })
}

