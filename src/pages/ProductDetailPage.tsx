import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Edit02Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatusBadge } from '../components/Badge'
import { formatCurrency } from '../utils/formatCurrency'
import { useProduct } from '../features/products/hooks/useProducts'
import { ImageManager } from '../features/products/ImageManager'
import { VariantTable } from '../features/products/VariantTable'
import { VariantForm, type VariantFormValues } from '../features/products/VariantForm'
import {
  useCreateProductVariant,
  useDeleteProductVariant,
  useProductVariants,
  useUpdateProductVariant,
} from '../features/products/hooks/useProductVariants'
import type { ProductVariant } from '../types'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const { data: product, isLoading, isError, error, refetch } = useProduct(id)
  const { data: variants } = useProductVariants(id)

  const [variantFormOpen, setVariantFormOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null)

  const createVariant = useCreateProductVariant(id)
  const updateVariant = useUpdateProductVariant(id)
  const deleteVariant = useDeleteProductVariant(id)

  function openCreateVariant() {
    setEditingVariant(null)
    setVariantFormOpen(true)
  }

  function openEditVariant(variant: ProductVariant) {
    setEditingVariant(variant)
    setVariantFormOpen(true)
  }

  function handleVariantSubmit(values: VariantFormValues) {
    const input = {
      colorId: values.colorId,
      sizeId: values.sizeId,
      sku: values.sku || undefined,
      price: values.price ? Number(values.price) : null,
      stockQuantity: values.stockQuantity,
      status: values.status,
    }
    if (editingVariant) {
      updateVariant.mutate(
        { variantId: editingVariant.id, input },
        { onSuccess: () => setVariantFormOpen(false) }
      )
    } else {
      createVariant.mutate(input, { onSuccess: () => setVariantFormOpen(false) })
    }
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-40 w-full max-w-xl rounded-xl" />
      </div>
    )
  }

  if (isError || !product) {
    return <ErrorState error={error} onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={product.name}
        breadcrumbs={[{ label: 'Products', to: '/products' }, { label: product.name }]}
        actions={
          <Link to={`/products/${id}/edit`}>
            <Button variant="secondary">
              <HugeiconsIcon icon={Edit02Icon} size={16} />
              Edit
            </Button>
          </Link>
        }
      />

      <section className="rounded-xl border border-black/10 p-5 dark:border-white/10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Category" value={product.category.name} />
          <Info label="Product Type" value={product.productType} />
          <Info label="Base Price" value={formatCurrency(product.basePrice)} />
          <Info label="MRP" value={formatCurrency(product.mrp)} />
          <Info label="Slug" value={product.slug} />
          <Info label="Status" value={<StatusBadge status={product.status} />} />
        </div>
        {product.description && (
          <p className="mt-4 text-sm text-black/70 dark:text-white/70">{product.description}</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-black/70 dark:text-white/70">Images</h2>
        <ImageManager productId={id} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black/70 dark:text-white/70">Variants</h2>
          <Button onClick={openCreateVariant}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            Add Variant
          </Button>
        </div>
        <VariantTable
          variants={variants ?? []}
          onEdit={openEditVariant}
          onDelete={setDeletingVariant}
        />
      </section>

      <Modal
        open={variantFormOpen}
        onClose={() => setVariantFormOpen(false)}
        title={editingVariant ? 'Edit Variant' : 'Add Variant'}
      >
        <VariantForm
          initialValues={editingVariant ?? undefined}
          onSubmit={handleVariantSubmit}
          isSubmitting={createVariant.isPending || updateVariant.isPending}
          onCancel={() => setVariantFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deletingVariant}
        title="Deactivate variant"
        description="This will mark the variant as inactive. Inventory history is preserved."
        confirmLabel="Deactivate"
        isLoading={deleteVariant.isPending}
        onCancel={() => setDeletingVariant(null)}
        onConfirm={() => {
          if (deletingVariant)
            deleteVariant.mutate(deletingVariant.id, { onSuccess: () => setDeletingVariant(null) })
        }}
      />
    </div>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-black/50 dark:text-white/50">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  )
}
