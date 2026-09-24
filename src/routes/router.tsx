import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { ProductsPage } from '../pages/ProductsPage'
import { ProductNewPage } from '../pages/ProductNewPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { ProductEditPage } from '../pages/ProductEditPage'
import { ProductAttributesPage } from '../pages/ProductAttributesPage'
import { InventoryPage } from '../pages/InventoryPage'
import { InventoryHistoryPage } from '../pages/InventoryHistoryPage'
import { OrdersPage } from '../pages/OrdersPage'
import { CustomersPage } from '../pages/CustomersPage'
import { StorefrontContentPage } from '../pages/StorefrontContentPage'
import { SearchAnalyticsPage } from '../pages/SearchAnalyticsPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/new', element: <ProductNewPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'products/:id/edit', element: <ProductEditPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'attributes', element: <ProductAttributesPage /> },
      { path: 'categories', element: <Navigate to="/attributes" replace /> },
      { path: 'sizes', element: <Navigate to="/attributes" replace /> },
      { path: 'colors', element: <Navigate to="/attributes" replace /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inventory/:variantId/history', element: <InventoryHistoryPage /> },
      { path: 'storefront-content', element: <StorefrontContentPage /> },
      { path: 'search-analytics', element: <SearchAnalyticsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
