import { api } from './api'
import type { PricingRecommendation, PricingSettings, PricingSettingsInput } from '../types'

// Numeric fields come back from the API as the Decimal's string form (e.g. "20"),
// so coerce everything to real numbers for the admin UI.
function coercePricingSettings(settings: PricingSettings): PricingSettings {
  return {
    ...settings,
    packagingCost: Number(settings.packagingCost),
    courierCost: Number(settings.courierCost),
    paymentGatewayPercent: Number(settings.paymentGatewayPercent),
    exchangeBuffer: Number(settings.exchangeBuffer),
    miscCost: Number(settings.miscCost),
    marketingCost: Number(settings.marketingCost),
    targetProfit: Number(settings.targetProfit),
    freeShippingThreshold: Number(settings.freeShippingThreshold),
    shippingCharge: Number(settings.shippingCharge),
  }
}

export async function getPricingSettings() {
  const { data } = await api.get<PricingSettings>('/pricing/settings')
  return coercePricingSettings(data)
}

export async function updatePricingSettings(input: PricingSettingsInput) {
  const { data } = await api.patch<PricingSettings>('/pricing/settings', input)
  return coercePricingSettings(data)
}

export async function getPricingRecommendation(productCost: number) {
  const { data } = await api.post<PricingRecommendation>('/pricing/recommend', { productCost })
  return data
}
