import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Type-safe query helper
export const safeQuery = async <T extends { data: any; error: any }>(query: Promise<T>) => {
  try {
    const result = await query;
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Error handling
export const handleSupabaseError = (error: unknown): string => {
  console.error('Supabase Error:', error);
  
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
};