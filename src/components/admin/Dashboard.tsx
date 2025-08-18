import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Product } from '../../types/Product';
import ProductForm from './ProductForm';
import AdminNav from './AdminNav';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

interface DashboardProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  onProductsChange?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, setProducts, onProductsChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: productData.name,
            category: productData.category,
            price: productData.price,
            unit: productData.unit,
            description: productData.description,
            image_url: productData.image,
            is_active: productData.isActive,
          }])
          .select()
          .single();

        if (error) throw error;

        const newProduct: Product = {
          id: data.id,
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
          unit: data.unit,
          description: data.description,
          image: data.image_url || getDefaultImage(data.category),
          isActive: data.is_active,
        };

        setProducts([...products, newProduct]);
        toast.success('Product added successfully!');
      } else {
        // Fallback for no database
        const newProduct: Product = {
          ...productData,
          id: Date.now().toString(),
        };
        setProducts([...products, newProduct]);
        toast.success('Product added successfully!');
      }
      
      setShowForm(false);
      onProductsChange?.();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (product: Product) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('products')
          .update({
            name: product.name,
            category: product.category,
            price: product.price,
            unit: product.unit,
            description: product.description,
            image_url: product.image,
            is_active: product.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id)
          .select()
          .single();

        if (error) throw error;

        const updatedProduct: Product = {
          id: data.id,
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
          unit: data.unit,
          description: data.description,
          image: data.image_url || getDefaultImage(data.category),
          isActive: data.is_active,
        };

        setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
        toast.success('Product updated successfully!');
      } else {
        // Fallback for no database
        setProducts(products.map(p => p.id === product.id ? product : p));
        toast.success('Product updated successfully!');
      }
      
      setEditingProduct(null);
      setShowForm(false);
      onProductsChange?.();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Product deleted successfully!');
      } else {
        toast.success('Product deleted successfully!');
      }
      
      setProducts(products.filter(p => p.id !== id));
      onProductsChange?.();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('products')
          .update({ 
            is_active: !product.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'} successfully!`);
      } else {
        toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'} successfully!`);
      }
      
      setProducts(products.map(p =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ));
      onProductsChange?.();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    } finally {
      setLoading(false);
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

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 p-4 border-r">
        <AdminNav />
      </div>
      
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Product Management</h1>
          <button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center shadow transition disabled:opacity-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="mb-6">
            <ProductForm
              product={editingProduct}
              onSubmit={(product) => {
                if ('id' in product) {
                  handleEditProduct(product as Product);
                } else {
                  handleAddProduct(product as Omit<Product, 'id'>);
                }
              }}
              onCancel={cancelForm}
              isLoading={loading}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <LoadingSpinner size="md" />
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-md overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                    No products added yet. Click "Add Product" to get started.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getDefaultImage(product.category);
                          }}
                        />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.description.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-block px-2 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      TZS {product.price.toLocaleString()} / {product.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        disabled={loading}
                        className={`rounded-full p-1 transition disabled:opacity-50 ${
                          product.isActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {product.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => startEdit(product)}
                        disabled={loading}
                        className="text-blue-600 hover:bg-blue-50 rounded-full p-1 transition disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={loading}
                        className="text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full p-1 transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;