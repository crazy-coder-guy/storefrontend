import { Navigate, useParams } from 'react-router-dom'

export function ProductDetailPage() {
  const { id } = useParams()
  if (!id) return <Navigate to="/products" replace />
  return <Navigate to={`/products?selectedProduct=${id}`} replace />
}
