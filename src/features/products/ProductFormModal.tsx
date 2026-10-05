import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Coins01Icon,
  PackageIcon,
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
import { useCreateProduct, useProduct } from './hooks/useProducts'
import { useAllCategories } from '../categories/hooks/useAllCategories'
import { formatCurrency } from '../../utils/formatCurrency'
import { toast } from '../../lib/toast'
import * as productService from '../../services/product.service'
import { BADGE_OPTIONS } from '../../utils/constants'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { usePricingRecommendation } from '../pricing/hooks/usePricingSettings'
import type { Product } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  productType: z.string().min(1, 'Product type is required'),
  basePrice: z.coerce.number().positive('Base price must be greater than 0'),
  mrp: z.coerce.number().positive('MRP must be greater than 0'),
  costPrice: z.coerce
    .number()
    .nonnegative('Cost price must be 0 or more')
    .optional()
    .or(z.literal('')),
  badge: z.string().max(50).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'LAUNCHING_SOON']),
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

  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'specs'>('general')

  const isEditing = !!productToEdit
  // The list endpoint deliberately omits costPrice for privacy, so when this modal is
  // opened from a list-sourced `productToEdit` we re-fetch the single-product detail
  // (which does include it) to avoid accidentally wiping an existing cost price on save.
  const { data: fullProductToEdit } = useProduct(isEditing ? productToEdit?.id : undefined)

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
        costPrice: values.costPrice !== '' && values.costPrice != null ? Number(values.costPrice) : null,
        badge: values.badge || null,
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
      costPrice: '',
      badge: '',
      status: 'DRAFT',
      gsm: '',
      fabric: '',
      fit: '',
      neckType: '',
      biowash: false,
    },
  })

  const recommendMutation = usePricingRecommendation()

  useEffect(() => {
    if (open) {
      setActiveTab('general')
      recommendMutation.reset()
      if (productToEdit) {
        reset({
          name: productToEdit.name ?? '',
          slug: productToEdit.slug ?? '',
          description: productToEdit.description ?? '',
          categoryId: productToEdit.categoryId ?? '',
          productType: productToEdit.productType ?? '',
          basePrice: productToEdit.basePrice ?? 0,
          mrp: productToEdit.mrp ?? 0,
          costPrice: productToEdit.costPrice != null ? productToEdit.costPrice : '',
          badge: productToEdit.badge ?? '',
          status: productToEdit.status ?? 'DRAFT',
          gsm: productToEdit.gsm != null ? String(productToEdit.gsm) : '',
          fabric: productToEdit.fabric ?? '',
          fit: productToEdit.fit ?? '',
          neckType: productToEdit.neckType ?? '',
          biowash: productToEdit.biowash ?? false,
        })
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          categoryId: '',
          productType: '',
          basePrice: 0,
          mrp: 0,
          costPrice: '',
          badge: '',
          status: 'DRAFT',
          gsm: '',
          fabric: '',
          fit: '',
          neckType: '',
          biowash: false,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productToEdit, reset])

  // Once the authoritative single-product detail loads (it may arrive after the reset
  // above, since it's a separate fetch), sync the real costPrice into the form.
  useEffect(() => {
    if (open && isEditing && fullProductToEdit) {
      setValue('costPrice', fullProductToEdit.costPrice != null ? fullProductToEdit.costPrice : '')
    }
  }, [open, isEditing, fullProductToEdit, setValue])

  const watchedName = watch('name')
  const watchedBasePrice = Number(watch('basePrice')) || 0
  const watchedMrp = Number(watch('mrp')) || 0
  const watchedCostPrice = watch('costPrice')
  const costPriceNum =
    watchedCostPrice !== '' && watchedCostPrice != null && !Number.isNaN(Number(watchedCostPrice))
      ? Number(watchedCostPrice)
      : 0
  const debouncedCostPrice = useDebouncedValue(costPriceNum, 450)

  useEffect(() => {
    if (debouncedCostPrice > 0) {
      recommendMutation.mutate(debouncedCostPrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCostPrice])

  const recommendation = debouncedCostPrice > 0 ? recommendMutation.data : undefined
  const paymentGatewayFeeAtActualPrice = recommendation
    ? (watchedBasePrice * recommendation.paymentGatewayPercent) / 100
    : 0
  const totalCostAtActualPrice = recommendation ? recommendation.fixedCost + paymentGatewayFeeAtActualPrice : 0
  const expectedProfit = recommendation ? watchedBasePrice - totalCostAtActualPrice : 0
  const profitMarginPercent =
    recommendation && watchedBasePrice > 0 ? (expectedProfit / watchedBasePrice) * 100 : 0

  useEffect(() => {
    if (watchedName && !watch('slug') && !isEditing) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setValue('slug', generatedSlug)
    }
  }, [watchedName, setValue, watch, isEditing])

  function handleClose() {
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
          costPrice: values.costPrice !== '' && values.costPrice != null ? Number(values.costPrice) : null,
          badge: values.badge || null,
          status: values.status,
          gsm: values.gsm ? Number(values.gsm) : undefined,
          fabric: values.fabric || undefined,
          fit: values.fit || undefined,
          neckType: values.neckType || undefined,
          biowash: values.biowash ?? false,
        },
        {
          onSuccess: () => {
            toast.success('Product created successfully — add sizes, colors (optional) and photos next')
            handleClose()
          },
        }
      )
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const discountPercent =
    watchedMrp && watchedBasePrice && watchedMrp > watchedBasePrice
      ? Math.round(((watchedMrp - watchedBasePrice) / watchedMrp) * 100)
      : 0

  const tabs = [
    { id: 'general', label: 'Basic Info', icon: PackageIcon, hasError: !!(errors.name || errors.productType) },
    { id: 'pricing', label: 'Pricing & Catalog', icon: Coins01Icon, hasError: !!(errors.basePrice || errors.mrp || errors.costPrice || errors.categoryId) },
    { id: 'specs', label: 'Specifications', icon: TShirtIcon, hasError: !!(errors.gsm || errors.fabric) },
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Cost Price (₹)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 180"
                  hint="What this product costs you to make/source. Used to calculate margins — never shown to customers."
                  {...register('costPrice')}
                  error={errors.costPrice?.message}
                />
              </div>

              {costPriceNum > 0 && (
                <div className="rounded-xl border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-black/50 dark:text-white/50">
                    Profitability Preview
                  </p>
                  {recommendMutation.isPending && !recommendMutation.data ? (
                    <p className="text-xs text-black/50 dark:text-white/50">Calculating…</p>
                  ) : recommendMutation.isError ? (
                    <p className="text-xs text-black/40 dark:text-white/40">
                      Couldn't calculate a recommendation right now — pricing settings may be unavailable.
                    </p>
                  ) : recommendation ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <p className="text-[11px] text-black/50 dark:text-white/50">Recommended Price</p>
                        <p className="text-sm font-bold text-black dark:text-white">
                          {formatCurrency(recommendation.recommendedSellingPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-black/50 dark:text-white/50">Actual Selling Price</p>
                        <p className="text-sm font-bold text-black dark:text-white">
                          {watchedBasePrice > 0 ? formatCurrency(watchedBasePrice) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-black/50 dark:text-white/50">Expected Profit</p>
                        <p
                          className={`text-sm font-bold ${
                            watchedBasePrice > 0 && expectedProfit < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-black dark:text-white'
                          }`}
                        >
                          {watchedBasePrice > 0 ? formatCurrency(expectedProfit) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-black/50 dark:text-white/50">Profit Margin</p>
                        <p
                          className={`text-sm font-bold ${
                            watchedBasePrice > 0 && profitMarginPercent < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-black dark:text-white'
                          }`}
                        >
                          {watchedBasePrice > 0 ? `${profitMarginPercent.toFixed(1)}%` : '—'}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <option value="LAUNCHING_SOON">Launching Soon</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </div>

              <Select
                label="Badge"
                {...register('badge')}
                error={errors.badge?.message}
              >
                <option value="">None — No badge</option>
                {BADGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
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
                disabled={activeTab === 'specs'}
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
