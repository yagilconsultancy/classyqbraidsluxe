import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layout
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Styles from './pages/Styles';
import Book from './pages/Book';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import OrderConfirmed from './pages/OrderConfirmed';
import PaymentProof from './pages/PaymentProof';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Auth Pages
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminStyles from './pages/admin/AdminStyles';
import AdminBookings from './pages/admin/AdminBookings';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAvailability from './pages/admin/AdminAvailability';
import AdminTeam from './pages/admin/AdminTeam';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login/*" element={<Login />} />

      {/* Public Routes with Main Layout */}
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

      {/* Admin Routes - Protected */}
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

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthenticatedApp />
      </Router>
      <Toaster />
      <SonnerToaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  )
}

export default App