import { api } from './api'
import type { ProductVariant, ProductVariantInput } from '../types'

function coerceVariant<T extends ProductVariant>(variant: T): T {
  return {
    ...variant,
    price: variant.price === null || variant.price === undefined ? null : Number(variant.price),
  }
}

export async function listProductVariants(productId: string) {
  const { data } = await api.get<ProductVariant[]>(`/products/${productId}/variants`)
  return data.map(coerceVariant)
}

export async function getProductVariant(productId: string, variantId: string) {
  const { data } = await api.get<ProductVariant>(`/products/${productId}/variants/${variantId}`)
  return coerceVariant(data)
}

export async function createProductVariant(productId: string, input: ProductVariantInput) {
  const { data } = await api.post<ProductVariant>(`/products/${productId}/variants`, input)
  return coerceVariant(data)
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  input: Partial<ProductVariantInput>
) {
  const { data } = await api.patch<ProductVariant>(
    `/products/${productId}/variants/${variantId}`,
    input
  )
  return coerceVariant(data)
}

export async function deleteProductVariant(productId: string, variantId: string) {
  const { data } = await api.delete<ProductVariant>(`/products/${productId}/variants/${variantId}`)
  return coerceVariant(data)
}
