import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, handleSupabaseError } from '../lib/supabase';
import { User as CustomUser } from '../types/User';
import toast from 'react-hot-toast';

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
  register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
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
  const [isMockMode] = useState(!isSupabaseConfigured);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (isMockMode) {
        console.log('Running in mock mode - Supabase not configured');
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          await handleAuthenticatedUser(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
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

  const handleAuthenticatedUser = async (authUser: any) => {
    try {
      // Check if email is confirmed
      if (!isMockMode && !authUser.email_confirmed_at) {
        toast.error('Please confirm your email before logging in');
        await supabase!.auth.signOut();
        return;
      }

      const customUser: CustomUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role: 'customer',
        createdAt: authUser.created_at,
      };
      
      setUser(customUser);
      await fetchProfile(authUser.id);
    } catch (error) {
      console.error('Error handling authenticated user:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      if (isMockMode) {
        const mockProfile: Profile = {
          id: userId,
          email: user?.email || 'user@example.com',
          name: user?.name || 'Mock User',
          role: user?.email === 'admin@farm.com' || user?.email === 'emmanuelmbuli7@gmail.com' ? 'admin' : 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(mockProfile);
        return;
      }

      const { data, error } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          // Check if this email should be admin
          const isAdminEmail = user?.email === 'admin@farm.com' || user?.email === 'emmanuelmbuli7@gmail.com';
          
          const newProfile = {
            id: userId,
            email: user?.email || '',
            name: user?.name || 'User',
            role: isAdminEmail ? 'admin' as const : 'customer' as const,
          };

          const { data: createdProfile, error: createError } = await supabase!
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setProfile(createdProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        const mockUser: CustomUser = {
          id: `mock-${Math.random().toString(36).substr(2, 9)}`,
          email,
          name: email.split('@')[0] || 'User',
          role: email === 'admin@farm.com' || email === 'emmanuelmbuli7@gmail.com' ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
        };

        const mockProfile: Profile = {
          ...mockUser,
          created_at: mockUser.createdAt,
          updated_at: mockUser.createdAt,
        };

        setUser(mockUser);
        setProfile(mockProfile);
        toast.success('Logged in successfully!');
        return { success: true };
      }

      // Real authentication
      const { data, error } = await supabase!.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          toast.error('Please confirm your email before logging in. Check your inbox for the confirmation link.');
          await supabase!.auth.signOut();
          return { success: false, error: 'Email not confirmed' };
        }
        
        toast.success('Logged in successfully!');
        return { success: true };
      }
      
      throw new Error('Login failed');
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: CustomUser = {
          id: `mock-${Math.random().toString(36).substr(2, 9)}`,
          email,
          name,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };

        const mockProfile: Profile = {
          ...mockUser,
          phone,
          created_at: mockUser.createdAt,
          updated_at: mockUser.createdAt,
        };

        setUser(mockUser);
        setProfile(mockProfile);
        toast.success('Account created successfully!');
        return { success: true };
      }

      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: { 
          data: { name, phone },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          // User already exists but not confirmed
          toast.error('An account with this email already exists. Please check your email for confirmation link or try logging in.');
          return { success: false, error: 'User already exists' };
        }
        
        // Don't set user state yet - wait for email confirmation
        toast.success('Account created! Please check your email and click the confirmation link before logging in.');
        return { success: true };
      }
      
      throw new Error('Registration failed');
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!isMockMode) {
        const { error } = await supabase!.auth.signOut();
        if (error) throw error;
      }
      
      setUser(null);
      setProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      if (isMockMode) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        toast.success('Profile updated successfully!');
        return { success: true };
      }

      const { data, error } = await supabase!
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};