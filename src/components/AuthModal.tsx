import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onAuthSuccess 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  React.useEffect(() => {
    setAuthError(null);
    setMode(initialMode);
  }, [isOpen, initialMode]);

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const result = await login(email, password);
      if (result.success) {
        onClose();
        onAuthSuccess?.();
      } else {
        setAuthError(result.error || 'Login failed');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleRegister = async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const result = await register(email, password, name, phone);
      if (result.success) {
        setAuthError('Please check your email to verify your account');
        setMode('login');
      } else {
        setAuthError(result.error || 'Registration failed');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 z-10 transition-transform hover:scale-110"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        {authError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-t-lg text-sm">
            {authError}
          </div>
        )}

        {mode === 'login' ? (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToRegister={() => {
              setAuthError(null);
              setMode('register');
            }}
            onClose={onClose}
            isMockMode={!isSupabaseConfigured}
          />
        ) : (
          <RegisterPage
            onRegister={handleRegister}
            onSwitchToLogin={() => {
              setAuthError(null);
              setMode('login');
            }}
            onClose={onClose}
            isMockMode={!isSupabaseConfigured}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;