import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon } from '@hugeicons/core-free-icons'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Drawer } from '../components/Drawer'
import { StatusBadge } from '../components/Badge'
import { ColorSwatch } from '../components/ColorSwatch'
import { Pagination } from '../components/Pagination'
import { SkeletonRows } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { useOrders, useUpdateOrderStatus } from '../features/orders/hooks/useOrders'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import type { Order, OrderStatus } from '../types'

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, error, refetch } = useOrders({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  })

  const updateStatusMutation = useUpdateOrderStatus()

  function handleUpdateStatus(orderId: string, newStatus: OrderStatus) {
    updateStatusMutation.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: (updated) => {
          setSelectedOrder(updated)
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders & Fulfillments"
        description="View customer purchases, tracking details, and fulfillment statuses."
      />

      {/* Filter Toolbar */}
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

        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | '')
              setPage(1)
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Table<Order>
        rowKey={(row) => row.id}
        data={data?.items ?? []}
        isLoading={isLoading}
        loadingRows={<SkeletonRows cols={6} />}
        isError={isError}
        errorContent={<ErrorState error={error} onRetry={() => refetch()} />}
        emptyContent={<EmptyState title="No orders yet" description="Orders placed by customers will show up here." />}
        columns={[
          {
            header: 'Order #',
            key: 'orderNumber',
            className: 'min-w-[110px]',
            render: (row) => (
              <button
                type="button"
                onClick={() => setSelectedOrder(row)}
                className="text-left font-medium hover:underline cursor-pointer"
              >
                {row.orderNumber}
              </button>
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
            header: 'Status',
            key: 'status',
            className: 'min-w-[110px]',
            render: (row) => <StatusBadge status={row.status} showDot={false} />,
          },
          {
            header: 'Payment',
            key: 'paymentStatus',
            className: 'min-w-[100px]',
            render: (row) => row.paymentStatus,
          },
          {
            header: 'Total',
            key: 'totalAmount',
            className: 'min-w-[100px]',
            render: (row) => formatCurrency(row.totalAmount),
          },
          {
            header: 'Date',
            key: 'createdAt',
            className: 'min-w-[140px] text-right',
            render: (row) => formatDate(row.createdAt),
          },
        ]}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      {/* Order Details Drawer Sheet */}
      <Drawer
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        widthClassName="sm:max-w-md lg:max-w-lg"
        title={
          selectedOrder ? (
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-black dark:text-white text-base">{selectedOrder.orderNumber}</span>
              <StatusBadge status={selectedOrder.status} showDot={false} />
            </div>
          ) : (
            'Order Details'
          )
        }
      >
        {selectedOrder && (
          <div className="flex flex-col divide-y divide-black/10 text-sm dark:divide-white/10">
            {/* 1. Customer */}
            <div className="flex items-start justify-between py-4 first:pt-0">
              <span className="font-medium text-black/50 dark:text-white/50">Customer</span>
              <div className="text-right">
                <p className="font-bold text-black dark:text-white text-base">{selectedOrder.customerName}</p>
                <p className="text-black/60 dark:text-white/60 text-xs mt-0.5">{selectedOrder.customerEmail}</p>
                <p className="text-black/50 dark:text-white/50 text-xs">{selectedOrder.customerPhone}</p>
              </div>
            </div>

            {/* 2. Order Date */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50">Order Date</span>
              <span className="font-semibold text-black dark:text-white">{formatDate(selectedOrder.createdAt)}</span>
            </div>

            {/* 3. Payment Status */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50">Payment Status</span>
              <StatusBadge status={selectedOrder.paymentStatus} showDot={false} />
            </div>

            {/* 4. Fulfillment Status Bar */}
            <div className="py-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-black/50 dark:text-white/50">Fulfillment Status</span>
                <StatusBadge status={selectedOrder.status} showDot={true} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
                {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    disabled={updateStatusMutation.isPending}
                    className={`rounded-lg border py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                      selectedOrder.status === st
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-black/10 bg-transparent text-black/60 hover:text-black dark:border-white/10 dark:text-white/60 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Shipping Address */}
            <div className="flex items-start justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50 shrink-0">Shipping Address</span>
              <span className="font-medium text-black/90 dark:text-white/90 text-right max-w-xs leading-relaxed">
                {selectedOrder.shippingAddress}
              </span>
            </div>

            {/* 6. Purchased Items List */}
            <div className="py-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-black/50 dark:text-white/50">Purchased Items ({selectedOrder.itemsCount})</span>
                <span className="font-bold text-black dark:text-white text-sm">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>

              <div className="divide-y divide-black/5 dark:divide-white/5">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-gray-100 dark:border-white/10 dark:bg-gray-800">
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-black/20 dark:text-white/20">
                          <HugeiconsIcon icon={Image01Icon} size={20} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-black dark:text-white text-xs sm:text-sm">{item.productName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50 mt-0.5">
                        {item.colorHex && <ColorSwatch hexCode={item.colorHex} name={item.colorName} />}
                        <span>{item.colorName}</span>
                        <span>•</span>
                        <span>{item.sizeCode}</span>
                        <span className="font-bold text-black dark:text-white">(x{item.quantity})</span>
                      </div>
                    </div>

                    <span className="shrink-0 font-bold text-black dark:text-white text-xs sm:text-sm">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Total Summary */}
            <div className="flex items-center justify-between py-4 font-bold">
              <span className="text-black/70 dark:text-white/70 text-sm">Total Order Amount</span>
              <span className="text-lg text-black dark:text-white">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
