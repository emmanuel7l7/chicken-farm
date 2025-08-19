export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;     // ✅ Add this
  address?: string;   // ✅ Add this
  role?: "user" | "admin" | "farmer"; // ✅ Add this (customize roles as you like)
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

