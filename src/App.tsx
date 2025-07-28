import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Menu } from "lucide-react";
import FarmPage from "./components/FarmPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import Dashboard from "./components/Dashboard";
import { Product } from "./types/Product";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('farm');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'farm':
        return <FarmPage products={products} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'dashboard':
        return <Dashboard products={products} setProducts={setProducts} />;
      default:
        return <FarmPage products={products} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-md shadow-md md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6 text-primary-600" />
      </button>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); // close sidebar on tab select (mobile)
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;