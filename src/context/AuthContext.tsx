
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  auth,
  googleProvider,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { UserProfile } from '../types';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['ruswatai@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setCurrentUser(null);
      setLoading(true);

      if (!user || !user.emailVerified) {
        setLoading(false);
        return;
      }

      const isUserAdmin = ADMIN_EMAILS.includes(user.email || '');
      const userDocRef = doc(db, 'users', user.uid);

      try {
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setCurrentUser({
            ...data,
            uid: user.uid,
            email: user.email || '',
            role: isUserAdmin ? 'admin' : 'member',
          });
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || 'Pemain Arashi',
            email: user.email || '',
            phone: user.phoneNumber || '',
            role: isUserAdmin ? 'admin' : 'member',
            teamName: 'ARASHI FC',
            teamId: 'team-arashi',
            avatarUrl: user.photoURL || '',
            createdAt: new Date().toISOString(),
          };

          // Rules must allow the owner to create their own profile.
          await setDoc(userDocRef, newProfile);
          setCurrentUser(newProfile);
        }
      } catch (error) {
        console.error('Gagal memuat profil Firebase:', error);
        // Do not grant admin or guest privileges when profile access fails.
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'auth');
    }
  };

  // Guest/demo access is disabled; Google login is required.
  const loginAsGuestMember = () => {
    console.warn('Silakan login menggunakan akun Google.');
  };

  const loginAsAdmin = () => {
    console.warn('Admin harus login menggunakan akun Google admin yang terdaftar.');
  };

  // Role changes are controlled by the verified account, not localStorage.
  const toggleRole = () => {
    console.warn('Peran pengguna tidak dapat diubah dari aplikasi.');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser || !currentUser || !firebaseUser.emailVerified) {
      throw new Error('Silakan login menggunakan Google terlebih dahulu.');
    }

    // Never let profile editing grant admin privileges or change account identity.
    const { role: _role, uid: _uid, email: _email, ...safeData } = data;
    const updated: UserProfile = {
      ...currentUser,
      ...safeData,
      uid: firebaseUser.uid,
      email: firebaseUser.email || currentUser.email,
      role: ADMIN_EMAILS.includes(firebaseUser.email || '') ? 'admin' : 'member',
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), updated, {
      merge: true,
    });
    setCurrentUser(updated);
  };

  const logout = async () => {
    await fbSignOut(auth);
    setFirebaseUser(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isAdmin:
          !!firebaseUser &&
          !!firebaseUser.emailVerified &&
          ADMIN_EMAILS.includes(firebaseUser.email || ''),
        loginWithGoogle,
        loginAsGuestMember,
        loginAsAdmin,
        toggleRole,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
