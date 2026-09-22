import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { ProductsPage } from '../pages/ProductsPage'
import { ProductNewPage } from '../pages/ProductNewPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { ProductEditPage } from '../pages/ProductEditPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { SizesPage } from '../pages/SizesPage'
import { ColorsPage } from '../pages/ColorsPage'
import { InventoryPage } from '../pages/InventoryPage'
import { InventoryHistoryPage } from '../pages/InventoryHistoryPage'
import { SettingsPage } from '../pages/SettingsPage'
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
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'sizes', element: <SizesPage /> },
      { path: 'colors', element: <ColorsPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inventory/:variantId/history', element: <InventoryHistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
