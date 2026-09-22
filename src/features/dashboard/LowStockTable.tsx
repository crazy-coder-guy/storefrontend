import { Link } from 'react-router-dom'
import { Table } from '../../components/Table'
import { EmptyState } from '../../components/EmptyState'
import type { InventoryItem } from '../../types'

export function LowStockTable({ items }: { items: InventoryItem[] }) {
  return (
    <Table<InventoryItem>
      rowKey={(row) => row.id}
      data={items}
      columns={[
        {
          header: 'Product',
          key: 'product',
          render: (row) => (
            <Link to={`/products/${row.productId}`} className="hover:underline">
              {row.product.name}
            </Link>
          ),
        },
        { header: 'SKU', key: 'sku', render: (row) => row.sku },
        { header: 'Color', key: 'color', render: (row) => row.color?.name ?? '—' },
        { header: 'Size', key: 'size', render: (row) => row.size?.name ?? '—' },
        { header: 'Stock', key: 'stock', render: (row) => row.stockQuantity },
      ]}
      emptyContent={<EmptyState title="No low-stock variants" description="Everything is well stocked." />}
    />
  )
}
