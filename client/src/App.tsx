import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/rbac/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import InvestorsPage from './pages/InvestorsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/investors" element={<InvestorsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole={['ADMIN']} />}>
            <Route path="/admin/products" element={<DashboardPage />} />
            <Route path="/admin/categories" element={<DashboardPage />} />
            <Route path="/admin/orders" element={<DashboardPage />} />
            <Route path="/admin/applications" element={<DashboardPage />} />
            <Route path="/admin/inquiries" element={<DashboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <ToastContainer />
  </ToastProvider>
</AuthProvider>
  );
}
