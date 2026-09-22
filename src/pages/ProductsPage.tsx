import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Pagination } from '../components/Pagination'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ProductTable } from '../features/products/ProductTable'
import { ProductFilters } from '../features/products/ProductFilters'
import { ProductDetailDrawer } from '../features/products/ProductDetailDrawer'
import { ProductFormModal } from '../features/products/ProductFormModal'
import { useDeleteProduct, useDeleteProductPermanently, useProducts } from '../features/products/hooks/useProducts'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { Product, ProductStatus } from '../types'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedProductId = searchParams.get('selectedProduct')

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<ProductStatus | ''>('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [deletingPermanently, setDeletingPermanently] = useState<Product | null>(null)

  // Product Form Modal state for create & edit popups
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, error, refetch } = useProducts({
    search: debouncedSearch || undefined,
    category_id: categoryId || undefined,
    status: status || undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  })

  const deleteMutation = useDeleteProduct()
  const deletePermanentlyMutation = useDeleteProductPermanently()

  function handleOpenCreate() {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(product: Product) {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  function handleSelectProduct(product: Product) {
    setSearchParams((prev) => {
      prev.set('selectedProduct', product.id)
      return prev
    })
  }

  function handleCloseDrawer() {
    setSearchParams((prev) => {
      prev.delete('selectedProduct')
      return prev
    })
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        actions={
          <Button onClick={handleOpenCreate}>
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
        onDeletePermanently={setDeletingPermanently}
        onViewProduct={handleSelectProduct}
        onEditProduct={handleOpenEdit}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      {/* Product Detail Drawer */}
      <ProductDetailDrawer productId={selectedProductId} onClose={handleCloseDrawer} />

      {/* Product Create & Edit Pop-up Modal */}
      <ProductFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />

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

      <ConfirmDialog
        open={!!deletingPermanently}
        title="Delete product permanently"
        description="This cannot be undone. The product, its images, variants, and inventory history will be permanently removed."
        confirmLabel="Delete permanently"
        isLoading={deletePermanentlyMutation.isPending}
        onCancel={() => setDeletingPermanently(null)}
        onConfirm={() => {
          if (deletingPermanently)
            deletePermanentlyMutation.mutate(deletingPermanently.id, {
              onSuccess: () => setDeletingPermanently(null),
            })
        }}
      />
    </div>
  )
}


