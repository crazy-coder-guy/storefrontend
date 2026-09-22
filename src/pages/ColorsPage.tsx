import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { ColorTable } from '../features/colors/ColorTable'
import { ColorForm, type ColorFormValues } from '../features/colors/ColorForm'
import { useColors, useCreateColor, useDeleteColor, useUpdateColor } from '../features/colors/hooks/useColors'
import type { Color } from '../types'

export function ColorsPage() {
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Color | null>(null)
  const [deleting, setDeleting] = useState<Color | null>(null)

  const { data, isLoading, isError, error, refetch } = useColors({ page, limit: 10 })
  const createMutation = useCreateColor()
  const updateMutation = useUpdateColor()
  const deleteMutation = useDeleteColor()

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(color: Color) {
    setEditing(color)
    setFormOpen(true)
  }

  function handleSubmit(values: ColorFormValues) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, input: values }, { onSuccess: () => setFormOpen(false) })
    } else {
      createMutation.mutate(values, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div>
      <PageHeader
        title="Colors"
        description="Manage the colors available for your products."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Color
          </Button>
        }
      />

      <ColorTable
        colors={data?.items ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Color' : 'New Color'}>
        <ColorForm
          initialValues={editing ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Deactivate color"
        description="This will mark the color as inactive. You can reactivate it later by editing its status."
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
