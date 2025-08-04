import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/Product';
import toast from 'react-hot-toast';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'chicken-farm-cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          console.log('Loaded cart from localStorage:', parsedCart);
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        console.log('Saving cart to localStorage:', cartItems);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoading]);

  const addToCart = (product: Product, quantity: number = 1) => {
    console.log('CartContext: Adding to cart:', product.name, 'quantity:', quantity);
    
    if (!product || !product.id) {
      console.error('Invalid product:', product);
      toast.error('Invalid product');
      return;
    }

    if (quantity <= 0) {
      console.error('Invalid quantity:', quantity);
      toast.error('Invalid quantity');
      return;
    }

    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + quantity
        };
        console.log('CartContext: Updated existing item, new cart:', updated);
        toast.success(`Updated ${product.name} quantity in cart`);
        return updated;
      } else {
        // Add new item
        const newCart = [...prev, { product, quantity }];
        console.log('CartContext: Added new item, new cart:', newCart);
        toast.success(`${product.name} added to cart`);
        return newCart;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    console.log('CartContext: Removing from cart:', productId);
    
    setCartItems(prev => {
      const item = prev.find(item => item.product.id === productId);
      const updated = prev.filter(item => item.product.id !== productId);
      
      if (item) {
        toast.success(`${item.product.name} removed from cart`);
      }
      
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    console.log('CartContext: Updating quantity:', productId, quantity);
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev => {
      const updated = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      
      const item = updated.find(item => item.product.id === productId);
      if (item) {
        toast.success(`${item.product.name} quantity updated`);
      }
      
      return updated;
    });
  };

  const clearCart = () => {
    console.log('CartContext: Clearing cart');
    setCartItems([]);
    toast.success('Cart cleared');
  };

  const getTotalItems = () => {
    const total = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log('CartContext: Total items:', total);
    return total;
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    console.log('CartContext: Total price:', total);
    return total;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};