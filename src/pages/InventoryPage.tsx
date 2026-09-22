import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { InventoryTable } from '../features/inventory/InventoryTable'
import { StockAdjustForm, type StockAdjustFormValues } from '../features/inventory/StockAdjustForm'
import { useAdjustStock, useInventory } from '../features/inventory/hooks/useInventory'
import { useSettings } from '../features/settings/hooks/useSettings'
import { DEFAULT_SETTINGS } from '../services/settings.service'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { InventoryItem } from '../types'

export function InventoryPage() {
  const [sku, setSku] = useState('')
  const [productName, setProductName] = useState('')
  const [page, setPage] = useState(1)
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null)

  const debouncedSku = useDebouncedValue(sku)
  const debouncedProductName = useDebouncedValue(productName)

  const { data: settings } = useSettings()
  const threshold = settings?.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold

  const { data, isLoading, isError, error, refetch } = useInventory({
    sku: debouncedSku || undefined,
    product_name: debouncedProductName || undefined,
    page,
    limit: 10,
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
        <div className="w-56">
          <Input
            placeholder="Search by SKU…"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="w-56">
          <Input
            placeholder="Search by product name…"
            value={productName}
            onChange={(e) => {
              setProductName(e.target.value)
              setPage(1)
            }}
          />
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

      <Modal open={!!adjusting} onClose={() => setAdjusting(null)} title="Adjust Stock">
        {adjusting && (
          <StockAdjustForm
            currentStock={adjusting.stockQuantity}
            onSubmit={handleAdjustSubmit}
            isSubmitting={adjustMutation.isPending}
            onCancel={() => setAdjusting(null)}
          />
        )}
      </Modal>
    </div>
  )
}
