import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, StarIcon, Upload01Icon, EyeIcon } from '@hugeicons/core-free-icons'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { Modal } from '../../components/Modal'
import {
  useDeleteProductImage,
  useProductImages,
  useUpdateProductImage,
  useUploadProductImage,
} from './hooks/useProductImages'
import type { Color, ImageType, ProductImage } from '../../types'

interface ImageManagerProps {
  productId: string
  /** Colors this product actually has variants in — the only valid choices for tagging an image. */
  colors: Color[]
}

const NO_COLOR = ''

export function ImageManager({ productId, colors }: ImageManagerProps) {
  const { data: images, isLoading } = useProductImages(productId)
  const uploadMutation = useUploadProductImage(productId)
  const updateMutation = useUpdateProductImage(productId)
  const deleteMutation = useDeleteProductImage(productId)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageType, setImageType] = useState<ImageType>('PRODUCT')
  const [colorId, setColorId] = useState<string>(NO_COLOR)
  const [deleting, setDeleting] = useState<ProductImage | null>(null)
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<ProductImage | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileSelected(selected: File | null) {
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0] ?? null
    handleFileSelected(droppedFile)
  }

  function handleUpload() {
    if (!file) return
    uploadMutation.mutate(
      { file, imageType, colorId: colorId || undefined },
      {
        onSuccess: () => {
          setFile(null)
          setPreviewUrl(null)
          setColorId(NO_COLOR)
          if (fileInputRef.current) fileInputRef.current.value = ''
        },
      }
    )
  }

  function handleMakePrimary(image: ProductImage) {
    updateMutation.mutate({ imageId: image.id, input: { isPrimary: true } })
  }

  function handleChangeColor(image: ProductImage, newColorId: string) {
    updateMutation.mutate({ imageId: image.id, input: { colorId: newColorId || null } })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sleek Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? 'border-black bg-black/5 dark:border-white dark:bg-white/10'
            : 'border-black/15 bg-gray-50/60 hover:border-black/30 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
        />

        {previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-black/10 shadow-sm dark:border-white/10">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <p className="max-w-xs truncate text-xs font-semibold text-black dark:text-white">{file?.name}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="w-36">
                <Select value={imageType} onChange={(e) => setImageType(e.target.value as ImageType)}>
                  <option value="PRODUCT">Product</option>
                  <option value="MODEL">Model</option>
                  <option value="LIFESTYLE">Lifestyle</option>
                </Select>
              </div>
              <div className="w-40">
                <Select value={colorId} onChange={(e) => setColorId(e.target.value)}>
                  <option value={NO_COLOR}>No specific color</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="px-4 py-2 text-xs font-semibold">
                <HugeiconsIcon icon={Upload01Icon} size={15} />
                {uploadMutation.isPending ? 'Uploading…' : 'Upload Image'}
              </Button>
              <button
                onClick={() => {
                  setFile(null)
                  setPreviewUrl(null)
                }}
                className="text-xs text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black dark:bg-white/10 dark:text-white">
              <HugeiconsIcon icon={Upload01Icon} size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-black dark:text-white">
                Drag and drop your image here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="underline underline-offset-2 hover:text-black/70 dark:hover:text-white/70"
                >
                  browse
                </button>
              </p>
              <p className="mt-0.5 text-[11px] text-black/40 dark:text-white/40">PNG, JPG, WEBP up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {isLoading && <p className="text-xs text-black/50 dark:text-white/50">Loading gallery images…</p>}

      {!isLoading && (!images || images.length === 0) && (
        <EmptyState title="No gallery images" description="Upload product, model, or lifestyle images to display here." />
      )}

      {/* Grid Gallery Cards */}
      {!isLoading && images && images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all dark:bg-black ${
                image.isPrimary
                  ? 'border-black ring-2 ring-black/10 dark:border-white dark:ring-white/20'
                  : 'border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30'
              }`}
            >
              {/* Aspect Square Thumbnail Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img
                  src={image.imageUrl}
                  alt={image.imageType}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Primary Badge Pill */}
                {image.isPrimary ? (
                  <span className="absolute left-2 top-2 rounded-md bg-black px-2 py-0.5 text-[10px] font-bold text-white shadow-xs dark:bg-white dark:text-black">
                    Primary
                  </span>
                ) : (
                  <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase text-white backdrop-blur-xs">
                    {image.imageType}
                  </span>
                )}

                {/* Assigned Color Swatch */}
                {image.color && (
                  <span
                    className="absolute right-2 top-2 h-4 w-4 rounded-full border border-white/70 shadow-xs"
                    style={{ backgroundColor: image.color.hexCode }}
                    title={image.color.name}
                  />
                )}
              </div>

              {/* Color Assignment Row */}
              <div className="border-t border-black/10 px-2.5 py-1.5 dark:border-white/10">
                <Select
                  value={image.colorId ?? NO_COLOR}
                  onChange={(e) => handleChangeColor(image, e.target.value)}
                  className="!py-1 !text-[11px]"
                >
                  <option value={NO_COLOR}>No specific color</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Explicit Action Controls Row */}
              <div className="flex items-center justify-between border-t border-black/10 bg-gray-50/50 px-2.5 py-2 dark:border-white/10 dark:bg-white/5">
                <button
                  onClick={() => setSelectedPreviewImage(image)}
                  className="flex items-center gap-1 text-[11px] font-medium text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
                  title="View Preview"
                >
                  <HugeiconsIcon icon={EyeIcon} size={14} />
                  <span>View</span>
                </button>

                <div className="flex items-center gap-1">
                  {!image.isPrimary && (
                    <button
                      onClick={() => handleMakePrimary(image)}
                      className="rounded p-1 text-black/50 hover:bg-black/10 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                      title="Set as Primary Thumbnail"
                    >
                      <HugeiconsIcon icon={StarIcon} size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleting(image)}
                    className="rounded p-1 text-black/40 hover:bg-rose-500/10 hover:text-rose-600 dark:text-white/40 dark:hover:bg-rose-500/20 dark:hover:text-rose-400"
                    title="Delete Image"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      <Modal
        open={Boolean(selectedPreviewImage)}
        onClose={() => setSelectedPreviewImage(null)}
        title={selectedPreviewImage ? `Image Preview (${selectedPreviewImage.imageType})` : 'Image Preview'}
      >
        {selectedPreviewImage && (
          <div className="flex flex-col items-center gap-4">
            <div className="max-h-[70vh] overflow-hidden rounded-xl border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-900">
              <img
                src={selectedPreviewImage.imageUrl}
                alt={selectedPreviewImage.imageType}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="flex w-full items-center justify-between text-xs">
              <span className="rounded-md bg-black/5 px-2.5 py-1 font-semibold text-black dark:bg-white/10 dark:text-white">
                Tag: {selectedPreviewImage.imageType}
              </span>
              {!selectedPreviewImage.isPrimary && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleMakePrimary(selectedPreviewImage)
                    setSelectedPreviewImage(null)
                  }}
                  className="px-3 py-1.5 text-xs"
                >
                  Set as Primary
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete image"
        description="Delete this image? This action cannot be undone."
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />
    </div>
  )
}


