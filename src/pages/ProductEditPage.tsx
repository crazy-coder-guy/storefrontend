import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Skeleton } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { ProductForm, type ProductFormValues } from '../features/products/ProductForm'
import { useProduct, useUpdateProduct } from '../features/products/hooks/useProducts'

export function ProductEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading, isError, error, refetch } = useProduct(id)
  const updateMutation = useUpdateProduct(id)

  function handleSubmit(values: ProductFormValues) {
    updateMutation.mutate(
      {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
        categoryId: values.categoryId,
        productType: values.productType,
        basePrice: values.basePrice,
        mrp: values.mrp,
        status: values.status,
      },
      { onSuccess: () => navigate(`/products/${id}`) }
    )
  }

  return (
    <div>
      <PageHeader
        title="Edit Product"
        breadcrumbs={[
          { label: 'Products', to: '/products' },
          { label: product?.name ?? '…', to: `/products/${id}` },
          { label: 'Edit' },
        ]}
      />

      {isLoading && <Skeleton className="h-96 w-full max-w-xl rounded-xl" />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {product && (
        <div className="max-w-xl">
          <ProductForm
            initialValues={product}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
            onCancel={() => navigate(`/products/${id}`)}
          />
        </div>
      )}
    </div>
  )
}
