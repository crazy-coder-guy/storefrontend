import { api } from './api'
import type { ImageType, ProductImage, ProductImageInput } from '../types'

export async function listProductImages(productId: string) {
  const { data } = await api.get<ProductImage[]>(`/products/${productId}/images`)
  return data
}

export async function createProductImage(productId: string, input: ProductImageInput) {
  const { data } = await api.post<ProductImage>(`/products/${productId}/images`, input)
  return data
}

export interface UploadProductImageInput {
  file: File
  imageType?: ImageType
  isPrimary?: boolean
  colorId?: string
}

export async function uploadProductImage(productId: string, input: UploadProductImageInput) {
  const formData = new FormData()
  formData.append('image', input.file)
  if (input.imageType) formData.append('imageType', input.imageType)
  if (input.isPrimary !== undefined) formData.append('isPrimary', String(input.isPrimary))
  if (input.colorId) formData.append('colorId', input.colorId)

  // Unset the instance's default JSON Content-Type so axios sends this as
  // multipart/form-data with the correct boundary instead of JSON-stringifying the FormData.
  const { data } = await api.post<ProductImage>(`/products/${productId}/images/upload`, formData, {
    headers: { 'Content-Type': undefined },
  })
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
