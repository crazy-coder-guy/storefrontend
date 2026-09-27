import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Location01Icon, PackageIcon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Pagination } from '../components/Pagination'
import { SkeletonRows } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { Drawer } from '../components/Drawer'
import { Textarea } from '../components/Textarea'
import { StatusBadge } from '../components/Badge'
import { ColorSwatch } from '../components/ColorSwatch'
import { useExchanges, useUpdateExchangeStatus } from '../hooks/useExchanges'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { formatDate } from '../utils/formatDate'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import type { ExchangeRequest, ExchangeStatus } from '../services/exchange.service'

const REASON_LABEL: Record<string, string> = {
  DAMAGED: 'Arrived damaged',
  DEFECTIVE: 'Defective / faulty',
  WRONG_ITEM: 'Wrong item received',
  SIZE_FIT: 'Size / fit issue',
  OTHER: 'Other',
}

const NEXT_STATUSES: Record<ExchangeStatus, ExchangeStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['COMPLETED', 'REJECTED'],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
}

export function ExchangesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ExchangeStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ExchangeRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')

  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, error, refetch } = useExchanges({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  })

  const updateStatusMutation = useUpdateExchangeStatus()

  function openDrawer(row: ExchangeRequest) {
    setSelected(row)
    setAdminNote(row.adminNote ?? '')
  }

  function handleUpdateStatus(status: ExchangeStatus) {
    if (!selected) return
    updateStatusMutation.mutate(
      { id: selected.id, status, adminNote: adminNote.trim() || undefined },
      { onSuccess: (updated) => setSelected(updated) }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exchange Requests"
        description="Damaged, defective, or wrong-item claims raised by customers on delivered orders."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search by order #, customer, email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ExchangeStatus | '')
              setPage(1)
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      <Table<ExchangeRequest>
        rowKey={(row) => row.id}
        data={data?.items ?? []}
        isLoading={isLoading}
        loadingRows={<SkeletonRows cols={6} />}
        isError={isError}
        errorContent={<ErrorState error={error} onRetry={() => refetch()} />}
        emptyContent={
          <EmptyState
            title="No exchange requests"
            description="Requests appear here when a customer reports a damaged or defective delivered item."
          />
        }
        columns={[
          {
            header: 'Order',
            key: 'order',
            className: 'min-w-[120px]',
            render: (row) => (
              <button
                type="button"
                onClick={() => openDrawer(row)}
                className="text-left font-medium hover:underline cursor-pointer"
              >
                {row.orderNumber}
              </button>
            ),
          },
          {
            header: 'Product',
            key: 'product',
            className: 'min-w-[200px]',
            render: (row) => (
              <div>
                <p className="font-medium">{row.productName}</p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  {row.colorName} · {row.sizeCode}
                </p>
              </div>
            ),
          },
          {
            header: 'Customer',
            key: 'customer',
            className: 'min-w-[180px]',
            render: (row) => (
              <div>
                <p className="font-medium">{row.customerName}</p>
                <p className="text-xs text-black/50 dark:text-white/50">{row.customerEmail}</p>
              </div>
            ),
          },
          {
            header: 'Reason',
            key: 'reason',
            className: 'min-w-[140px]',
            render: (row) => REASON_LABEL[row.reason] ?? row.reason,
          },
          {
            header: 'Status',
            key: 'status',
            className: 'min-w-[110px]',
            render: (row) => <StatusBadge status={row.status} showDot={false} />,
          },
          {
            header: 'Date',
            key: 'createdAt',
            className: 'min-w-[120px] text-right',
            render: (row) => formatDate(row.createdAt),
          },
        ]}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        widthClassName="sm:max-w-md lg:max-w-lg"
        title={
          selected ? (
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-black dark:text-white text-base">{selected.orderNumber}</span>
              <StatusBadge status={selected.status} showDot={false} />
            </div>
          ) : (
            'Exchange Request'
          )
        }
      >
        {selected && (
          <div className="flex flex-col divide-y divide-black/10 text-sm dark:divide-white/10">
            {/* Customer */}
            <div className="flex items-start justify-between py-4 first:pt-0">
              <span className="font-medium text-black/50 dark:text-white/50">Customer</span>
              <div className="text-right">
                <p className="font-bold text-black dark:text-white text-base">{selected.customerName}</p>
                <p className="text-black/60 dark:text-white/60 text-xs mt-0.5">{selected.customerEmail}</p>
                <p className="text-black/50 dark:text-white/50 text-xs">{selected.customerPhone}</p>
              </div>
            </div>

            {/* Item in question */}
            <div className="py-4 space-y-3">
              <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                Item Reported
              </span>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                  {selected.productImage ? (
                    <img src={selected.productImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <HugeiconsIcon icon={PackageIcon} size={18} className="text-black/30 dark:text-white/30" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{selected.productName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50 mt-0.5">
                    {selected.colorHex && <ColorSwatch hexCode={selected.colorHex} name={selected.colorName} />}
                    <span>{selected.colorName}</span>
                    <span>•</span>
                    <span>Size {selected.sizeCode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason + description */}
            <div className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                  Reason
                </span>
                <span className="font-semibold text-black dark:text-white">
                  {REASON_LABEL[selected.reason] ?? selected.reason}
                </span>
              </div>
              {selected.description && (
                <p className="text-black/80 dark:text-white/80">{selected.description}</p>
              )}
              {selected.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selected.images.map((url) => (
                    <img key={url} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <p className="text-xs text-black/40 dark:text-white/40">{formatDate(selected.createdAt)}</p>
            </div>

            {/* Shipping / order context */}
            <div className="py-4 space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                Shipping Address
              </span>
              <div className="flex items-start gap-2 text-black/70 dark:text-white/70">
                <HugeiconsIcon icon={Location01Icon} size={15} className="mt-0.5 shrink-0" />
                <p className="text-xs">{selected.shippingAddress}</p>
              </div>
            </div>

            {/* Admin action */}
            <div className="pt-4 space-y-3">
              <Textarea
                label="Admin Note (visible internally)"
                placeholder="e.g. Replacement approved, courier pickup scheduled…"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
              <div className="flex flex-wrap gap-2">
                {NEXT_STATUSES[selected.status].length === 0 ? (
                  <p className="text-xs text-black/40 dark:text-white/40">
                    This request is in a final state and can no longer be updated.
                  </p>
                ) : (
                  NEXT_STATUSES[selected.status].map((status) => (
                    <Button
                      key={status}
                      variant={status === 'REJECTED' ? 'danger' : 'primary'}
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleUpdateStatus(status)}
                    >
                      {status === 'APPROVED' && 'Approve Exchange'}
                      {status === 'REJECTED' && 'Reject Request'}
                      {status === 'COMPLETED' && 'Mark Completed'}
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
