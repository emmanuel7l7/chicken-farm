import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = profile?.role === 'admin';

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured) {
      toast.error('Database not configured. Please set up Supabase.');
      setIsLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          await handleAuthenticatedUser(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleAuthenticatedUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, []);

  const handleAuthenticatedUser = async (authUser: any) => {
    try {
      const customUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        role: 'customer', // Default role
        createdAt: authUser.created_at,
      };
      
      setUser(customUser);
      await fetchProfile(authUser.id);
    } catch (error) {
      console.error('Error handling authenticated user:', error);
      toast.error('Failed to load user data');
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Profile doesn't exist, create one using auth user data
          const authUser = await supabase!.auth.getUser();
          const userEmail = authUser.data.user?.email || '';
          const userName = authUser.data.user?.user_metadata?.name || userEmail.split('@')[0] || 'User';
          const userPhone = authUser.data.user?.user_metadata?.phone;
          
          // Check if this email should be admin
          const isAdminEmail = userEmail === 'admin@farm.com' || userEmail === 'emmanuelmbuli7@gmail.com';
          
          const newProfile = {
            id: userId,
            email: userEmail,
            name: userName,
            role: isAdminEmail ? 'admin' as const : 'customer' as const,
            phone: userPhone,
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
          throw fetchError;
        }
      } else if (existingProfile) {
        // Update existing profile to admin if it's the admin email
        if ((existingProfile.email === 'emmanuelmbuli7@gmail.com' || existingProfile.email === 'admin@farm.com') && existingProfile.role !== 'admin') {
          const { data: updatedProfile, error: updateError } = await supabase!
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating profile to admin:', updateError);
            setProfile(existingProfile);
          } else {
            setProfile(updatedProfile);
          }
        } else {
          setProfile(existingProfile);
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
    }
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database not configured' };
    }

    setIsLoading(true);
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase!.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Logged in successfully!');
        return { success: true };
      }
      
      throw new Error('Login failed');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database not configured' };
    }

    // Validate required fields
    if (!email || !password || !name) {
      return { success: false, error: 'All fields are required' };
    }

    if (!phone || phone.trim() === '') {
      return { success: false, error: 'Phone number is required' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' };
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { 
        success: false, 
        error: 'Password must contain uppercase, lowercase, and numbers' 
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase!.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim(), phone: phone.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          // User already exists but not confirmed
          toast.error('An account with this email already exists. Please try logging in.');
          return { success: false, error: 'User already exists' };
        }
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        return { success: true };
      }
      
      throw new Error('Registration failed');
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
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
      const { error } = await supabase!.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !isSupabaseConfigured) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
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
      const errorMessage = error.message || 'Failed to update profile';
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
        isAdmin,
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