import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Pagination } from '../components/Pagination'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ProductTable } from '../features/products/ProductTable'
import { ProductFilters } from '../features/products/ProductFilters'
import { useDeleteProduct, useProducts } from '../features/products/hooks/useProducts'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { Product, ProductStatus } from '../types'

export function ProductsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<ProductStatus | ''>('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, error, refetch } = useProducts({
    search: debouncedSearch || undefined,
    category_id: categoryId || undefined,
    status: status || undefined,
    page,
    limit: 10,
  })

  const deleteMutation = useDeleteProduct()

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        actions={
          <Button onClick={() => navigate('/products/new')}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Product
          </Button>
        }
      />

      <ProductFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        categoryId={categoryId}
        onCategoryChange={(v) => {
          setCategoryId(v)
          setPage(1)
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
      />

      <ProductTable
        products={data?.items ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        onDelete={setDeleting}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!deleting}
        title="Deactivate product"
        description="This will mark the product as inactive. You can reactivate it later by editing its status."
        confirmLabel="Deactivate"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />
    </div>
  )
}
