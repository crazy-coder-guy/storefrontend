import { api } from './api'
import type { PaginatedResponse } from '../types'

export interface ReviewOrderItem {
  id: string
  productId: string
  productName: string
  productImageUrl: string | null
  colorName: string
  colorHex: string
  sizeCode: string
  quantity: number
  unitPrice: number
}

export interface ReviewOrder {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  shippingAddress: string
  createdAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: ReviewOrderItem[]
}

export interface Review {
  id: string
  rating: number
  comment: string
  images: string[]
  video: string | null
  createdAt: string
  reviewerName: string
  reviewerEmail: string
  reviewerPhoto: string | null
  productId: string
  productName: string
  productSlug: string
  order: ReviewOrder
}

export interface ListReviewsParams {
  page?: number
  limit?: number
}

export async function listReviews(params: ListReviewsParams) {
  const { data } = await api.get<PaginatedResponse<Review>>('/reviews', { params })
  return data
}

export async function deleteReview(id: string) {
  await api.delete(`/reviews/${id}`)
}
