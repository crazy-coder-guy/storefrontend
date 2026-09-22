import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, CheckmarkSquare01Icon, ColorsIcon, TapeMeasureIcon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Drawer } from '../components/Drawer'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { SizeTable } from '../features/sizes/SizeTable'
import { SizeForm, type SizeFormValues } from '../features/sizes/SizeForm'
import { useCreateSize, useDeleteSize, useSizes, useUpdateSize } from '../features/sizes/hooks/useSizes'
import { ColorTable } from '../features/colors/ColorTable'
import { ColorForm, type ColorFormValues } from '../features/colors/ColorForm'
import { useColors, useCreateColor, useDeleteColor, useUpdateColor } from '../features/colors/hooks/useColors'
import { CategoryTable } from '../features/categories/CategoryTable'
import { CategoryForm, type CategoryFormValues } from '../features/categories/CategoryForm'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useDeleteCategoryPermanently,
  useUpdateCategory,
} from '../features/categories/hooks/useCategories'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { Category, Color, Size } from '../types'
import { cn } from '../utils/cn'

type AttributeTab = 'categories' | 'sizes' | 'colors'

export function ProductAttributesPage() {
  const [activeTab, setActiveTab] = useState<AttributeTab>('categories')

  // Categories State & Hooks
  const [catSearch, setCatSearch] = useState('')
  const [catPage, setCatPage] = useState(1)
  const debouncedCatSearch = useDebouncedValue(catSearch)

  const [catFormOpen, setCatFormOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [deletingCat, setDeletingCat] = useState<Category | null>(null)
  const [deletingCatPerm, setDeletingCatPerm] = useState<Category | null>(null)

  const {
    data: catData,
    isLoading: catLoading,
    isError: catIsError,
    error: catError,
    refetch: refetchCat,
  } = useCategories({
    search: debouncedCatSearch || undefined,
    page: catPage,
    limit: DEFAULT_PAGE_SIZE,
  })

  const createCatMutation = useCreateCategory()
  const updateCatMutation = useUpdateCategory()
  const deleteCatMutation = useDeleteCategory()
  const deleteCatPermMutation = useDeleteCategoryPermanently()

  // Sizes State & Hooks
  const [sizePage, setSizePage] = useState(1)
  const [sizeFormOpen, setSizeFormOpen] = useState(false)
  const [editingSize, setEditingSize] = useState<Size | null>(null)
  const [deletingSize, setDeletingSize] = useState<Size | null>(null)

  const {
    data: sizesData,
    isLoading: sizesLoading,
    isError: sizesIsError,
    error: sizesError,
    refetch: refetchSizes,
  } = useSizes({ page: sizePage, limit: DEFAULT_PAGE_SIZE })

  const createSizeMutation = useCreateSize()
  const updateSizeMutation = useUpdateSize()
  const deleteSizeMutation = useDeleteSize()

  // Colors State & Hooks
  const [colorPage, setColorPage] = useState(1)
  const [colorFormOpen, setColorFormOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [deletingColor, setDeletingColor] = useState<Color | null>(null)

  const {
    data: colorsData,
    isLoading: colorsLoading,
    isError: colorsIsError,
    error: colorsError,
    refetch: refetchColors,
  } = useColors({ page: colorPage, limit: DEFAULT_PAGE_SIZE })

  const createColorMutation = useCreateColor()
  const updateColorMutation = useUpdateColor()
  const deleteColorMutation = useDeleteColor()

  // Category Handlers
  function openCreateCat() {
    setEditingCat(null)
    setCatFormOpen(true)
  }

  function openEditCat(category: Category) {
    setEditingCat(category)
    setCatFormOpen(true)
  }

  function handleCatSubmit(values: CategoryFormValues) {
    const input = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      status: values.status,
    }
    if (editingCat) {
      updateCatMutation.mutate({ id: editingCat.id, input }, { onSuccess: () => setCatFormOpen(false) })
    } else {
      createCatMutation.mutate(input, { onSuccess: () => setCatFormOpen(false) })
    }
  }

  // Size Handlers
  function openCreateSize() {
    setEditingSize(null)
    setSizeFormOpen(true)
  }

  function openEditSize(size: Size) {
    setEditingSize(size)
    setSizeFormOpen(true)
  }

  function handleSizeSubmit(values: SizeFormValues) {
    if (editingSize) {
      updateSizeMutation.mutate({ id: editingSize.id, input: values }, { onSuccess: () => setSizeFormOpen(false) })
    } else {
      createSizeMutation.mutate(values, { onSuccess: () => setSizeFormOpen(false) })
    }
  }

  // Color Handlers
  function openCreateColor() {
    setEditingColor(null)
    setColorFormOpen(true)
  }

  function openEditColor(color: Color) {
    setEditingColor(color)
    setColorFormOpen(true)
  }

  function handleColorSubmit(values: ColorFormValues) {
    if (editingColor) {
      updateColorMutation.mutate({ id: editingColor.id, input: values }, { onSuccess: () => setColorFormOpen(false) })
    } else {
      createColorMutation.mutate(values, { onSuccess: () => setColorFormOpen(false) })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Attributes"
        description="Manage categories, size options, and color swatches for your product catalog."
        actions={
          activeTab === 'categories' ? (
            <Button onClick={openCreateCat}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              New Category
            </Button>
          ) : activeTab === 'sizes' ? (
            <Button onClick={openCreateSize}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              New Size
            </Button>
          ) : (
            <Button onClick={openCreateColor}>
              <HugeiconsIcon icon={Add01Icon} size={16} />
              New Color
            </Button>
          )
        }
      />

      {/* Segmented Tab Navigation */}
      <div className="flex border-b border-black/10 dark:border-white/10">
        <button
          onClick={() => setActiveTab('categories')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'categories'
              ? 'border-black text-black dark:border-white dark:text-white font-semibold'
              : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
          )}
        >
          <HugeiconsIcon icon={CheckmarkSquare01Icon} size={18} />
          <span>Categories</span>
          {catData?.meta.total !== undefined && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">
              {catData.meta.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sizes')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'sizes'
              ? 'border-black text-black dark:border-white dark:text-white font-semibold'
              : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
          )}
        >
          <HugeiconsIcon icon={TapeMeasureIcon} size={18} />
          <span>Sizes</span>
          {sizesData?.meta.total !== undefined && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">
              {sizesData.meta.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'colors'
              ? 'border-black text-black dark:border-white dark:text-white font-semibold'
              : 'border-transparent text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
          )}
        >
          <HugeiconsIcon icon={ColorsIcon} size={18} />
          <span>Colors</span>
          {colorsData?.meta.total !== undefined && (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">
              {colorsData.meta.total}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <Input
              placeholder="Search categories…"
              value={catSearch}
              onChange={(e) => {
                setCatSearch(e.target.value)
                setCatPage(1)
              }}
            />
          </div>
          <CategoryTable
            categories={catData?.items ?? []}
            isLoading={catLoading}
            isError={catIsError}
            error={catError}
            onRetry={() => refetchCat()}
            onEdit={openEditCat}
            onDelete={setDeletingCat}
            onDeletePermanently={setDeletingCatPerm}
          />
          {catData && <Pagination meta={catData.meta} onPageChange={setCatPage} />}
        </div>
      )}

      {activeTab === 'sizes' && (
        <div className="space-y-4">
          <SizeTable
            sizes={sizesData?.items ?? []}
            isLoading={sizesLoading}
            isError={sizesIsError}
            error={sizesError}
            onRetry={() => refetchSizes()}
            onEdit={openEditSize}
            onDelete={setDeletingSize}
          />
          {sizesData && <Pagination meta={sizesData.meta} onPageChange={setSizePage} />}
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="space-y-4">
          <ColorTable
            colors={colorsData?.items ?? []}
            isLoading={colorsLoading}
            isError={colorsIsError}
            error={colorsError}
            onRetry={() => refetchColors()}
            onEdit={openEditColor}
            onDelete={setDeletingColor}
          />
          {colorsData && <Pagination meta={colorsData.meta} onPageChange={setColorPage} />}
        </div>
      )}

      {/* Category Drawer Sheet */}
      <Drawer open={catFormOpen} onClose={() => setCatFormOpen(false)} title={editingCat ? 'Edit Category' : 'New Category'} widthClassName="sm:max-w-md lg:max-w-lg">
        <CategoryForm
          initialValues={editingCat ?? undefined}
          onSubmit={handleCatSubmit}
          isSubmitting={createCatMutation.isPending || updateCatMutation.isPending}
          onCancel={() => setCatFormOpen(false)}
        />
      </Drawer>

      {/* Size Drawer Sheet */}
      <Drawer open={sizeFormOpen} onClose={() => setSizeFormOpen(false)} title={editingSize ? 'Edit Size' : 'New Size'} widthClassName="sm:max-w-md lg:max-w-lg">
        <SizeForm
          initialValues={editingSize ?? undefined}
          onSubmit={handleSizeSubmit}
          isSubmitting={createSizeMutation.isPending || updateSizeMutation.isPending}
          onCancel={() => setSizeFormOpen(false)}
        />
      </Drawer>

      {/* Color Drawer Sheet */}
      <Drawer open={colorFormOpen} onClose={() => setColorFormOpen(false)} title={editingColor ? 'Edit Color' : 'New Color'} widthClassName="sm:max-w-md lg:max-w-lg">
        <ColorForm
          initialValues={editingColor ?? undefined}
          onSubmit={handleColorSubmit}
          isSubmitting={createColorMutation.isPending || updateColorMutation.isPending}
          onCancel={() => setColorFormOpen(false)}
        />
      </Drawer>

      {/* Category Delete Dialog */}
      <ConfirmDialog
        open={!!deletingCat}
        title="Deactivate category"
        description="This will mark the category as inactive. You can reactivate it later by editing its status."
        confirmLabel="Deactivate"
        isLoading={deleteCatMutation.isPending}
        onCancel={() => setDeletingCat(null)}
        onConfirm={() => {
          if (deletingCat) deleteCatMutation.mutate(deletingCat.id, { onSuccess: () => setDeletingCat(null) })
        }}
      />

      <ConfirmDialog
        open={!!deletingCatPerm}
        title="Delete category permanently"
        description="This cannot be undone. The category will be permanently removed."
        confirmLabel="Delete permanently"
        isLoading={deleteCatPermMutation.isPending}
        onCancel={() => setDeletingCatPerm(null)}
        onConfirm={() => {
          if (deletingCatPerm)
            deleteCatPermMutation.mutate(deletingCatPerm.id, {
              onSuccess: () => setDeletingCatPerm(null),
            })
        }}
      />

      {/* Size Delete Dialog */}
      <ConfirmDialog
        open={!!deletingSize}
        title="Deactivate size"
        description="This will mark the size as inactive. You can reactivate it later by editing its status."
        confirmLabel="Deactivate"
        isLoading={deleteSizeMutation.isPending}
        onCancel={() => setDeletingSize(null)}
        onConfirm={() => {
          if (deletingSize) deleteSizeMutation.mutate(deletingSize.id, { onSuccess: () => setDeletingSize(null) })
        }}
      />

      {/* Color Delete Dialog */}
      <ConfirmDialog
        open={!!deletingColor}
        title="Deactivate color"
        description="This will mark the color as inactive. You can reactivate it later by editing its status."
        confirmLabel="Deactivate"
        isLoading={deleteColorMutation.isPending}
        onCancel={() => setDeletingColor(null)}
        onConfirm={() => {
          if (deletingColor) deleteColorMutation.mutate(deletingColor.id, { onSuccess: () => setDeletingColor(null) })
        }}
      />
    </div>
  )
}
