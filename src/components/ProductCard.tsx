import React from 'react';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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
            TZS {product.price}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            per {product.unit}
          </span>
        </div>
        <button className="w-full mt-2 sm:mt-3 bg-primary-500 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-primary-600 transition-colors text-xs sm:text-base">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;