import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Drawer } from '../components/Drawer'
import { Pagination } from '../components/Pagination'
import { InventoryTable } from '../features/inventory/InventoryTable'
import { StockAdjustForm, type StockAdjustFormValues } from '../features/inventory/StockAdjustForm'
import { useAdjustStock, useInventory } from '../features/inventory/hooks/useInventory'
import { useSettings } from '../features/settings/hooks/useSettings'
import { DEFAULT_SETTINGS } from '../services/settings.service'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { StockStatusFilter } from '../services/inventory.service'
import type { InventoryItem } from '../types'

export function InventoryPage() {
  const [search, setSearch] = useState('')
  const [stockStatus, setStockStatus] = useState<StockStatusFilter | ''>('')
  const [stockSort, setStockSort] = useState<'' | 'asc' | 'desc'>('')
  const [page, setPage] = useState(1)
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null)

  const debouncedSearch = useDebouncedValue(search)

  const { data: settings } = useSettings()
  const threshold = settings?.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold

  const { data, isLoading, isError, error, refetch } = useInventory({
    search: debouncedSearch || undefined,
    stock_status: stockStatus || undefined,
    threshold,
    sortBy: stockSort ? 'stockQuantity' : undefined,
    sortOrder: stockSort || undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  })

  const adjustMutation = useAdjustStock()

  function handleAdjustSubmit(values: StockAdjustFormValues) {
    if (!adjusting) return
    adjustMutation.mutate(
      { variantId: adjusting.id, input: values },
      { onSuccess: () => setAdjusting(null) }
    )
  }

  return (
    <div>
      <PageHeader title="Inventory" description="Track and adjust stock across all product variants." />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search by SKU or product name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="w-48">
          <Select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value as StockStatusFilter | '')
              setPage(1)
            }}
          >
            <option value="">All stock statuses</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={stockSort}
            onChange={(e) => {
              setStockSort(e.target.value as '' | 'asc' | 'desc')
              setPage(1)
            }}
          >
            <option value="">Sort: default</option>
            <option value="asc">Stock: Low to High</option>
            <option value="desc">Stock: High to Low</option>
          </Select>
        </div>
      </div>

      <InventoryTable
        items={data?.items ?? []}
        threshold={threshold}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        onAdjust={setAdjusting}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <Drawer open={!!adjusting} onClose={() => setAdjusting(null)} title="Adjust Stock">
        {adjusting && (
          <StockAdjustForm
            currentStock={adjusting.stockQuantity}
            onSubmit={handleAdjustSubmit}
            isSubmitting={adjustMutation.isPending}
            onCancel={() => setAdjusting(null)}
          />
        )}
      </Drawer>
    </div>
  )
}

