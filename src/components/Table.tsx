import type { ReactNode } from 'react'

interface Column<T> {
  header: string
  key: string
  render: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  loadingRows?: ReactNode
  isError?: boolean
  errorContent?: ReactNode
  emptyContent?: ReactNode
}

export function Table<T>({
  columns,
  data,
  rowKey,
  isLoading,
  loadingRows,
  isError,
  errorContent,
  emptyContent,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 font-medium text-black/60 dark:text-white/60 ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {isLoading && loadingRows}
          {!isLoading && isError && (
            <tr>
              <td colSpan={columns.length}>{errorContent}</td>
            </tr>
          )}
          {!isLoading && !isError && data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>{emptyContent}</td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
