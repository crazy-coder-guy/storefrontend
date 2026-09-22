import { api } from './api'
import type { Category, CategoryInput, EntityStatus, PaginatedResponse } from '../types'

export interface ListCategoriesParams {
  search?: string
  status?: EntityStatus
  page?: number
  limit?: number
}

export async function listCategories(params: ListCategoriesParams) {
  const { data } = await api.get<PaginatedResponse<Category>>('/categories', { params })
  return data
}

export async function getCategory(id: string) {
  const { data } = await api.get<Category>(`/categories/${id}`)
  return data
}

export async function createCategory(input: CategoryInput) {
  const { data } = await api.post<Category>('/categories', input)
  return data
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const { data } = await api.patch<Category>(`/categories/${id}`, input)
  return data
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete<Category>(`/categories/${id}`)
  return data
}

export async function deleteCategoryPermanently(id: string) {
  await api.delete(`/categories/${id}/permanent`)
}
