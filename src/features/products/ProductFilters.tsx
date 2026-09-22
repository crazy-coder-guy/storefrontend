import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { useAllCategories } from '../categories/hooks/useAllCategories'
import type { ProductStatus } from '../../types'

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categoryId: string
  onCategoryChange: (value: string) => void
  status: ProductStatus | ''
  onStatusChange: (value: ProductStatus | '') => void
}

export function ProductFilters({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
}: ProductFiltersProps) {
  const { data: categoriesData } = useAllCategories()

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="w-full sm:w-72">
        <Input
          placeholder="Search by name, SKU, type, or price…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex-1 min-w-[140px] sm:w-48 sm:flex-none">
        <Select value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">All categories</option>
          {categoriesData?.items.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex-1 min-w-[140px] sm:w-40 sm:flex-none">
        <Select value={status} onChange={(e) => onStatusChange(e.target.value as ProductStatus | '')}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>
    </div>
  )
}
