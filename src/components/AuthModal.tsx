import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Update mode when initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        {mode === 'login' ? (
          <LoginPage
            onSwitchToRegister={() => setMode('register')}
            onClose={onClose}
          />
        ) : (
          <RegisterPage
            onSwitchToLogin={() => setMode('login')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;