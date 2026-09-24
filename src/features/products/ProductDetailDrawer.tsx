import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  Edit02Icon,
  Image01Icon,
  Layers01Icon,
} from '@hugeicons/core-free-icons'
import { Drawer } from '../../components/Drawer'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Modal } from '../../components/Modal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StatusBadge } from '../../components/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { useProduct } from './hooks/useProducts'
import { useProductImages } from './hooks/useProductImages'
import { ImageManager } from './ImageManager'
import { VariantTable } from './VariantTable'
import { VariantForm, type VariantFormValues } from './VariantForm'
import { ProductFormModal } from './ProductFormModal'
import {
  useCreateProductVariant,
  useDeleteProductVariant,
  useProductVariants,
  useUpdateProductVariant,
} from './hooks/useProductVariants'
import type { ProductVariant } from '../../types'

interface ProductDetailDrawerProps {
  productId: string | null
  onClose: () => void
}

type TabType = 'variants' | 'images'

export function ProductDetailDrawer({ productId, onClose }: ProductDetailDrawerProps) {
  const open = Boolean(productId)
  const id = productId ?? ''

  const [activeTab, setActiveTab] = useState<TabType>('variants')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data: product, isLoading, isError, error, refetch } = useProduct(id)
  const { data: variants } = useProductVariants(id)
  const { data: images } = useProductImages(id)

  const [variantFormOpen, setVariantFormOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null)

  const createVariant = useCreateProductVariant(id)
  const updateVariant = useUpdateProductVariant(id)
  const deleteVariant = useDeleteProductVariant(id)

  const primaryImage = images?.find((img) => img.isPrimary) ?? images?.[0]
  const totalStock = variants?.reduce((acc, v) => acc + v.stockQuantity, 0) ?? 0
  const variantCount = variants?.length ?? 0
  const imageCount = images?.length ?? 0

  const productColors = Array.from(
    new Map((variants ?? []).filter((v) => v.color).map((v) => [v.color!.id, v.color!])).values()
  )

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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        product ? (
          <div className="flex items-center gap-2.5 truncate">
            <span className="truncate font-semibold text-black dark:text-white">{product.name}</span>
            <StatusBadge status={product.status} />
          </div>
        ) : (
          'Product Details'
        )
      }
    >
      {!open ? null : isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : isError || !product ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Header Banner & Summary Card */}
          <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-gray-50/50 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-800">
                  {primaryImage ? (
                    <img
                      src={primaryImage.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <HugeiconsIcon icon={Image01Icon} size={28} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-black/5 px-2 py-0.5 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/70">
                      {product.category.name}
                    </span>
                    <span className="text-xs text-black/40 dark:text-white/40">{product.productType}</span>
                  </div>
                  <h2 className="mt-1 truncate text-lg sm:text-xl font-bold tracking-tight text-black dark:text-white">
                    {product.name}
                  </h2>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(true)}
                className="self-start sm:self-auto px-3 py-1.5 text-xs shadow-xs"
              >
                <HugeiconsIcon icon={Edit02Icon} size={15} />
                Edit Product
              </Button>
            </div>

            <ProductFormModal
              open={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              productToEdit={product}
            />

            {/* Quick Metrics Bar */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/10 pt-4 sm:grid-cols-4 dark:border-white/10">
              <MetricTile label="Base Price" value={formatCurrency(product.basePrice)} />
              <MetricTile
                label="MRP"
                value={
                  <span className="flex items-center gap-1.5">
                    {formatCurrency(product.mrp)}
                    {product.mrp > product.basePrice && (
                      <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-semibold text-black dark:bg-white/10 dark:text-white">
                        {Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)}% off
                      </span>
                    )}
                  </span>
                }
              />
              <MetricTile label="Total Variants" value={`${variantCount} variants`} />
              <MetricTile
                label="Total Stock"
                value={
                  <span className="text-black dark:text-white">
                    {totalStock} units
                  </span>
                }
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-black/10 no-scrollbar dark:border-white/10">
            <button
              onClick={() => setActiveTab('variants')}
              className={`flex items-center gap-2 shrink-0 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'variants'
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
              }`}
            >
              <HugeiconsIcon icon={Layers01Icon} size={16} />
              Variants ({variantCount})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 shrink-0 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'images'
                  ? 'border-black text-black dark:border-white dark:text-white'
                  : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
              }`}
            >
              <HugeiconsIcon icon={Image01Icon} size={16} />
              Gallery ({imageCount})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'variants' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80">
                    Product Variants
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    Manage colors, sizes, pricing overrides, and inventory stock levels.
                  </p>
                </div>
                <Button className="px-3 py-1.5 text-xs shadow-xs" onClick={openCreateVariant}>
                  <HugeiconsIcon icon={Add01Icon} size={15} />
                  Add Variant
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
                <VariantTable
                  variants={variants ?? []}
                  onEdit={openEditVariant}
                  onDelete={setDeletingVariant}
                />
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80">
                  Media Gallery
                </h3>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Upload images and set primary thumbnail for catalog display.
                </p>
              </div>
              <ImageManager productId={id} colors={productColors} />
            </div>
          )}

          {/* Variant Form Modal */}
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

          {/* Variant Confirm Deactivate Dialog */}
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
      )}
    </Drawer>
  )
}

function MetricTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-black/50 dark:text-white/50">{label}</p>
      <div className="mt-0.5 text-sm font-bold text-black dark:text-white">{value}</div>
    </div>
  )
}
