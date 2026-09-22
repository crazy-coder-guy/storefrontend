import { Table } from '../../components/Table'
import { EmptyState } from '../../components/EmptyState'
import { formatDate } from '../../utils/formatDate'
import type { DashboardSummary } from '../../types'

type Activity = DashboardSummary['recentActivity'][number]

export function RecentActivityTable({ items }: { items: Activity[] }) {
  return (
    <Table<Activity>
      rowKey={(row) => row.id}
      data={items}
      columns={[
        { header: 'Product', key: 'product', render: (row) => row.variant.product.name },
        { header: 'SKU', key: 'sku', render: (row) => row.variant.sku },
        { header: 'Type', key: 'type', render: (row) => row.transactionType },
        {
          header: 'Change',
          key: 'change',
          render: (row) => `${row.previousStock} → ${row.newStock}`,
        },
        { header: 'Reason', key: 'reason', render: (row) => row.reason ?? '—' },
        { header: 'When', key: 'when', render: (row) => formatDate(row.createdAt) },
      ]}
      emptyContent={<EmptyState title="No recent activity" description="Stock adjustments will show up here." />}
    />
  )
}
