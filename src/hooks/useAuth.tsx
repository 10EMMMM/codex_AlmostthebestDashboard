"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { ROLE_ADMIN } from '@/lib/roles';

interface AuthContextType {
  user: User | null;
  role: string | null;
  roles: string[];
  isSuperAdmin: boolean;
  hasAdminAccess: boolean;
  loading: boolean;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        setIsSuperAdmin(user.app_metadata?.is_super_admin === true);

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const extractedRoles = roleData?.map((entry) => entry.role) ?? [];

        setRoles(extractedRoles);
        setRole(extractedRoles[0] ?? null);
      } else {
        setUser(null);
        setRole(null);
        setRoles([]);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    };

    fetchUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserAndRole();
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setRoles([]);
        setIsSuperAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const hasAdminAccess = isSuperAdmin || roles.includes(ROLE_ADMIN);

  return (
    <AuthContext.Provider value={{ user, role, roles, isSuperAdmin, hasAdminAccess, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
