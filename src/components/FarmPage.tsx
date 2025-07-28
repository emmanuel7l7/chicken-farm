import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types/Product';

interface FarmPageProps {
  products: Product[];
}

const FarmPage: React.FC<FarmPageProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState('layers');

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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Farm Products</h1>
      
      {/* Category Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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