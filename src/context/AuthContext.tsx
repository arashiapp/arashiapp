
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuestMember: () => void;
  loginAsAdmin: () => void;
  toggleRole: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['arashimajubersama@gmail.com'];

function profileFromData(
  id: string,
  email: string,
  data: Record<string, unknown>
): UserProfile {
  const emailIsAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

  return {
    uid: id,
    name: String(data.full_name || 'Pemain SparringHub'),
    email,
    phone: String(data.phone || ''),
    role: emailIsAdmin && data.role === 'admin' ? 'admin' : 'member',
    avatarUrl: typeof data.avatar_url === 'string' ? data.avatar_url : undefined,
    createdAt: String(data.created_at || new Date().toISOString()),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user: User | null) => {
    setAuthUser(user);

    if (!user) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const email = (user.email || '').toLowerCase();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      let profileData = data;

      if (!profileData) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: String(
              user.user_metadata?.full_name || 'Pemain SparringHub'
            ),
            role: 'member',
          });

        if (insertError) {
          const { data: existingProfile, error: reloadError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (reloadError) throw reloadError;
          if (!existingProfile) throw insertError;
          profileData = existingProfile;
        } else {
          const { data: newProfile, error: reloadError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (reloadError) throw reloadError;
          if (!newProfile) throw new Error('Profil belum tersedia setelah dibuat.');
          profileData = newProfile;
        }
      }

      setCurrentUser(profileFromData(user.id, email, profileData));
    } catch (error) {
      console.error('Gagal memuat profil:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error('Gagal memeriksa sesi:', error.message);
      void loadProfile(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const user = session?.user ?? null;
      setAuthUser(user);

      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      setTimeout(() => {
        if (active) void loadProfile(user);
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: 'https://fastidious-longma-3d7733.netlify.app/',
      }
    );

    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      throw new Error(
        'Sesi pemulihan tidak ditemukan. Buka kembali tautan terbaru dari email.'
      );
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://arashiapp.github.io/arashiapp/',
      },
    });
    if (error) throw error;
  };

  const loginAsGuestMember = () => {
    throw new Error('Silakan daftar atau login menggunakan email dan kata sandi.');
  };

  const loginAsAdmin = () => {
    throw new Error('Akses admin hanya tersedia untuk akun yang telah diberi izin secara aman.');
  };

  const toggleRole = () => {
    throw new Error('Peran tidak dapat diubah dari aplikasi.');
  };

  const updateProfile = async (changes: Partial<UserProfile>) => {
    if (!authUser || !currentUser) {
      throw new Error('Silakan login terlebih dahulu.');
    }

    const updates: Record<string, unknown> = {};

    if (changes.name !== undefined) updates.full_name = changes.name;
    if (changes.phone !== undefined) updates.phone = changes.phone;
    if (changes.avatarUrl !== undefined) updates.avatar_url = changes.avatarUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (error) throw error;

    setCurrentUser(profileFromData(authUser.id, authUser.email || '', data));
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser: authUser,
        loading,
        isAdmin: currentUser?.role === 'admin',
        loginWithGoogle,
        loginAsGuestMember,
        loginAsAdmin,
        toggleRole,
        updateProfile,
        logout,
        signUpWithEmail,
        loginWithEmail,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
