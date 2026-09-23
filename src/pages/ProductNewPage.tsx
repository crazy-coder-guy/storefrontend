import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Image01Icon,
  Upload01Icon,
  Cancel01Icon,
  Coins01Icon,
  PackageIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Tick01Icon,
  TShirtIcon,
} from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Select } from '../components/Select'
import { BADGE_OPTIONS } from '../utils/constants'
import { Button } from '../components/Button'
import { useCreateProduct } from '../features/products/hooks/useProducts'
import { useAllCategories } from '../features/categories/hooks/useAllCategories'
import { uploadProductImage } from '../services/productImage.service'
import { formatCurrency } from '../utils/formatCurrency'
import { toast } from '../lib/toast'

const schema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  productType: z.string().min(1, 'Product type is required'),
  basePrice: z.coerce.number().positive('Base price must be greater than 0'),
  mrp: z.coerce.number().positive('MRP must be greater than 0'),
  badge: z.string().max(50).optional(),
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

type ProductFormValues = z.output<typeof schema>

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Title, description & type', icon: PackageIcon },
  { id: 2, title: 'Specifications', description: 'Fabric, fit & construction', icon: TShirtIcon },
  { id: 3, title: 'Pricing & Value', description: 'Base price & MRP', icon: Coins01Icon },
  { id: 4, title: 'Media & Category', description: 'Images & publication status', icon: Image01Icon },
]

const STEP_FIELDS: Partial<Record<number, (keyof ProductFormValues)[]>> = {
  1: ['name', 'productType'],
  3: ['basePrice', 'mrp'],
}

export function ProductNewPage() {
  const navigate = useNavigate()
  const createMutation = useCreateProduct()
  const { data: categoriesData, isLoading: categoriesLoading } = useAllCategories()
  const [currentStep, setCurrentStep] = useState<number>(1)

  const uploadImageMutation = useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadProductImage(productId, { file, imageType: 'PRODUCT', isPrimary: true }),
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
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
      badge: '',
      status: 'DRAFT',
      gsm: '',
      fabric: '',
      fit: '',
      neckType: '',
      biowash: false,
    },
  })

  const watchedName = watch('name')
  const watchedBasePrice = Number(watch('basePrice')) || 0
  const watchedMrp = Number(watch('mrp')) || 0

  // Auto-generate slug suggestion if slug field hasn't been touched
  useEffect(() => {
    if (watchedName && !watch('slug')) {
      const generatedSlug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setValue('slug', generatedSlug)
    }
  }, [watchedName, setValue, watch])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileSelected(file: File | null) {
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    handleFileSelected(selected)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  function removeImage() {
    setImageFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleNextStep() {
    const fields = STEP_FIELDS[currentStep]
    const isValid = !fields || (await trigger(fields))
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  function handlePrevStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  function onSubmit(values: ProductFormValues) {
    createMutation.mutate(
      {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
        categoryId: values.categoryId,
        productType: values.productType,
        basePrice: values.basePrice,
        mrp: values.mrp,
        badge: values.badge || undefined,
        status: values.status,
        gsm: values.gsm ? Number(values.gsm) : undefined,
        fabric: values.fabric || undefined,
        fit: values.fit || undefined,
        neckType: values.neckType || undefined,
        biowash: values.biowash ?? false,
      },
      {
        onSuccess: (product) => {
          if (!imageFile) {
            toast.success('Product created successfully')
            navigate('/products')
            return
          }
          uploadImageMutation.mutate(
            { productId: product.id, file: imageFile },
            {
              onError: (error) => toast.fromError(error, 'Product created, but image upload failed'),
              onSettled: () => {
                toast.success('Product and image saved successfully')
                navigate('/products')
              },
            }
          )
        },
      }
    )
  }

  const isSubmitting = createMutation.isPending || uploadImageMutation.isPending

  const discountPercent =
    watchedMrp && watchedBasePrice && watchedMrp > watchedBasePrice
      ? Math.round(((watchedMrp - watchedBasePrice) / watchedMrp) * 100)
      : 0

  return (
    <div className="w-full pb-12">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Page Header */}
        <PageHeader
          title="Create New Product"
          description="Follow the step-by-step wizard to create and publish your new product."
          breadcrumbs={[{ label: 'Products', to: '/products' }, { label: 'New Product' }]}
        />

        {/* 2-Column Split Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Vertical Stepper Sidebar Panel */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 flex flex-col gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-black">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-black/50 dark:text-white/50">
                    Wizard Progress
                  </span>
                  <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-0.5 text-[10px] font-bold text-black dark:border-white/10 dark:bg-white/10 dark:text-white">
                    {Math.round((currentStep / STEPS.length) * 100)}% Completed
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className="h-full bg-black transition-all duration-500 ease-out dark:bg-white"
                    style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Vertical Timeline Steps */}
              <div className="flex flex-col gap-1.5">
                {STEPS.map((step) => {
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={async () => {
                        if (isCompleted) {
                          setCurrentStep(step.id)
                        } else if (step.id > currentStep) {
                          const fields = STEP_FIELDS[currentStep]
                          const isValid = !fields || (await trigger(fields))
                          if (isValid) setCurrentStep(step.id)
                        }
                      }}
                      className={`group flex items-start gap-3 rounded-xl p-3 text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white ring-1 ring-black/10 dark:ring-white/10 font-bold'
                          : isCompleted
                          ? 'text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                          : 'text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 font-normal'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-extrabold transition-all ${
                          isCompleted
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'bg-black/5 text-black/50 dark:bg-white/5 dark:text-white/50'
                        }`}
                      >
                        {isCompleted ? (
                          <HugeiconsIcon icon={Tick01Icon} size={14} />
                        ) : (
                          <span className="text-xs">{step.id}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-tight tracking-tight">
                          {step.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-black/50 dark:text-white/50">
                          {step.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Helper Quick Tip Card */}
              <div className="mt-1 rounded-xl border border-black/5 bg-gray-50 p-3.5 text-xs text-black/60 dark:border-white/5 dark:bg-white/5 dark:text-white/60">
                <p className="font-bold text-black dark:text-white">💡 Pro Tip</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Setting an MRP higher than base price will highlight an automated percentage discount tag on your product.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Main Form Panel */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-black/10 bg-white p-6 shadow-2xs dark:border-white/10 dark:bg-black">
                <div className="mb-5 flex items-center gap-2.5 border-b border-black/10 pb-3.5 dark:border-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
                    <HugeiconsIcon icon={PackageIcon} size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                      Step 1: Basic Product Information
                    </h2>
                    <p className="text-xs text-black/50 dark:text-white/50">
                      Enter the title, URL slug, description, and classification tag.
                    </p>
                  </div>
                </div>

                  <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                      label="Product Title"
                      placeholder="e.g. Oversized Heavyweight Cotton Hoodie"
                      {...register('name')}
                      error={errors.name?.message}
                    />

                    <Input
                      label="Product Type"
                      placeholder="e.g. Hoodie, T-Shirt, Oversized, Denim"
                      hint="Grouping tag for filtering."
                      {...register('productType')}
                      error={errors.productType?.message}
                    />
                  </div>

                  <Textarea
                    label="Product Description"
                    placeholder="Describe the product materials, fit, care instructions..."
                    rows={4}
                    {...register('description')}
                    error={errors.description?.message}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Product Specifications */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-black/10 bg-white p-6 shadow-2xs dark:border-white/10 dark:bg-black">
                <div className="mb-5 flex items-center gap-2.5 border-b border-black/10 pb-3.5 dark:border-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
                    <HugeiconsIcon icon={TShirtIcon} size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                      Step 2: Specifications & Construction
                    </h2>
                    <p className="text-xs text-black/50 dark:text-white/50">
                      Optional material details like fabric GSM, fit type, and neck style.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label="Fabric GSM"
                    type="number"
                    placeholder="e.g. 240"
                    hint="Grams per Square Meter"
                    {...register('gsm')}
                    error={errors.gsm?.message}
                  />

                  <Input
                    label="Fabric Material"
                    placeholder="e.g. 100% French Terry Cotton"
                    {...register('fabric')}
                    error={errors.fabric?.message}
                  />

                  <Select label="Fit Type" {...register('fit')} error={errors.fit?.message}>
                    <option value="">Select fit (optional)</option>
                    <option value="REGULAR">Regular Fit</option>
                    <option value="SLIM">Slim Fit</option>
                    <option value="OVERSIZED">Oversized Fit</option>
                    <option value="RELAXED">Relaxed Fit</option>
                  </Select>

                  <Select label="Neck / Style Type" {...register('neckType')} error={errors.neckType?.message}>
                    <option value="">Select neck style (optional)</option>
                    <option value="CREW">Crew Neck</option>
                    <option value="ROUND">Round Neck</option>
                    <option value="POLO">Polo Collar</option>
                    <option value="V_NECK">V-Neck</option>
                    <option value="MOCK">Mock Neck</option>
                  </Select>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <input
                    type="checkbox"
                    id="biowash-cb"
                    {...register('biowash')}
                    className="h-4 w-4 rounded border-black/20 text-black focus:ring-black dark:border-white/20 dark:bg-black dark:checked:bg-white"
                  />
                  <label htmlFor="biowash-cb" className="text-xs font-semibold text-black dark:text-white cursor-pointer">
                    Bio-Washed Fabric Treatment (Pre-shrunk premium soft feel)
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Valuation */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-black/10 bg-white p-6 shadow-2xs dark:border-white/10 dark:bg-black">
                <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-3.5 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
                      <HugeiconsIcon icon={Coins01Icon} size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                        Step 3: Pricing & Valuation
                      </h2>
                      <p className="text-xs text-black/50 dark:text-white/50">
                        Set selling price and maximum retail price.
                      </p>
                    </div>
                  </div>
                  {discountPercent > 0 && (
                    <span className="rounded-md border border-black/10 bg-black/5 px-2.5 py-1 text-xs font-bold text-black dark:border-white/10 dark:bg-white/10 dark:text-white">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                    hint="Original strike-through price before discount."
                    {...register('mrp')}
                    error={errors.mrp?.message}
                  />
                </div>

                <div className="mt-5">
                  <Select label="Badge" {...register('badge')} error={errors.badge?.message}>
                    <option value="">None</option>
                    {BADGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>

                {watchedBasePrice > 0 && watchedMrp > 0 && (
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5 text-xs">
                    <span className="text-black/60 dark:text-white/60">Customer Offer Summary:</span>
                    <span className="font-bold text-black dark:text-white">
                      {formatCurrency(watchedBasePrice)} (Customer Saves {formatCurrency(Math.max(0, watchedMrp - watchedBasePrice))})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Media & Organization */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-black/10 bg-white p-6 shadow-2xs dark:border-white/10 dark:bg-black">
                <div className="mb-5 flex items-center gap-2.5 border-b border-black/10 pb-3.5 dark:border-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
                    <HugeiconsIcon icon={Image01Icon} size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                      Step 4: Primary Media & Store Organization
                    </h2>
                    <p className="text-xs text-black/50 dark:text-white/50">
                      Upload product hero image and select catalog category.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Media Uploader */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
                      Primary Media Image
                    </p>
                    {previewUrl ? (
                      <div className="relative overflow-hidden rounded-xl border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-800">
                        <img src={previewUrl} alt="Product Preview" className="h-52 w-full object-cover" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-2.5 top-2.5 rounded-lg bg-black/80 p-1.5 text-white backdrop-blur-xs hover:bg-black dark:bg-white/90 dark:text-black cursor-pointer"
                          aria-label="Remove image"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragActive(true)
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors cursor-pointer ${
                          dragActive
                            ? 'border-black bg-black/5 dark:border-white dark:bg-white/10'
                            : 'border-black/15 hover:border-black/40 dark:border-white/20 dark:hover:border-white/50'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white mb-2">
                          <HugeiconsIcon icon={Upload01Icon} size={20} />
                        </div>
                        <p className="text-xs font-semibold text-black dark:text-white">
                          Click or drag image
                        </p>
                        <p className="mt-0.5 text-[10px] text-black/40 dark:text-white/40">
                          PNG, JPG, WEBP
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Organization Selects */}
                  <div className="flex flex-col gap-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
                      Catalog Options
                    </p>
                    <Select label="Category" {...register('categoryId')} error={errors.categoryId?.message}>
                      <option value="">{categoriesLoading ? 'Loading categories…' : 'Select a category'}</option>
                      {categoriesData?.items.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
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
              </div>
            )}

            {/* Navigation Buttons Footer Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-2xs dark:border-white/10 dark:bg-black">
              <Button
                type="button"
                variant="secondary"
                onClick={currentStep === 1 ? () => navigate('/products') : handlePrevStep}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold"
              >
                {currentStep === 1 ? (
                  'Cancel'
                ) : (
                  <>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                    Previous Step
                  </>
                )}
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold"
                >
                  Continue to Step {currentStep + 1}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold"
                >
                  {isSubmitting ? 'Creating Product…' : 'Save & Publish Product'}
                  <HugeiconsIcon icon={Tick01Icon} size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
