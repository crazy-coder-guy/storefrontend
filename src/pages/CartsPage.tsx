import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { Input } from '../components/Input'
import { Drawer } from '../components/Drawer'
import { CartDetailSection } from '../components/CartDetailSection'
import type { CartReminderInput } from '../components/CartDetailSection'
import { Pagination } from '../components/Pagination'
import { SkeletonRows } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { useAbandonedCarts } from '../hooks/useCarts'
import { useCustomerCart } from '../features/customers/hooks/useCustomers'
import { useSendNotification } from '../features/notifications/hooks/useNotifications'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import type { AbandonedCartRow } from '../services/cart.service'

export function CartsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState<AbandonedCartRow | null>(null)

  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, error, refetch } = useAbandonedCarts({
    search: debouncedSearch || undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  })

  const { data: cart, isLoading: isCartLoading } = useCustomerCart(selectedRow?.userId)
  const sendNotificationMutation = useSendNotification()

  function handleSendCartReminder(input: CartReminderInput) {
    if (!selectedRow) return
    sendNotificationMutation.mutate({
      userId: selectedRow.userId,
      title: input.title,
      body: input.body,
      url: '/cart',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Carts"
        description="Everyone currently sitting on items in their cart, sorted by most recent activity — nudge them with a reminder before they go cold."
      />

      <div className="w-full max-w-xs">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <Table<AbandonedCartRow>
        rowKey={(row) => row.userId}
        data={data?.items ?? []}
        isLoading={isLoading}
        loadingRows={<SkeletonRows cols={5} />}
        isError={isError}
        errorContent={<ErrorState error={error} onRetry={() => refetch()} />}
        emptyContent={
          <EmptyState
            title="No active carts"
            description="Once a shopper adds an item to their cart, they'll show up here."
          />
        }
        columns={[
          {
            header: 'Customer',
            key: 'customer',
            className: 'min-w-[180px]',
            render: (row) => (
              <button
                type="button"
                onClick={() => setSelectedRow(row)}
                className="text-left cursor-pointer"
              >
                <p className="font-medium hover:underline">{row.customerName}</p>
                <p className="text-xs text-black/50 dark:text-white/50">{row.customerEmail}</p>
              </button>
            ),
          },
          {
            header: 'Items',
            key: 'itemsCount',
            className: 'min-w-[90px]',
            render: (row) => `${row.itemsCount} item${row.itemsCount === 1 ? '' : 's'}`,
          },
          {
            header: 'Cart Total',
            key: 'cartTotal',
            className: 'min-w-[110px]',
            render: (row) => formatCurrency(row.cartTotal),
          },
          {
            header: 'Last Activity',
            key: 'lastActivityAt',
            className: 'min-w-[140px] text-right',
            render: (row) => formatDate(row.lastActivityAt),
          },
        ]}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      <Drawer
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        widthClassName="sm:max-w-md lg:max-w-lg"
        title={selectedRow ? selectedRow.customerName : 'Cart Detail'}
      >
        {selectedRow && (
          <div className="flex flex-col divide-y divide-black/10 text-sm dark:divide-white/10">
            <div className="flex items-center justify-between py-4 first:pt-0">
              <span className="font-medium text-black/50 dark:text-white/50">Email</span>
              <span className="font-semibold text-black dark:text-white">{selectedRow.customerEmail}</span>
            </div>

            <CartDetailSection
              cart={cart}
              isLoading={isCartLoading}
              customerName={selectedRow.customerName}
              onSendReminder={handleSendCartReminder}
              isSending={sendNotificationMutation.isPending}
            />
          </div>
        )}
      </Drawer>
    </div>
  )
}
