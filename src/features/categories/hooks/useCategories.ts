import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as categoryService from '../../../services/category.service'
import type { CategoryInput } from '../../../types'
import { toast } from '../../../lib/toast'
import type { ListCategoriesParams } from '../../../services/category.service'

const key = ['categories'] as const

export function useCategories(params: ListCategoriesParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => categoryService.listCategories(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) => categoryService.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Category created')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      categoryService.updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Category updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Category deactivated')
    },
    onError: (error) => toast.fromError(error),
  })
}
