
'use client';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app, db, auth as clientAuth } from '@/lib/firebase';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import { Loader2 } from 'lucide-react';


interface User extends FirebaseUser {
  role?: string;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  services: FirebaseServices | null;
  refreshToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Initialize Firebase services synchronously to avoid initial "Loading..." stalls
  const [services] = useState<FirebaseServices | null>({ app, auth: clientAuth, db });
  const router = useRouter();

  // Function to refresh the user's token
  const refreshToken = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const token = await user.getIdToken(true); // Force refresh
      console.log('Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get a fresh token
          const token = await firebaseUser.getIdToken(true);
          console.log('User authenticated, token obtained');
          
          const tokenResult = await firebaseUser.getIdTokenResult();
          const claimsRole = (tokenResult.claims.role as string) || 'student';
          setUser({ ...firebaseUser, role: claimsRole });
        } catch (error) {
          console.error("Error getting user token:", error);
          // If token fails, treat as logged out
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!services) return;
    await signOut(services.auth);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to log out');
      }
    } catch (error) {
      console.error(error);
    } finally {
      // The onAuthStateChanged listener will handle setting the user to null
      router.push('/login');
    }
  };
  
  const value = useMemo(() => ({ 
    user, 
    loading, 
    logout, 
    services,
    refreshToken 
  }), [user, loading, logout, services, refreshToken]);

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
