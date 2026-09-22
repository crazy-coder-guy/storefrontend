import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Delete02Icon, StarIcon } from '@hugeicons/core-free-icons'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import {
  useCreateProductImage,
  useDeleteProductImage,
  useProductImages,
  useUpdateProductImage,
} from './hooks/useProductImages'
import type { ImageType, ProductImage } from '../../types'

export function ImageManager({ productId }: { productId: string }) {
  const { data: images, isLoading } = useProductImages(productId)
  const createMutation = useCreateProductImage(productId)
  const updateMutation = useUpdateProductImage(productId)
  const deleteMutation = useDeleteProductImage(productId)

  const [url, setUrl] = useState('')
  const [imageType, setImageType] = useState<ImageType>('PRODUCT')
  const [deleting, setDeleting] = useState<ProductImage | null>(null)

  function handleAdd() {
    if (!url.trim()) return
    createMutation.mutate(
      { imageUrl: url.trim(), imageType },
      { onSuccess: () => setUrl('') }
    )
  }

  function handleMakePrimary(image: ProductImage) {
    updateMutation.mutate({ imageId: image.id, input: { isPrimary: true } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select label="Type" value={imageType} onChange={(e) => setImageType(e.target.value as ImageType)}>
            <option value="PRODUCT">Product</option>
            <option value="MODEL">Model</option>
            <option value="LIFESTYLE">Lifestyle</option>
          </Select>
        </div>
        <Button onClick={handleAdd} disabled={!url.trim() || createMutation.isPending}>
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Add Image
        </Button>
      </div>

      {url.trim() && (
        <div className="h-32 w-32 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <img
            src={url}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.opacity = '0.2')}
          />
        </div>
      )}

      {isLoading && <p className="text-sm text-black/50 dark:text-white/50">Loading images…</p>}

      {!isLoading && (!images || images.length === 0) && (
        <EmptyState title="No images yet" description="Paste an image URL above to add one." />
      )}

      {!isLoading && images && images.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative w-36 overflow-hidden rounded-lg border border-black/10 dark:border-white/10"
            >
              <img src={image.imageUrl} alt={image.imageType} className="h-36 w-36 object-cover" />
              <div className="flex items-center justify-between gap-1 p-1.5">
                <span className="truncate text-xs text-black/50 dark:text-white/50">{image.imageType}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMakePrimary(image)}
                    className={`rounded p-1 ${image.isPrimary ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40'}`}
                    aria-label="Set primary"
                    title="Set as primary"
                  >
                    <HugeiconsIcon icon={StarIcon} size={14} />
                  </button>
                  <button
                    onClick={() => setDeleting(image)}
                    className="rounded p-1 text-black/40 hover:text-red-500 dark:text-white/40"
                    aria-label="Delete image"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </button>
                </div>
              </div>
              {image.isPrimary && (
                <span className="absolute left-1 top-1 rounded-full bg-black px-1.5 py-0.5 text-[10px] text-white dark:bg-white dark:text-black">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete image"
        description="Delete this image? This cannot be undone."
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />
    </div>
  )
}
