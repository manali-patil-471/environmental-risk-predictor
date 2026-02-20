import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { setPreferredCity } from '@/lib/preferredCity';

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  city: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signup: (input: SignupInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<Record<string, any> | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async ({ fullName, email, password, city }: SignupInput) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      await updateProfile(cred.user, { displayName: fullName });
    }
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      fullName,
      email,
      city,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      provider: 'password',
    }, { merge: true });
    if (city) setPreferredCity(city);
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profileSnap = await getDoc(doc(db, 'users', cred.user.uid));
    const savedCity = profileSnap.exists() ? String(profileSnap.data()?.city || '') : '';
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      fullName: cred.user.displayName || '',
      city: savedCity,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      provider: 'password',
    }, { merge: true });
    if (savedCity) setPreferredCity(savedCity);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getUserProfile = async () => {
    if (!auth.currentUser) return null;
    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
    return snap.exists() ? snap.data() : null;
  };

  const value = useMemo(() => ({
    user,
    loading,
    signup,
    login,
    logout,
    getUserProfile,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
