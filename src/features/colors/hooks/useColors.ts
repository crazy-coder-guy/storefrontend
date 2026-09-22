import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as colorService from '../../../services/color.service'
import type { ColorInput } from '../../../types'
import { toast } from '../../../lib/toast'
import type { ListColorsParams } from '../../../services/color.service'

const key = ['colors'] as const

export function useColors(params: ListColorsParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => colorService.listColors(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ColorInput) => colorService.createColor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Color created')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ColorInput> }) =>
      colorService.updateColor(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Color updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => colorService.deleteColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Color deactivated')
    },
    onError: (error) => toast.fromError(error),
  })
}
