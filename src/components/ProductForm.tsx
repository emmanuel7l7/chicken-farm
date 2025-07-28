import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product } from '../types/Product';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (product: Product | Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<{
    name: string;
    category: Product['category'];
    price: string;
    unit: string;
    description: string;
    image: string | ArrayBuffer | null;
    isActive: boolean;
  }>({
    name: '',
    category: 'layers',
    price: '',
    unit: '',
    description: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        unit: product.unit,
        description: product.description,
        image: product.image,
        isActive: product.isActive,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      category: formData.category as Product['category'],
    };

    if (product) {
      onSubmit({ ...productData, id: product.id } as Product);
    } else {
      onSubmit(productData as Omit<Product, 'id'>);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const getUnitPlaceholder = () => {
    switch (formData.category) {
      case 'layers':
      case 'broilers':
        return 'chicken';
      case 'chicks':
        return 'box';
      case 'eggs':
        return 'tray';
      case 'meat':
        return 'whole chicken';
      default:
        return 'unit';
    }
  };

  const getDefaultImage = () => {
    switch (formData.category) {
      case 'layers':
        return 'https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg';
      case 'broilers':
        return 'https://images.pexels.com/photos/1300355/pexels-photo-1300355.jpeg';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="layers">Layers</option>
              <option value="broilers">Broilers</option>
              <option value="chicks">Chicks</option>
              <option value="eggs">Eggs</option>
              <option value="meat">Chicken Meat</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (TZS)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={getUnitPlaceholder()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {formData.image && typeof formData.image === 'string' && (
              <img src={formData.image} alt="Preview" className="mt-2 h-20 object-contain rounded" />
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Product is active (visible to customers)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 transition-colors"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;