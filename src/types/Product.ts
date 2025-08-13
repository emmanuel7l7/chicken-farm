export interface Product {
  id: string;
  name: string;
  category: 'layers' | 'broilers' | 'chicks' | 'eggs' | 'meat';
  price: number;
  unit: string;
  description: string;
  image: string;
  isActive: boolean;
}
