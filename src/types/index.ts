export type EntityStatus = 'ACTIVE' | 'INACTIVE'
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export interface ApiError {
  message: string
  code: string
  status: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
  productCount?: number
}

export interface CategoryInput {
  name: string
  slug?: string
  description?: string
  status?: EntityStatus
}

export interface Size {
  id: string
  name: string
  code: string
  sortOrder: number
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface SizeInput {
  name: string
  code: string
  sortOrder?: number
  status?: EntityStatus
}

export interface Color {
  id: string
  name: string
  code: string
  hexCode: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface ColorInput {
  name: string
  code: string
  hexCode: string
  status?: EntityStatus
}

export type ProductFit = 'REGULAR' | 'SLIM' | 'OVERSIZED' | 'RELAXED'
export type NeckType = 'CREW' | 'V_NECK' | 'POLO' | 'ROUND' | 'MOCK'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
  productType: string
  basePrice: number
  mrp: number
  status: ProductStatus
  gsm: number | null
  fabric: string | null
  fit: ProductFit | null
  neckType: NeckType | null
  biowash: boolean
  createdAt: string
  updatedAt: string
  images?: ProductImage[]
  sizes?: Size[]
  category?: Category
}

export interface ProductInput {
  name: string
  slug?: string
  description?: string
  categoryId: string
  productType: string
  basePrice: number
  mrp: number
  status?: ProductStatus
  gsm?: number | null
  fabric?: string | null
  fit?: ProductFit | null
  neckType?: NeckType | null
  biowash?: boolean
}

export type ImageType = 'PRODUCT' | 'MODEL' | 'LIFESTYLE'

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  imageType: ImageType
  sortOrder: number
  isPrimary: boolean
  createdAt: string
}

export interface ProductImageInput {
  imageUrl: string
  imageType?: ImageType
  sortOrder?: number
  isPrimary?: boolean
}

export interface ProductVariant {
  id: string
  productId: string
  colorId: string
  sizeId: string
  sku: string
  price: number | null
  stockQuantity: number
  status: EntityStatus
  createdAt: string
  updatedAt: string
  color?: Color
  size?: Size
}

export interface ProductVariantInput {
  colorId: string
  sizeId: string
  sku?: string
  price?: number | null
  stockQuantity?: number
  status?: EntityStatus
}

export interface ProductDetail extends Product {
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
}

export type InventoryTransactionType = 'RESTOCK' | 'MANUAL_INCREASE' | 'MANUAL_DECREASE' | 'ADJUSTMENT'

export interface InventoryTransaction {
  id: string
  variantId: string
  transactionType: InventoryTransactionType
  quantity: number
  previousStock: number
  newStock: number
  reason: string | null
  createdAt: string
}

export interface InventoryItem extends ProductVariant {
  product: Product
  size: Size
  color: Color
}

export interface StockAdjustInput {
  type: InventoryTransactionType
  quantity: number
  reason?: string
}

export interface DashboardSummary {
  products: { total: number; active: number; inactive: number; draft: number }
  inventory: { totalStock: number; lowStock: number; outOfStock: number }
  catalog: { categories: number; sizes: number; colors: number }
  lowStockProducts: InventoryItem[]
  recentActivity: (InventoryTransaction & { variant: InventoryItem })[]
}

export interface AdminSettings {
  lowStockThreshold: number
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PAID' | 'UNPAID' | 'REFUNDED'

export interface OrderItem {
  id: string
  productImageUrl: string | null
  productName: string
  colorName: string
  colorHex: string
  sizeName: string
  sizeCode: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  itemsCount: number
  items: OrderItem[]
  shippingAddress: string
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  ordersCount: number
  totalSpent: number
  status: EntityStatus
  lastOrderAt: string
  createdAt: string
}

