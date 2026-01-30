import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-database-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Vietnam timezone helper (preserve from original codebase)
export const getVietnamDate = () => {
  const now = new Date();
  const utcOffset = now.getTimezoneOffset() * 60000;
  const vietnamOffset = 7 * 3600000; // UTC+7
  return new Date(now.getTime() + utcOffset + vietnamOffset);
};
