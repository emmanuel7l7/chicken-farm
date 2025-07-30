import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types/Product';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/validation';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  onViewCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewCart }) => {
  const { isAuthenticated } = useAuth();

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 sm:h-48 object-cover object-center"
      />
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">{product.name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
          <span className="text-lg sm:text-2xl font-bold text-primary-600">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            per {product.unit}
          </span>
        </div>
        <button 
          onClick={handleAddToCartClick}
          className="w-full mt-2 sm:mt-3 bg-primary-500 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-primary-600 transition-colors text-xs sm:text-base flex items-center justify-center"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isAuthenticated ? 'Add to Cart' : 'Login to Buy'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;