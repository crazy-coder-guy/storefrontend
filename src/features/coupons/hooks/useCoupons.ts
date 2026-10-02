import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as couponService from '../../../services/coupon.service'
import type { CouponInput } from '../../../types'
import { toast } from '../../../lib/toast'
import type { ListCouponsParams } from '../../../services/coupon.service'

const key = ['coupons'] as const

export function useCoupons(params: ListCouponsParams) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => couponService.listCoupons(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CouponInput) => couponService.createCoupon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Coupon created')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CouponInput> }) =>
      couponService.updateCoupon(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Coupon updated')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      toast.success('Coupon deleted')
    },
    onError: (error) => toast.fromError(error),
  })
}
