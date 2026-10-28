import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  hasAdminCustomClaim: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminClaims: (forceRefresh?: boolean) => Promise<boolean>;
}

export const BOOTSTRAPPED_ADMIN_EMAILS = [
  "bnagladeshbodnaparty@gmail.com",
  "skshopsaport@gmail.com"
];
export const BOOTSTRAPPED_ADMIN_EMAIL = BOOTSTRAPPED_ADMIN_EMAILS[0];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdminCustomClaim, setHasAdminCustomClaim] = useState(false);
  const [isDbAdmin, setIsDbAdmin] = useState(false);

  // Clean up any old demo admin artifact from previous sessions
  useEffect(() => {
    try {
      localStorage.removeItem('sk_demo_admin');
    } catch {
      // Ignore
    }
  }, []);

  const checkAdminClaims = async (forceRefresh: boolean = true): Promise<boolean> => {
    if (!auth.currentUser) {
      setHasAdminCustomClaim(false);
      return false;
    }
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult(forceRefresh);
      const hasClaim = Boolean(tokenResult?.claims?.isAdmin === true);
      setHasAdminCustomClaim(hasClaim);
      return hasClaim;
    } catch (err) {
      console.warn('Error checking ID token custom claims:', err);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isUserEmailAdmin = BOOTSTRAPPED_ADMIN_EMAILS.some(
          adminEmail => adminEmail.toLowerCase() === user.email?.toLowerCase()
        );

        // 1. Inspect custom claims
        try {
          const tokenResult = await user.getIdTokenResult();
          const hasClaim = Boolean(tokenResult?.claims?.isAdmin === true);
          setHasAdminCustomClaim(hasClaim);
        } catch (claimErr) {
          console.warn('Could not inspect token claims:', claimErr);
          setHasAdminCustomClaim(false);
        }

        // 2. Fetch / create user profile
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || 'Customer',
              email: user.email || '',
              role: isUserEmailAdmin ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (profileErr) {
          console.warn('Profile fetch/save note:', profileErr);
        }

        // 3. Ensure bootstrapped admin record exists in Firestore
        if (isUserEmailAdmin) {
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            await setDoc(adminDocRef, {
              id: user.uid,
              email: user.email,
              role: 'superadmin',
              name: user.displayName || 'Store SuperAdmin',
              createdAt: new Date().toISOString()
            }, { merge: true });
            setIsDbAdmin(true);
          } catch (adminSeedErr) {
            console.warn('Admin record sync note:', adminSeedErr);
            setIsDbAdmin(true);
          }
        } else {
          // Check if admin doc exists for this user
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminDocRef);
            setIsDbAdmin(adminSnap.exists());
          } catch (adminCheckErr) {
            setIsDbAdmin(false);
          }
        }
      } else {
        setUserProfile(null);
        setIsDbAdmin(false);
        setHasAdminCustomClaim(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(error.message || 'Failed to sign in with Google');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIsDbAdmin(false);
      setHasAdminCustomClaim(false);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const isEmailAdmin = Boolean(
    currentUser?.email &&
    BOOTSTRAPPED_ADMIN_EMAILS.some(e => e.toLowerCase() === currentUser.email?.toLowerCase())
  );
  const isAdmin = hasAdminCustomClaim || isEmailAdmin || isDbAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        hasAdminCustomClaim,
        signInWithGoogle,
        signOut,
        checkAdminClaims,
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
