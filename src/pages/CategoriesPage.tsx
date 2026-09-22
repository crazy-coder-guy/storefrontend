import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
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
import type { Category } from '../types'

export function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [deletingPermanently, setDeletingPermanently] = useState<Category | null>(null)

  const { data, isLoading, isError, error, refetch } = useCategories({
    search: debouncedSearch || undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  })

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const deletePermanentlyMutation = useDeleteCategoryPermanently()

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setFormOpen(true)
  }

  function handleSubmit(values: CategoryFormValues) {
    const input = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      status: values.status,
    }
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, input },
        { onSuccess: () => setFormOpen(false) }
      )
    } else {
      createMutation.mutate(input, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your products into categories."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Category
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <CategoryTable
        categories={data?.items ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        onEdit={openEdit}
        onDelete={setDeleting}
        onDeletePermanently={setDeletingPermanently}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Category' : 'New Category'}
      >
        <CategoryForm
          initialValues={editing ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Deactivate category"
        description="This will mark the category as inactive. You can reactivate it later by editing its status."
        confirmLabel="Deactivate"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />

      <ConfirmDialog
        open={!!deletingPermanently}
        title="Delete category permanently"
        description="This cannot be undone. The category will be permanently removed."
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
