import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Menu, User, ShoppingCart } from "lucide-react";
import FarmPage from "./components/FarmPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import Cart from "./components/Cart";
import CheckoutModal from "./components/CheckoutModal";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthModal from "./components/AuthModal";
import { useCart } from "./contexts/CartContext";
import { Product } from "./types/Product";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminLayout from "./components/admin/adminLayout";
import Dashboard from "./components/admin/Dashboard";
import OrdersPage from "./components/admin/OrdersPage";
import AnalyticsPage from "./components/admin/AnalyticsPage";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user, profile, isAuthenticated, logout, isLoading } = useAuth();
  const { getTotalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedProducts: Product[] = data?.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: parseFloat(product.price),
          unit: product.unit,
          description: product.description,
          image: product.image_url || getDefaultImage(product.category),
          isActive: product.is_active,
        })) || [];

        setProducts(transformedProducts);
      } else {
        // Fallback products if no database
        setProducts([
          {
            id: "1",
            name: "Premium Layer Hens",
            category: "layers",
            price: 25000,
            unit: "chicken",
            description: "High-quality layer hens that produce fresh eggs daily. Well-fed and healthy.",
            image: "https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg",
            isActive: true,
          },
          {
            id: "2",
            name: "Broiler Chickens",
            category: "broilers",
            price: 20000,
            unit: "chicken",
            description: "Fast-growing broiler chickens perfect for meat production.",
            image: "https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg",
            isActive: true,
          },
          {
            id: "3",
            name: "Fresh Farm Eggs",
            category: "eggs",
            price: 8500,
            unit: "tray",
            description: "Fresh eggs from free-range hens. 30 eggs per tray.",
            image: "https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg",
            isActive: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const getDefaultImage = (category: string) => {
    switch (category) {
      case 'layers':
      case 'broilers':
      case 'chicks':
        return 'https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg';
      case 'eggs':
        return 'https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg';
      case 'meat':
        return 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg';
      default:
        return 'https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg';
    }
  };

  // Show loading spinner while auth is initializing
  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AuthModal
          isOpen={true}
          onClose={() => {}} // Don't allow closing when not authenticated
          onAuthSuccess={() => {}}
        />
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />

          {/* Top Bar */}
          <div className="fixed top-0 right-0 z-30 p-4 flex items-center space-x-2 bg-white/90 backdrop-blur-sm border-b border-gray-200">
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-white text-primary-600 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-50 text-sm flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* User Info */}
            <div className="bg-white rounded-md shadow-md px-3 py-1.5 flex items-center space-x-2">
              <User className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-gray-700">
                {profile?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-xs text-red-600 hover:text-red-800 ml-2"
              >
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="p-2 bg-white rounded-md shadow-md md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6 text-primary-600" />
            </button>
          </div>

          {/* Sidebar */}
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            rightOnMobile={true}
          />

          {/* Main Content */}
          <div className="flex-1 md:ml-64 transition-all duration-300 pt-20 md:pt-0">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <FarmPage
                    products={products}
                    onShowCart={() => setCartOpen(true)}
                  />
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  profile?.role === "admin" ? (
                    <AdminLayout />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              >
                <Route
                  index
                  element={
                    <Dashboard 
                      products={products} 
                      setProducts={setProducts}
                      onProductsChange={loadProducts}
                    />
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <Dashboard 
                      products={products} 
                      setProducts={setProducts}
                      onProductsChange={loadProducts}
                    />
                  }
                />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

          {/* Cart */}
          <Cart
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              setCheckoutOpen(true);
            }}
          />

          {/* Checkout Modal */}
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
          />
        </div>
      </ErrorBoundary>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;