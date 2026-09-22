import { api } from './api'
import type { PaginatedResponse, Product, ProductDetail, ProductInput, ProductStatus } from '../types'

export interface ListProductsParams {
  search?: string
  category_id?: string
  status?: ProductStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

function coerceProduct<T extends Product>(product: T): T {
  return {
    ...product,
    basePrice: Number(product.basePrice),
    mrp: Number(product.mrp),
  }
}

export async function listProducts(params: ListProductsParams) {
  const { data } = await api.get<PaginatedResponse<Product>>('/products', { params })
  return { ...data, items: data.items.map(coerceProduct) }
}

export async function getProduct(id: string) {
  const { data } = await api.get<ProductDetail>(`/products/${id}`)
  return coerceProduct(data)
}

export async function createProduct(input: ProductInput) {
  const { data } = await api.post<Product>('/products', input)
  return coerceProduct(data)
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { data } = await api.patch<Product>(`/products/${id}`, input)
  return coerceProduct(data)
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete<Product>(`/products/${id}`)
  return coerceProduct(data)
}

export async function deleteProductPermanently(id: string) {
  await api.delete(`/products/${id}/permanent`)
}
