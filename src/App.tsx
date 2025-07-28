import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import FarmPage from "./components/FarmPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import Dashboard from "./components/Dashboard";
import { Product } from "./types/Product";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('farm');
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ml-64">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;