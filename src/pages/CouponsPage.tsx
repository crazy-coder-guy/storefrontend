import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { CouponTable } from '../features/coupons/CouponTable'
import { CouponForm, type CouponFormValues } from '../features/coupons/CouponForm'
import { useCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from '../features/coupons/hooks/useCoupons'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { Coupon } from '../types'

export function CouponsPage() {
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [deleting, setDeleting] = useState<Coupon | null>(null)

  const { data, isLoading, isError, error, refetch } = useCoupons({ page, limit: DEFAULT_PAGE_SIZE })
  const createMutation = useCreateCoupon()
  const updateMutation = useUpdateCoupon()
  const deleteMutation = useDeleteCoupon()

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon)
    setFormOpen(true)
  }

  function handleSubmit(values: CouponFormValues) {
    const input = {
      ...values,
      minOrderValue: values.minOrderValue ?? null,
      maxDiscountAmount: values.type === 'FIXED' ? null : values.maxDiscountAmount ?? null,
      usageLimit: values.usageLimit ?? null,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, input }, { onSuccess: () => setFormOpen(false) })
    } else {
      createMutation.mutate(input, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Create and manage discount codes customers can apply at checkout."
        actions={
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Coupon
          </Button>
        }
      />

      <CouponTable
        coupons={data?.items ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Coupon' : 'New Coupon'}>
        <CouponForm
          initialValues={editing ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete coupon"
        description="This permanently removes the coupon code. This can't be undone."
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }}
      />
    </div>
  )
}
