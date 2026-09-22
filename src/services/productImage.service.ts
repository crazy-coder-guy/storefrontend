import { api } from './api'
import type { ProductImage, ProductImageInput } from '../types'

export async function listProductImages(productId: string) {
  const { data } = await api.get<ProductImage[]>(`/products/${productId}/images`)
  return data
}

export async function createProductImage(productId: string, input: ProductImageInput) {
  const { data } = await api.post<ProductImage>(`/products/${productId}/images`, input)
  return data
}

export async function updateProductImage(
  productId: string,
  imageId: string,
  input: Partial<ProductImageInput>
) {
  const { data } = await api.patch<ProductImage>(`/products/${productId}/images/${imageId}`, input)
  return data
}

export async function deleteProductImage(productId: string, imageId: string) {
  const { data } = await api.delete<ProductImage>(`/products/${productId}/images/${imageId}`)
  return data
}
