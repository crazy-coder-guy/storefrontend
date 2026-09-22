import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Table } from '../components/Table'
import { Input } from '../components/Input'
import { Drawer } from '../components/Drawer'
import { StatusBadge } from '../components/Badge'
import { Pagination } from '../components/Pagination'
import { SkeletonRows } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { useCustomers } from '../features/customers/hooks/useCustomers'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { DEFAULT_PAGE_SIZE } from '../utils/constants'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import type { Customer } from '../types'

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError, error, refetch } = useCustomers({
    search: debouncedSearch || undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="View customer profiles, purchase history, and lifetime spending."
      />

      <div className="w-full max-w-xs">
        <Input
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <Table<Customer>
        rowKey={(row) => row.id}
        data={data?.items ?? []}
        isLoading={isLoading}
        loadingRows={<SkeletonRows cols={6} />}
        isError={isError}
        errorContent={<ErrorState error={error} onRetry={() => refetch()} />}
        emptyContent={<EmptyState title="No customers yet" description="Customers appear here once they place an order." />}
        columns={[
          {
            header: 'Customer Name',
            key: 'name',
            className: 'min-w-[140px]',
            render: (row) => (
              <button
                type="button"
                onClick={() => setSelectedCustomer(row)}
                className="text-left font-medium hover:underline cursor-pointer"
              >
                {row.name}
              </button>
            ),
          },
          {
            header: 'Email',
            key: 'email',
            className: 'min-w-[180px]',
            render: (row) => row.email,
          },
          {
            header: 'Orders',
            key: 'ordersCount',
            className: 'min-w-[100px]',
            render: (row) => `${row.ordersCount} orders`,
          },
          {
            header: 'Total Spent',
            key: 'totalSpent',
            className: 'min-w-[110px]',
            render: (row) => formatCurrency(row.totalSpent),
          },
          {
            header: 'Status',
            key: 'status',
            className: 'min-w-[100px]',
            render: (row) => <StatusBadge status={row.status} showDot={false} />,
          },
          {
            header: 'Last Order',
            key: 'lastOrderAt',
            className: 'min-w-[140px] text-right',
            render: (row) => formatDate(row.lastOrderAt),
          },
        ]}
      />

      {data && <Pagination meta={data.meta} onPageChange={setPage} />}

      {/* Customer Profile Drawer Sheet */}
      <Drawer
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        widthClassName="sm:max-w-md lg:max-w-lg"
        title={selectedCustomer ? selectedCustomer.name : 'Customer Profile'}
      >
        {selectedCustomer && (
          <div className="flex flex-col divide-y divide-black/10 text-sm dark:divide-white/10">
            {/* 1. Customer Name & Status */}
            <div className="flex items-center justify-between py-4 first:pt-0">
              <span className="font-medium text-black/50 dark:text-white/50">Customer Name</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-black dark:text-white text-base">{selectedCustomer.name}</span>
                <StatusBadge status={selectedCustomer.status} showDot={false} />
              </div>
            </div>

            {/* 2. Email Address */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50">Email Address</span>
              <span className="font-semibold text-black dark:text-white">{selectedCustomer.email}</span>
            </div>

            {/* 3. Phone Number */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50">Phone Number</span>
              <span className="font-semibold text-black dark:text-white">{selectedCustomer.phone}</span>
            </div>

            {/* 4. Customer Since */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50">Customer Since</span>
              <span className="font-semibold text-black dark:text-white">{formatDate(selectedCustomer.createdAt)}</span>
            </div>

            {/* 5. Last Order */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50">Last Order Date</span>
              <span className="font-semibold text-black dark:text-white">{formatDate(selectedCustomer.lastOrderAt)}</span>
            </div>

            {/* 6. Total Orders */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-black/50 dark:text-white/50">Total Orders Placed</span>
              <span className="font-bold text-black dark:text-white text-base">{selectedCustomer.ordersCount} orders</span>
            </div>

            {/* 7. Lifetime Value */}
            <div className="flex items-center justify-between py-4 font-bold">
              <span className="text-black/70 dark:text-white/70 text-sm">Lifetime Spend Value</span>
              <span className="text-xl text-black dark:text-white">{formatCurrency(selectedCustomer.totalSpent)}</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
