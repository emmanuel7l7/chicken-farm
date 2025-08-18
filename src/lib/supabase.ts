import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabase: any = null;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
