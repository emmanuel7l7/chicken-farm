import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as CustomUser } from '../types/User';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: CustomUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode] = useState(!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (isMockMode) {
        console.log('Running in mock mode - Supabase not configured');
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await handleAuthenticatedUser(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await handleAuthenticatedUser(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, [isMockMode]);

  const handleAuthenticatedUser = async (user: any) => {
    const customUser: CustomUser = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 'User',
      role: 'customer',
      createdAt: user.created_at,
    };
    setUser(customUser);
    await fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        const mockProfile: Profile = {
          id: userId,
          email: user?.email || 'user@example.com',
          name: user?.name || 'Mock User',
          role: user?.email === 'admin@farm.com' ? 'admin' : 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(mockProfile);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        const mockUser: CustomUser = {
          id: `mock-${Math.random().toString(36).substr(2, 9)}`,
          email,
          name: email.split('@')[0] || 'User',
          role: email === 'admin@farm.com' ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
        };

        const mockProfile: Profile = {
          ...mockUser,
          created_at: mockUser.createdAt,
          updated_at: mockUser.createdAt,
        };

        setUser(mockUser);
        setProfile(mockProfile);
        return { success: true };
      }

      // Real authentication
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser: CustomUser = {
          id: `mock-${Math.random().toString(36).substr(2, 9)}`,
          email,
          name,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };

        const mockProfile: Profile = {
          ...mockUser,
          created_at: mockUser.createdAt,
          updated_at: mockUser.createdAt,
        };

        setUser(mockUser);
        setProfile(mockProfile);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          email,
          name,
          role: 'customer'
        }]);
      }

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!isMockMode) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        isMockMode,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};