import { api } from './api'
import type { FeaturedProduct, StorefrontSettings, StorefrontSettingsInput } from '../types'

export async function getStorefrontSettings() {
  const { data } = await api.get<StorefrontSettings>('/storefront/settings')
  return data
}

export async function updateStorefrontSettings(input: StorefrontSettingsInput) {
  const { data } = await api.patch<StorefrontSettings>('/storefront/settings', input)
  return data
}

export async function listFeaturedProducts() {
  const { data } = await api.get<FeaturedProduct[]>('/storefront/featured-products')
  return data
}

export async function setFeaturedProducts(productIds: string[]) {
  const { data } = await api.put<FeaturedProduct[]>('/storefront/featured-products', { productIds })
  return data
}
