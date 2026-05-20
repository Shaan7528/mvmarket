import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { isFirebaseConfigured, auth } from './firebase/config'
import { ConfigError } from './components/ConfigError'
import { AuthProvider } from './context/AuthContext'
import { MainLayout } from './layouts/MainLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { SellerDashboardLayout, AdminDashboardLayout } from './layouts/DashboardLayout'

import { LandingPage } from './pages/LandingPage'
import { HomePage } from './pages/HomePage'
import { ExplorePage } from './pages/ExplorePage'
import { StoresPage } from './pages/StoresPage'
import { ProductPage } from './pages/ProductPage'
import { StorePage } from './pages/StorePage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrdersPage } from './pages/OrdersPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

import { StoreSetupPage } from './pages/seller/StoreSetupPage'
import { SellerOverview } from './pages/seller/SellerOverview'
import { SellerProducts } from './pages/seller/SellerProducts'
import { SellerOrders } from './pages/seller/SellerOrders'
import { SellerAnalytics } from './pages/seller/SellerAnalytics'
import { SellerSettings } from './pages/seller/SellerSettings'

import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminStores } from './pages/admin/AdminStores'
import { AdminProducts } from './pages/admin/AdminProducts'
import { AdminCategories } from './pages/admin/AdminCategories'
import { AdminUsers } from './pages/admin/AdminUsers'

export default function App() {
  if (!isFirebaseConfigured || !auth) {
    return <ConfigError />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/store/:username" element={<StorePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="/profile/setup" element={<ProfileSetupPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/seller/setup" element={<StoreSetupPage />} />

          <Route element={<SellerDashboardLayout />}>
            <Route path="/seller" element={<SellerOverview />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/analytics" element={<SellerAnalytics />} />
            <Route path="/seller/settings" element={<SellerSettings />} />
          </Route>

          <Route element={<AdminDashboardLayout />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/stores" element={<AdminStores />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />
    </AuthProvider>
  )
}
