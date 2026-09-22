import type { AdminSettings } from '../types'

// NOTE: Phase 1 has no backend /settings endpoint. This is persisted to localStorage
// and will be replaced by a real API call in Phase 2.
const STORAGE_KEY = 'admin-settings'

export const DEFAULT_SETTINGS: AdminSettings = {
  lowStockThreshold: 10,
}

export async function getSettings(): Promise<AdminSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}
