import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as reviewService from '../services/review.service'
import type { ListReviewsParams } from '../services/review.service'
import { toast } from '../lib/toast'

const key = ['reviews'] as const

export function useReviews(params: ListReviewsParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => reviewService.listReviews(params),
    placeholderData: (prev) => prev,
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Review deleted')
    },
    onError: (error) => toast.fromError(error),
  })
}
