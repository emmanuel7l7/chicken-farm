import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";

interface Profile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  address?: string;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      console.error("Supabase client not configured");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      return;
    }
    setProfile(data);
  };

  const login = async (email: string, password: string) => {
    if (!supabase) {
      const errorMsg = "Authentication service not configured";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }

    setUser(data.user);
    if (data.user) fetchProfile(data.user.id);

    toast.success("Logged in successfully!");
    return { success: true };
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => {
    if (!supabase) {
      const errorMsg = "Authentication service not configured";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
      },
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }

    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email,
          name,
          phone,
        },
      ]);
      fetchProfile(data.user.id);
    }

    toast.success("Account created successfully!");
    return { success: true };
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    toast.info("Logged out");
  };

  useEffect(() => {
    const getSession = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        fetchProfile(data.session.user.id);
      }
      setIsLoading(false);
    };

    getSession();

    if (!supabase) {
      return;
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
