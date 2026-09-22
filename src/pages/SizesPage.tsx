import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { SizeTable } from '../features/sizes/SizeTable'
import { SizeForm, type SizeFormValues } from '../features/sizes/SizeForm'
import { useCreateSize, useDeleteSize, useSizes, useUpdateSize } from '../features/sizes/hooks/useSizes'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { Size } from '../types'

export function SizesPage() {
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Size | null>(null)
  const [deleting, setDeleting] = useState<Size | null>(null)

  const { data, isLoading, isError, error, refetch } = useSizes({ page, limit: DEFAULT_PAGE_SIZE })
  const createMutation = useCreateSize()
  const updateMutation = useUpdateSize()
  const deleteMutation = useDeleteSize()

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(size: Size) {
    setEditing(size)
    setFormOpen(true)
  }

  function handleSubmit(values: SizeFormValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, input: values }, { onSuccess: () => setFormOpen(false) })
    } else {
      createMutation.mutate(values, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div>
      <PageHeader
        title="Sizes"
        description="Manage the sizes available for your products."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Size
          </Button>
        }
      />

      <SizeTable
        sizes={data?.items ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Size' : 'New Size'}>
        <SizeForm
          initialValues={editing ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Deactivate size"
        description="This will mark the size as inactive. You can reactivate it later by editing its status."
        confirmLabel="Deactivate"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />
    </div>
  )
}
