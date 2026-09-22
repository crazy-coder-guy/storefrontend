import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Upload01Icon,
  Cancel01Icon,
  Coins01Icon,
  PackageIcon,
  Image01Icon,
  TShirtIcon,
  Tick01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { useCreateProduct } from './hooks/useProducts'
import { useAllCategories } from '../categories/hooks/useAllCategories'
import { uploadProductImage } from '../../services/productImage.service'
import { formatCurrency } from '../../utils/formatCurrency'
import { toast } from '../../lib/toast'
import * as productService from '../../services/product.service'
import type { Product } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  productType: z.string().min(1, 'Product type is required'),
  basePrice: z.coerce.number().positive('Base price must be greater than 0'),
  mrp: z.coerce.number().positive('MRP must be greater than 0'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  gsm: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) > 0), {
      message: 'GSM must be a positive whole number',
    }),
  fabric: z.string().optional(),
  fit: z.union([z.enum(['REGULAR', 'SLIM', 'OVERSIZED', 'RELAXED']), z.literal('')]).optional(),
  neckType: z.union([z.enum(['CREW', 'V_NECK', 'POLO', 'ROUND', 'MOCK']), z.literal('')]).optional(),
  biowash: z.boolean().optional(),
})

type FormValues = z.output<typeof schema>

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  productToEdit?: Product | null
}

export function ProductFormModal({ open, onClose, productToEdit }: ProductFormModalProps) {
  const queryClient = useQueryClient()
  const createMutation = useCreateProduct()
  const { data: categoriesData, isLoading: categoriesLoading } = useAllCategories()

  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'specs' | 'media'>('general')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!productToEdit

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      productService.updateProduct(productToEdit!.id, {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
        categoryId: values.categoryId,
        productType: values.productType,
        basePrice: values.basePrice,
        mrp: values.mrp,
        status: values.status,
        gsm: values.gsm ? Number(values.gsm) : undefined,
        fabric: values.fabric || undefined,
        fit: values.fit || undefined,
        neckType: values.neckType || undefined,
        biowash: values.biowash ?? false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
      handleClose()
    },
    onError: (error) => toast.fromError(error),
  })

  const uploadImageMutation = useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadProductImage(productId, { file, imageType: 'PRODUCT', isPrimary: true }),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      categoryId: '',
      productType: '',
      basePrice: 0,
      mrp: 0,
      status: 'DRAFT',
      gsm: '',
      fabric: '',
      fit: '',
      neckType: '',
      biowash: false,
    },
  })

  useEffect(() => {
    if (open) {
      setActiveTab('general')
      if (productToEdit) {
        reset({
          name: productToEdit.name ?? '',
          slug: productToEdit.slug ?? '',
          description: productToEdit.description ?? '',
          categoryId: productToEdit.categoryId ?? '',
          productType: productToEdit.productType ?? '',
          basePrice: productToEdit.basePrice ?? 0,
          mrp: productToEdit.mrp ?? 0,
          status: productToEdit.status ?? 'DRAFT',
          gsm: productToEdit.gsm != null ? String(productToEdit.gsm) : '',
          fabric: productToEdit.fabric ?? '',
          fit: productToEdit.fit ?? '',
          neckType: productToEdit.neckType ?? '',
          biowash: productToEdit.biowash ?? false,
        })
        const primaryImg = productToEdit.images?.[0]?.imageUrl
        if (primaryImg) setPreviewUrl(primaryImg)
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          categoryId: '',
          productType: '',
          basePrice: 0,
          mrp: 0,
          status: 'DRAFT',
          gsm: '',
          fabric: '',
          fit: '',
          neckType: '',
          biowash: false,
        })
        setImageFile(null)
        setPreviewUrl(null)
      }
    }
  }, [open, productToEdit, reset])

  const watchedName = watch('name')
  const watchedBasePrice = Number(watch('basePrice')) || 0
  const watchedMrp = Number(watch('mrp')) || 0

  useEffect(() => {
    if (watchedName && !watch('slug') && !isEditing) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setValue('slug', generatedSlug)
    }
  }, [watchedName, setValue, watch, isEditing])

  function handleFileSelected(file: File | null) {
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose() {
    setImageFile(null)
    setPreviewUrl(null)
    reset()
    onClose()
  }

  function onSubmit(values: FormValues) {
    if (isEditing) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(
        {
          name: values.name,
          slug: values.slug || undefined,
          description: values.description || undefined,
          categoryId: values.categoryId,
          productType: values.productType,
          basePrice: values.basePrice,
          mrp: values.mrp,
          status: values.status,
        },
        {
          onSuccess: (product) => {
            if (!imageFile) {
              toast.success('Product created successfully')
              handleClose()
              return
            }
            uploadImageMutation.mutate(
              { productId: product.id, file: imageFile },
              {
                onSettled: () => {
                  toast.success('Product created with image')
                  handleClose()
                },
              }
            )
          },
        }
      )
    }
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending

  const discountPercent =
    watchedMrp && watchedBasePrice && watchedMrp > watchedBasePrice
      ? Math.round(((watchedMrp - watchedBasePrice) / watchedMrp) * 100)
      : 0

  const tabs = [
    { id: 'general', label: 'Basic Info', icon: PackageIcon, hasError: !!(errors.name || errors.productType) },
    { id: 'pricing', label: 'Pricing & Catalog', icon: Coins01Icon, hasError: !!(errors.basePrice || errors.mrp || errors.categoryId) },
    { id: 'specs', label: 'Specifications', icon: TShirtIcon, hasError: !!(errors.gsm || errors.fabric) },
    { id: 'media', label: 'Primary Media', icon: Image01Icon, hasError: false },
  ] as const

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Edit Product' : 'Create New Product'}
      widthClassName="max-w-2xl sm:max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-black/10 dark:border-white/10 gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border-b-2 -mb-[2px] ${
                  isActive
                    ? 'border-black text-black dark:border-white dark:text-white'
                    : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
                }`}
              >
                <HugeiconsIcon icon={tab.icon} size={16} />
                <span>{tab.label}</span>
                {tab.hasError && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="min-h-[280px] py-1">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Product Title"
                  placeholder="e.g. Oversized Heavyweight Hoodie"
                  {...register('name')}
                  error={errors.name?.message}
                />

                <Input
                  label="Product Type / Tag"
                  placeholder="e.g. Hoodie, T-Shirt, Oversized"
                  {...register('productType')}
                  error={errors.productType?.message}
                />
              </div>

              <Textarea
                label="Product Description"
                placeholder="Describe product materials, fit instructions, care guidelines..."
                rows={5}
                {...register('description')}
                error={errors.description?.message}
              />
            </div>
          )}

          {/* TAB 2: PRICING & CATALOG */}
          {activeTab === 'pricing' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Selling Base Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="1299"
                  {...register('basePrice')}
                  error={errors.basePrice?.message}
                />
                <Input
                  label="Maximum Retail Price (MRP) (₹)"
                  type="number"
                  step="0.01"
                  placeholder="1599"
                  hint="Original strike-through price"
                  {...register('mrp')}
                  error={errors.mrp?.message}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-black/10 dark:border-white/10">
                <Select label="Category" {...register('categoryId')} error={errors.categoryId?.message}>
                  <option value="">{categoriesLoading ? 'Loading categories…' : 'Select a Category'}</option>
                  {categoriesData?.items.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>

                <Select label="Publication Status" {...register('status')} error={errors.status?.message}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </div>
            </div>
          )}

          {/* TAB 3: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Fabric GSM"
                  type="number"
                  placeholder="e.g. 240"
                  hint="Grams per Square Meter"
                  {...register('gsm')}
                  error={errors.gsm?.message}
                />

                <Input
                  label="Fabric Material Composition"
                  placeholder="e.g. 100% French Terry Cotton"
                  {...register('fabric')}
                  error={errors.fabric?.message}
                />

                <Select label="Fit Style" {...register('fit')} error={errors.fit?.message}>
                  <option value="">Select Fit Style (Optional)</option>
                  <option value="REGULAR">Regular Fit</option>
                  <option value="SLIM">Slim Fit</option>
                  <option value="OVERSIZED">Oversized Fit</option>
                  <option value="RELAXED">Relaxed Fit</option>
                </Select>

                <Select label="Neck Type" {...register('neckType')} error={errors.neckType?.message}>
                  <option value="">Select Neck Style (Optional)</option>
                  <option value="CREW">Crew Neck</option>
                  <option value="ROUND">Round Neck</option>
                  <option value="POLO">Polo Collar</option>
                  <option value="V_NECK">V-Neck</option>
                  <option value="MOCK">Mock Neck</option>
                </Select>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <input
                  type="checkbox"
                  id="biowash-tab-cb"
                  {...register('biowash')}
                  className="h-4 w-4 rounded border-black/20 text-black focus:ring-black dark:border-white/20 dark:bg-black dark:checked:bg-white"
                />
                <label htmlFor="biowash-tab-cb" className="text-xs font-semibold text-black dark:text-white cursor-pointer">
                  Bio-Washed Fabric Treatment (Pre-shrunk premium soft feel)
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: PRIMARY MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {previewUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-900 max-w-md mx-auto">
                  <img src={previewUrl} alt="Preview" className="h-56 w-full object-cover" />
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-3 top-3 rounded-lg bg-black/80 p-1.5 text-white hover:bg-black cursor-pointer"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragActive(false)
                    if (e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0])
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-black bg-black/5 dark:border-white dark:bg-white/10'
                      : 'border-black/15 hover:border-black/40 dark:border-white/20 dark:hover:border-white/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white mb-3">
                    <HugeiconsIcon icon={Upload01Icon} size={24} />
                  </div>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    Click or drag primary image here
                  </p>
                  <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                    Supports PNG, JPG, WEBP formats
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
          {/* Left Side: Live Price & Discount Typography */}
          <div>
            {watchedBasePrice > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-black dark:text-white">
                  {formatCurrency(watchedBasePrice)}
                </span>
                {watchedMrp > watchedBasePrice && (
                  <>
                    <span className="text-xs font-medium text-black/40 line-through dark:text-white/40">
                      {formatCurrency(watchedMrp)}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-xs text-black/40 dark:text-white/40 font-medium">New Product Draft</span>
            )}
          </div>

          {/* Right Side: Grouped Action Buttons with Left/Right Tab Arrow Navigation */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting} className="px-3.5 text-xs">
              Cancel
            </Button>

            {/* Left & Right Arrow Tab Steppers */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                disabled={activeTab === 'general'}
                onClick={() => {
                  const idx = tabs.findIndex((t) => t.id === activeTab)
                  if (idx > 0) setActiveTab(tabs[idx - 1].id)
                }}
                className="px-2.5 py-2 text-xs"
                title="Previous Tab"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={activeTab === 'media'}
                onClick={() => {
                  const idx = tabs.findIndex((t) => t.id === activeTab)
                  if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id)
                }}
                className="px-2.5 py-2 text-xs"
                title="Next Tab"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
              </Button>
            </div>

            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-1.5 px-5 text-xs font-bold">
              <span>
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes…'
                    : 'Creating Product…'
                  : isEditing
                  ? 'Update Product'
                  : 'Save Product'}
              </span>
              <HugeiconsIcon icon={Tick01Icon} size={16} />
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
