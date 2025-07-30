import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar";
import { Menu, User, LogIn, ShoppingCart } from "lucide-react";
import FarmPage from "./components/FarmPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import AnalyticsPage from "./components/AnalyticsPage";
import Cart from "./components/Cart";
import CheckoutModal from "./components/CheckoutModal";
import ErrorBoundary from "./components/ErrorBoundary";
//import Dashboard from "./components/Dashboard";
import AuthModal from "./components/AuthModal";
import { useCart } from "./hooks/useCart";
import { Product } from "./types/Product";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('farm');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Premium Layer Hens',
      category: 'layers',
      price: 25.00,
      unit: 'chicken',
      description: 'High-quality layer hens that produce fresh eggs daily. Well-fed and healthy.',
      image: 'https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg',
      isActive: true,
    },
    {
      id: '2',
      name: 'Fresh Farm Eggs',
      category: 'eggs',
      price: 8.50,
      unit: 'tray',
      description: 'Farm-fresh eggs from free-range hens. Rich in nutrients and perfect for cooking.',
      image: 'https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg',
      isActive: true,
    },
    {
      id: '3',
      name: 'Broiler Chickens',
      category: 'broilers',
      price: 18.00,
      unit: 'chicken',
      description: 'Healthy broiler chickens raised for meat production. Fed with quality feed.',
      image: 'https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg',
      isActive: true,
    },
  ]);

  const handleShowAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleDashboardAccess = () => {
    if (!isAuthenticated) {
      handleShowAuth('login');
      return;
    }
    
    if (user?.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      return;
    }
    
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'farm':
        return <FarmPage products={products} onShowAuth={() => handleShowAuth('login')} onShowCart={() => setCartOpen(true)} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'analytics':
        if (!isAuthenticated || user?.role !== 'admin') {
          return (
            <div className="p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-4">You need admin privileges to access analytics.</p>
              <button
                onClick={() => handleShowAuth('login')}
                className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
              >
                Login as Admin
              </button>
            </div>
          );
        }
        return <AnalyticsPage />;
      case 'dashboard':
        if (!isAuthenticated || user?.role !== 'admin') {
          return (
            <div className="p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-4">You need admin privileges to access the dashboard.</p>
              <button
                onClick={() => handleShowAuth('login')}
                className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
              >
                Login as Admin
              </button>
            </div>
          );
        }
        // Uncomment the next line if you want to enable the Dashboard:
        // return <Dashboard products={products} setProducts={setProducts} />;
        return null;
      default:
        return <FarmPage products={products} onShowAuth={() => handleShowAuth('login')} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
      {/* Top Bar */}
      <div className="fixed top-0 right-0 z-30 p-4 flex items-center space-x-2">
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
        
        {/* Auth Buttons */}
        {!isAuthenticated ? (
          <div className="flex space-x-2">
            <button
              onClick={() => handleShowAuth('login')}
              className="bg-white text-primary-600 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-50 text-sm flex items-center"
            >
              <LogIn className="w-4 h-4 mr-1" />
              Login
            </button>
            <button
              onClick={() => handleShowAuth('register')}
              className="bg-primary-500 text-white px-3 py-1.5 rounded-md shadow-md hover:bg-primary-600 text-sm"
            >
              Register
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-md shadow-md px-3 py-1.5 flex items-center space-x-2">
            <User className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-gray-700">{user?.user_metadata?.name || user?.email}</span>
          </div>
        )}
        
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
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'dashboard') {
            handleDashboardAccess();
          } else {
            setActiveTab(tab);
          }
          setSidebarOpen(false); // close sidebar on tab select (mobile)
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        rightOnMobile={true}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300 pt-16 md:pt-0">
        {renderContent()}
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
      
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
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;