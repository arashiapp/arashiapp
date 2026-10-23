import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
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

// Admin email configured for the app
const ADMIN_EMAILS = ['ruswatai@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Set default active user so user can immediately use and test app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const isUserAdmin = ADMIN_EMAILS.includes(user.email || '');
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setCurrentUser({
              ...data,
              role: isUserAdmin ? 'admin' : (data.role || 'member')
            });
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'Pemain Arashi',
              email: user.email || 'user@arashi.id',
              phone: user.phoneNumber || '+62 812 3456 7890',
              role: isUserAdmin ? 'admin' : 'member',
              teamName: 'ARASHI FC',
              teamId: 'team-arashi',
              avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);

            if (isUserAdmin) {
              await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                grantedAt: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.warn('Error reading user profile from Firestore:', err);
          // Fallback user state
          setCurrentUser({
            uid: user.uid,
            name: user.displayName || 'Pemain Arashi',
            email: user.email || 'user@arashi.id',
            phone: '+62 812 3456 7890',
            role: isUserAdmin ? 'admin' : 'member',
            teamName: 'ARASHI FC',
            teamId: 'team-arashi',
            avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Default session for fast preview (Pemain Arashi)
        const savedGuest = localStorage.getItem('arashi_guest_session');
        if (savedGuest) {
          try {
            setCurrentUser(JSON.parse(savedGuest));
          } catch {
            setDefaultMember();
          }
        } else {
          setDefaultMember();
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setDefaultMember = () => {
    const defaultUser: UserProfile = {
      uid: 'user-dika',
      name: 'Pemain Arashi',
      email: 'pemain@arashi.id',
      phone: '+62 812 3456 7890',
      role: 'member', // Member by default
      teamName: 'ARASHI FC',
      teamId: 'team-arashi',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(defaultUser);
    localStorage.setItem('arashi_guest_session', JSON.stringify(defaultUser));
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'auth');
    }
  };

  const loginAsGuestMember = () => {
    const memberUser: UserProfile = {
      uid: 'user-dika',
      name: 'Pemain Arashi',
      email: 'pemain@arashi.id',
      phone: '+62 812 3456 7890',
      role: 'member',
      teamName: 'ARASHI FC',
      teamId: 'team-arashi',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(memberUser);
    localStorage.setItem('arashi_guest_session', JSON.stringify(memberUser));
  };

  const loginAsAdmin = () => {
    const adminUser: UserProfile = {
      uid: 'admin-super',
      name: 'Administrator Arashi',
      email: 'ruswatai@gmail.com',
      phone: '+62 811 9988 7766',
      role: 'admin',
      teamName: 'ARASHI FC',
      teamId: 'team-arashi',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(adminUser);
    localStorage.setItem('arashi_guest_session', JSON.stringify(adminUser));
  };

  // Fast toggle between Admin Full and Anggota Terbatas to test permissions immediately
  const toggleRole = () => {
    if (!currentUser) return;
    const newRole: 'admin' | 'member' = currentUser.role === 'admin' ? 'member' : 'admin';
    const updated = {
      ...currentUser,
      role: newRole,
      name: newRole === 'admin' ? 'Administrator Arashi' : 'Pemain Arashi'
    };
    setCurrentUser(updated);
    localStorage.setItem('arashi_guest_session', JSON.stringify(updated));
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('arashi_guest_session', JSON.stringify(updated));
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), updated, { merge: true });
      } catch (err) {
        console.error('Failed to sync profile update to Firestore:', err);
      }
    }
  };

  const logout = async () => {
    if (firebaseUser) {
      await fbSignOut(auth);
    }
    setDefaultMember();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isAdmin: currentUser?.role === 'admin',
        loginWithGoogle,
        loginAsGuestMember,
        loginAsAdmin,
        toggleRole,
        updateProfile,
        logout
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
