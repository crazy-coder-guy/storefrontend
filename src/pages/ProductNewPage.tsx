import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ProductForm, type ProductFormValues } from '../features/products/ProductForm'
import { useCreateProduct } from '../features/products/hooks/useProducts'

export function ProductNewPage() {
  const navigate = useNavigate()
  const createMutation = useCreateProduct()

  function handleSubmit(values: ProductFormValues) {
    createMutation.mutate(
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
      {
        onSuccess: (product) => navigate(`/products/${product.id}`),
      }
    )
  }

  return (
    <div>
      <PageHeader
        title="New Product"
        breadcrumbs={[{ label: 'Products', to: '/products' }, { label: 'New' }]}
      />
      <div className="max-w-xl">
        <ProductForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          onCancel={() => navigate('/products')}
        />
      </div>
    </div>
  )
}
