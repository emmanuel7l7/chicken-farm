import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types/Product';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface FarmPageProps {
  products: Product[];
  onShowAuth: () => void;
  onShowCart: () => void;
}

const FarmPage: React.FC<FarmPageProps> = ({ products, onShowAuth, onShowCart }) => {
  const [activeCategory, setActiveCategory] = useState('layers');
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const categories = [
    { id: 'layers', label: 'Layers' },
    { id: 'broilers', label: 'Broilers' },
    { id: 'chicks', label: 'Chicks' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'meat', label: 'Chicken Meat' },
  ];

  const filteredProducts = products.filter(
    product => product.category === activeCategory && product.isActive
  );

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      onShowAuth();
      return;
    }
    
    addToCart(product);
    
    // Show a simple alert for now - you can replace with a toast notification later
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Our Farm Products</h1>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 bg-gray-100 p-1 rounded-lg">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={() => handleAddToCart(product)}
              onViewCart={onShowCart}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No products available in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmPage;