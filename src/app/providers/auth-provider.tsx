import { useEffect, useState, useRef, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig } from '@/shared/api/supabase-client';
import { AppLoading } from '@/shared/ui/app-loading';
import { Debug } from '@/shared/utils/debug';
import { AuthContext, type UserRole } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    // If Supabase is not configured, skip auth check
    if (!hasSupabaseConfig) {
      Debug.warn('⚠️ Supabase not configured - skipping auth check');
      setLoading(false);
      return;
    }

    // Timeout to prevent infinite loading if Supabase is misconfigured
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        Debug.warn('Auth check timed out - continuing without authentication');
        setLoading(false);
      }
    }, 5000);

    const fetchUserRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error) {
          Debug.error('Error fetching user role:', error);
          // Fallback or handle error (e.g., set default role if applicable)
        } else {
          setRole(data?.role as UserRole);
        }
      } catch (err) {
        Debug.error('Unexpected error fetching role:', err);
      } finally {
        setLoading(false);
      }
    };

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        Debug.error('Error getting session:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
    setSession(null);
  };

  const value = {
    session,
    user,
    role,
    loading,
    signOut,
  };

  if (loading) {
    return <AppLoading fullScreen message="Checking authentication..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
