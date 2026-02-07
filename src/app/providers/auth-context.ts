import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database.types';

export type UserRole = Database['public']['Tables']['profiles']['Row']['role'];

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
