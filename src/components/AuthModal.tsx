import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import { isSupabaseConfigured } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onAuthSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { login } = useAuth(); // ✅ only login needed here
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthError(null);
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const handleAuthAction = async (
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string
  ) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const result = await action();
      if (result.success) {
        toast.success(successMessage);
      } else {
        setAuthError(result.error || "Action failed. Please try again.");
      }
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await handleAuthAction(
      () => login(email, password),
      "Logged in successfully!"
    );
    if (result.success) {
      onClose();
      onAuthSuccess?.();
    }
    return result;
  };

  if (!isOpen) return null;

  if (!isSupabaseConfigured) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Demo Mode
          </h2>
          <p className="text-gray-600 mb-6">
            Running in demo mode. Use any email/password to continue.
          </p>
          <p className="text-sm text-blue-600 mb-4">
            Try: admin@demo.com for admin access
          </p>
          <button
            onClick={() => {
              setIsLogin(true);
              setAuthError("");
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors mr-2"
          >
            Continue to Login
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {authError && (
          <div
            className={`px-4 py-3 text-sm font-medium ${
              authError.includes("successful")
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {authError}
          </div>
        )}

        <div className="p-6">
          {mode === "login" ? (
            <LoginPage
              onLogin={handleLogin}
              onSwitchToRegister={() => {
                setAuthError(null);
                setMode("register");
              }}
              onClose={onClose}
            />
          ) : (
            <RegisterPage
              onSwitchToLogin={() => {
                setAuthError(null);
                setMode("login");
              }}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
