import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { lazy, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollGuard from '@/components/ScrollGuard';

// Layout
import MainLayout from './components/layout/MainLayout';

// Public Pages
import Home from './pages/Home';
const Styles = lazy(() => import('./pages/Styles'));
const Book = lazy(() => import('./pages/Book'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const OrderConfirmed = lazy(() => import('./pages/OrderConfirmed'));
const PaymentProof = lazy(() => import('./pages/PaymentProof'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Auth Pages
const ClerkRoot = lazy(() => import('./components/ClerkRoot'));
const Login = lazy(() => import('./pages/Login'));
const ProtectedRoute = lazy(() => import('@/components/ProtectedRoute'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStyles = lazy(() => import('./pages/admin/AdminStyles'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminAvailability = lazy(() => import('./pages/admin/AdminAvailability'));
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'));

const Fallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
  </div>
);

const AuthenticatedApp = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public Routes with Main Layout (no Clerk loaded) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/styles" element={<Styles />} />
          <Route path="/book" element={<Book />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/cart" element={<Cart />} />
          <Route path="/shop/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/payment-proof" element={<PaymentProof />} />
          <Route path="/book/confirmed" element={<Book />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Route>

        {/* Clerk only loads for login + admin */}
        <Route element={<ClerkRoot />}>
          <Route path="/login/*" element={<Login />} />
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/styles" element={<AdminStyles />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/availability" element={<AdminAvailability />} />
              <Route path="/admin/team" element={<AdminTeam />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollGuard />
        <AuthenticatedApp />
      </Router>
      <Toaster />
      <SonnerToaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  )
}

export default App
