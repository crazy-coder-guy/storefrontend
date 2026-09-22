import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as sizeService from '../../../services/size.service'
import type { SizeInput } from '../../../types'
import { toast } from '../../../lib/toast'
import type { ListSizesParams } from '../../../services/size.service'

const key = ['sizes'] as const

export function useSizes(params: ListSizesParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => sizeService.listSizes(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateSize() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SizeInput) => sizeService.createSize(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Size created')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateSize() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SizeInput> }) =>
      sizeService.updateSize(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Size updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteSize() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sizeService.deleteSize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Size deactivated')
    },
    onError: (error) => toast.fromError(error),
  })
}
