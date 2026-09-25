import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon, Video01Icon, Location01Icon, PackageIcon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { Pagination } from '../components/Pagination'
import { SkeletonRows } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Button } from '../components/Button'
import { Drawer } from '../components/Drawer'
import { StatusBadge } from '../components/Badge'
import { useReviews, useDeleteReview } from '../hooks/useReviews'
import { formatDate } from '../utils/formatDate'
import { formatCurrency } from '../utils/formatCurrency'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { Review } from '../services/review.service'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          size={14}
          className={star <= rating ? 'text-amber-500' : 'text-black/15 dark:text-white/15'}
          fill={star <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export function ReviewsPage() {
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Review | null>(null)
  const [preview, setPreview] = useState<Review | null>(null)

  const { data, isLoading, isError, error, refetch } = useReviews({ page, limit: DEFAULT_PAGE_SIZE })
  const deleteMutation = useDeleteReview()

  function handleConfirmDelete() {
    if (!deleting) return
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null)
        setPreview((prev) => (prev?.id === deleting.id ? null : prev))
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Customer ratings and reviews submitted from the storefront."
      />

      <Table<Review>
        rowKey={(row) => row.id}
        data={data?.items ?? []}
        isLoading={isLoading}
        loadingRows={<SkeletonRows cols={6} />}
        isError={isError}
        errorContent={<ErrorState error={error} onRetry={() => refetch()} />}
        emptyContent={
          <EmptyState title="No reviews yet" description="Reviews appear here once shoppers rate a delivered order." />
        }
        columns={[
          {
            header: 'Product',
            key: 'product',
            className: 'min-w-[180px]',
            render: (row) => (
              <button
                type="button"
                onClick={() => setPreview(row)}
                className="text-left font-medium hover:underline cursor-pointer"
              >
                {row.productName}
              </button>
            ),
          },
          {
            header: 'Rating',
            key: 'rating',
            className: 'min-w-[110px]',
            render: (row) => <Stars rating={row.rating} />,
          },
          {
            header: 'Review',
            key: 'comment',
            className: 'min-w-[260px] max-w-sm',
            render: (row) => <p className="line-clamp-2 text-black/70 dark:text-white/70">{row.comment}</p>,
          },
          {
            header: 'Media',
            key: 'media',
            className: 'min-w-[90px]',
            render: (row) =>
              row.images.length > 0 || row.video ? (
                <span className="text-xs text-black/50 dark:text-white/50">
                  {row.images.length > 0 && `${row.images.length} photo${row.images.length > 1 ? 's' : ''}`}
                  {row.images.length > 0 && row.video && ' · '}
                  {row.video && (
                    <span className="inline-flex items-center gap-1">
                      <HugeiconsIcon icon={Video01Icon} size={12} />
                      video
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-xs text-black/30 dark:text-white/30">—</span>
              ),
          },
          {
            header: 'Reviewer',
            key: 'reviewer',
            className: 'min-w-[160px]',
            render: (row) => (
              <button
                type="button"
                onClick={() => setPreview(row)}
                className="text-left cursor-pointer"
              >
                <p className="font-medium hover:underline">{row.reviewerName}</p>
                <p className="text-xs text-black/50 dark:text-white/50">{row.reviewerEmail}</p>
              </button>
            ),
          },
          {
            header: 'Date',
            key: 'createdAt',
            className: 'min-w-[120px]',
            render: (row) => formatDate(row.createdAt),
          },
          {
            header: '',
            key: 'actions',
            className: 'min-w-[80px] text-right',
            render: (row) => (
              <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => setDeleting(row)}>
                Delete
              </Button>
            ),
          },
        ]}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this review?"
        description="This permanently removes the review and any attached photos/video from the storefront."
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <Drawer
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        widthClassName="sm:max-w-md lg:max-w-lg"
        title={preview ? preview.reviewerName : 'Review Detail'}
      >
        {preview && (
          <div className="flex flex-col divide-y divide-black/10 text-sm dark:divide-white/10">
            {/* Reviewer */}
            <div className="pb-5 first:pt-0 space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                Reviewer
              </span>
              <div className="flex items-center gap-3 pt-1">
                {preview.reviewerPhoto ? (
                  <img src={preview.reviewerPhoto} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-xs font-semibold dark:bg-white/10">
                    {preview.reviewerName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{preview.reviewerName}</p>
                  <p className="text-xs text-black/50 dark:text-white/50">{preview.reviewerEmail}</p>
                </div>
              </div>
            </div>

            {/* Rating + Review Text + Media */}
            <div className="py-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                  {preview.productName}
                </span>
                <Stars rating={preview.rating} />
              </div>
              <p className="text-black/80 dark:text-white/80">{preview.comment}</p>
              {(preview.images.length > 0 || preview.video) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {preview.images.map((url) => (
                    <img key={url} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  ))}
                  {preview.video && (
                    <video src={preview.video} controls className="h-20 w-32 rounded-lg object-cover" />
                  )}
                </div>
              )}
              <p className="text-xs text-black/40 dark:text-white/40">{formatDate(preview.createdAt)}</p>
            </div>

            {/* Order this review is tied to */}
            <div className="py-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                  Verified Purchase — Order {preview.order.orderNumber}
                </span>
                <StatusBadge status={preview.order.status} />
              </div>
              <div className="flex items-start gap-2 text-black/70 dark:text-white/70">
                <HugeiconsIcon icon={Location01Icon} size={15} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-black dark:text-white">{preview.order.customerName}</p>
                  <p className="text-xs">{preview.order.shippingAddress}</p>
                  <p className="text-xs">{preview.order.customerPhone}</p>
                </div>
              </div>
              <p className="text-xs text-black/50 dark:text-white/50">
                Ordered on {formatDate(preview.order.createdAt)} · {preview.order.paymentStatus === 'PAID' ? 'Paid' : preview.order.paymentStatus} · {formatCurrency(preview.order.totalAmount)}
              </p>
            </div>

            {/* Items purchased in that order */}
            <div className="py-5 space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                Items Purchased
              </span>
              <div className="space-y-3">
                {preview.order.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg p-2 ${
                      item.productId === preview.productId ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : ''
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <HugeiconsIcon icon={PackageIcon} size={18} className="text-black/30 dark:text-white/30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {item.productName}
                        {item.productId === preview.productId && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                            Reviewed
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-black/50 dark:text-white/50">
                        {item.colorName} · Size {item.sizeCode} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5">
              <Button variant="danger" onClick={() => setDeleting(preview)}>
                Delete Review
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
