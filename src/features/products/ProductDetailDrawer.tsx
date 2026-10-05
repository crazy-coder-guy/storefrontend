import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Edit02Icon, Image01Icon } from '@hugeicons/core-free-icons'
import { Drawer } from '../../components/Drawer'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { Modal } from '../../components/Modal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StatusBadge } from '../../components/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { useProduct } from './hooks/useProducts'
import { useProductImages, useUploadProductImage, useDeleteProductImage } from './hooks/useProductImages'
import { VariantTable } from './VariantTable'
import {
  VariantForm,
  type ColorImageFiles,
  COLOR_IMAGE_SLOTS,
  type ColorImageSlotKey,
  type VariantFormValues,
} from './VariantForm'
import { VariantPhotosModal } from './VariantPhotosModal'
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

export function ProductDetailDrawer({ productId, onClose }: ProductDetailDrawerProps) {
  const open = Boolean(productId)
  const id = productId ?? ''

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data: product, isLoading, isError, error, refetch } = useProduct(id)
  const { data: variants } = useProductVariants(id)
  const { data: images } = useProductImages(id)

  const [variantFormOpen, setVariantFormOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null)
  const [photosVariant, setPhotosVariant] = useState<ProductVariant | null>(null)

  const createVariant = useCreateProductVariant(id)
  const updateVariant = useUpdateProductVariant(id)
  const deleteVariant = useDeleteProductVariant(id)
  const uploadImage = useUploadProductImage(id)
  const deleteImage = useDeleteProductImage(id)

  const primaryImage = images?.find((img) => img.isPrimary) ?? images?.[0]
  const totalStock = variants?.reduce((acc, v) => acc + v.stockQuantity, 0) ?? 0
  const variantCount = variants?.length ?? 0

  function openCreateVariant() {
    setEditingVariant(null)
    setVariantFormOpen(true)
  }

  function openEditVariant(variant: ProductVariant) {
    setEditingVariant(variant)
    setVariantFormOpen(true)
  }

  async function handleVariantSubmit(
    values: VariantFormValues,
    colorImages: ColorImageFiles,
    replacedImageIds: Partial<Record<ColorImageSlotKey, string>> = {},
    deletedImageIds: string[] = []
  ) {
    const input = {
      colorId: values.colorId || undefined,
      sizeId: values.sizeId,
      sku: values.sku || undefined,
      price: values.price ? Number(values.price) : null,
      costPrice: values.costPrice ? Number(values.costPrice) : null,
      stockQuantity: values.stockQuantity,
      chestWidth: values.chestWidth !== '' && values.chestWidth != null ? Number(values.chestWidth) : null,
      bodyLength: values.bodyLength !== '' && values.bodyLength != null ? Number(values.bodyLength) : null,
      sleeveLength: values.sleeveLength !== '' && values.sleeveLength != null ? Number(values.sleeveLength) : null,
      shoulderWidth: values.shoulderWidth !== '' && values.shoulderWidth != null ? Number(values.shoulderWidth) : null,
    }

    const processImagesAndClose = async () => {
      // 1. Delete any images marked for deletion
      for (const delId of deletedImageIds) {
        try {
          await deleteImage.mutateAsync(delId)
        } catch (e) {
          console.error('Failed to delete image', e)
        }
      }

      // 2. Upload any new or replacement files
      const hasAnyImageYet = (images?.length ?? 0) > 0
      for (let index = 0; index < COLOR_IMAGE_SLOTS.length; index++) {
        const slot = COLOR_IMAGE_SLOTS[index]
        const file = colorImages[slot.key]
        if (!file) continue

        const replacedOldId = replacedImageIds[slot.key]
        try {
          await uploadImage.mutateAsync({
            file,
            colorId: values.colorId || undefined,
            imageType: 'PRODUCT',
            sortOrder: index,
            isPrimary: slot.key === 'hero' && !hasAnyImageYet,
          })
          if (replacedOldId) {
            await deleteImage.mutateAsync(replacedOldId)
          }
        } catch (e) {
          console.error('Failed to upload/replace slot image', e)
        }
      }

      setVariantFormOpen(false)
    }

    if (editingVariant) {
      updateVariant.mutate(
        { variantId: editingVariant.id, input },
        { onSuccess: processImagesAndClose }
      )
    } else {
      createVariant.mutate(input, { onSuccess: processImagesAndClose })
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

          {/* Variants */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3 dark:border-white/10">
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
                images={images ?? []}
                onEdit={openEditVariant}
                onDelete={setDeletingVariant}
                onManagePhotos={(v) => setPhotosVariant(v)}
              />
            </div>
          </div>

          {/* Variant Form Modal */}
          <Modal
            open={variantFormOpen}
            onClose={() => setVariantFormOpen(false)}
            title={editingVariant ? 'Edit Variant' : 'Add Variant'}
          >
            <VariantForm
              initialValues={editingVariant ?? undefined}
              existingImages={images ?? []}
              onSubmit={handleVariantSubmit}
              isSubmitting={createVariant.isPending || updateVariant.isPending}
              onCancel={() => setVariantFormOpen(false)}
              onOpenPhotosModal={
                editingVariant
                  ? () => {
                      setVariantFormOpen(false)
                      setPhotosVariant(editingVariant)
                    }
                  : undefined
              }
            />
          </Modal>

          {/* Variant Photos Management Modal */}
          <VariantPhotosModal
            open={!!photosVariant}
            onClose={() => setPhotosVariant(null)}
            productId={id}
            variant={photosVariant}
            existingImages={images ?? []}
          />

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
