import { createClient } from '@supabase/supabase-js';

// For development, use mock values if environment variables are not set
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'layers' | 'broilers' | 'chicks' | 'eggs' | 'meat';
  price: number;
  unit: string;
  description: string;
  image_url?: string;
  is_active: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  payment_method?: 'stripe' | 'mpesa' | 'tigo_pesa' | 'airtel_money' | 'cash_on_delivery';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  delivery_address?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_details?: any;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  popular_products?: any;
  payment_methods?: any;
  created_at: string;
  updated_at: string;
}