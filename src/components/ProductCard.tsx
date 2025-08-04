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

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ProductCard: Add to cart clicked for', product.name);
    console.log('ProductCard: onAddToCart function exists:', !!onAddToCart);
    console.log('ProductCard: isAuthenticated:', isAuthenticated);
    
    if (onAddToCart) {
      onAddToCart();
    } else {
      console.log('ProductCard: No onAddToCart function provided');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg';
          }}
        />
        {!product.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-1">
          {product.description}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mb-2 sm:mb-3">
          <span className="text-lg sm:text-2xl font-bold text-primary-600">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            per {product.unit}
          </span>
        </div>
        
        <button 
          onClick={handleAddToCartClick}
          disabled={!product.isActive}
          className={`w-full py-2 px-3 sm:px-4 rounded-md transition-colors text-xs sm:text-base flex items-center justify-center ${
            product.isActive
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {!product.isActive 
            ? 'Out of Stock'
            : isAuthenticated 
              ? 'Add to Cart' 
              : 'Login to Buy'
          }
        </button>
      </div>
    </div>
  );
};

export default ProductCard;