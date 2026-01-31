import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are missing or are placeholders
const isPlaceholder = (value: string | undefined) =>
  !value || value.includes('placeholder') || value === 'undefined';

export const hasSupabaseConfig =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.error('Missing Supabase environment variables');
  console.error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create client with fallback to prevent crashes
// Use placeholder values if env vars are missing (will show error UI instead of crash)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
