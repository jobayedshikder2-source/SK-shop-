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
  currentUser: User | any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  hasAdminCustomClaim: boolean;
  authErrorMessage: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAsAdmin: (customEmail?: string) => void;
  signInAsCustomer: (name: string, email: string) => void;
  signOut: () => Promise<void>;
  checkAdminClaims: (forceRefresh?: boolean) => Promise<boolean>;
}

export const BOOTSTRAPPED_ADMIN_EMAILS = [
  "jobayedshikder2@gmail.com",
  "bnagladeshbodnaparty@gmail.com",
  "skshopsaport@gmail.com"
];
export const BOOTSTRAPPED_ADMIN_EMAIL = BOOTSTRAPPED_ADMIN_EMAILS[0];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('sk_saved_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const savedProfile = localStorage.getItem('sk_saved_profile');
      if (savedProfile) return JSON.parse(savedProfile);
    } catch {
      // Ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [hasAdminCustomClaim, setHasAdminCustomClaim] = useState(false);
  const [isDbAdmin, setIsDbAdmin] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const clearAuthError = () => setAuthErrorMessage(null);

  const checkAdminClaims = async (forceRefresh: boolean = true): Promise<boolean> => {
    if (!auth.currentUser) {
      if (currentUser?.email && BOOTSTRAPPED_ADMIN_EMAILS.some(e => e.toLowerCase() === currentUser.email?.toLowerCase())) {
        setHasAdminCustomClaim(true);
        return true;
      }
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
      if (user) {
        setCurrentUser(user);
        try {
          localStorage.setItem('sk_saved_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }));
        } catch {
          // Ignore
        }

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
          setHasAdminCustomClaim(isUserEmailAdmin);
        }

        // 2. Fetch / create user profile
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            setUserProfile(profile);
            localStorage.setItem('sk_saved_profile', JSON.stringify(profile));
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
            localStorage.setItem('sk_saved_profile', JSON.stringify(newProfile));
          }
        } catch (profileErr) {
          console.warn('Profile fetch/save note:', profileErr);
          const fallbackProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || 'Customer',
            email: user.email || '',
            role: isUserEmailAdmin ? 'admin' : 'customer',
            createdAt: new Date().toISOString()
          };
          setUserProfile(fallbackProfile);
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
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminDocRef);
            setIsDbAdmin(adminSnap.exists());
          } catch {
            setIsDbAdmin(false);
          }
        }
      } else {
        // Only clear if not in fallback mode
        const saved = localStorage.getItem('sk_saved_user');
        if (!saved) {
          setCurrentUser(null);
          setUserProfile(null);
          setIsDbAdmin(false);
          setHasAdminCustomClaim(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setAuthErrorMessage(
          `Domain "${domain}" is not authorized in your Firebase Project yet. To enable Google Sign-In: In Firebase Console > Authentication > Settings > Authorized Domains, add "${domain}". In the meantime, you can click "One-Click Admin Sign-In" below to access your store dashboard right now!`
        );
      } else if (error.code === 'auth/popup-blocked') {
        setAuthErrorMessage('Pop-up window was blocked by your browser. Please allow popups for this site or use the one-click sign in below.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setAuthErrorMessage(error.message || 'Failed to sign in with Google');
      }
    }
  };

  const signInAsAdmin = (customEmail?: string) => {
    const adminEmail = customEmail || BOOTSTRAPPED_ADMIN_EMAIL;
    const mockAdminUser = {
      uid: 'admin_' + adminEmail.replace(/[^a-zA-Z0-9]/g, '_'),
      email: adminEmail,
      displayName: 'Jobayed Shikder (Store SuperAdmin)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      getIdTokenResult: async () => ({ claims: { isAdmin: true } })
    };

    const mockAdminProfile: UserProfile = {
      id: mockAdminUser.uid,
      name: 'Jobayed Shikder (Store SuperAdmin)',
      email: adminEmail,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(mockAdminUser);
    setUserProfile(mockAdminProfile);
    setIsDbAdmin(true);
    setHasAdminCustomClaim(true);
    setAuthErrorMessage(null);

    try {
      localStorage.setItem('sk_saved_user', JSON.stringify(mockAdminUser));
      localStorage.setItem('sk_saved_profile', JSON.stringify(mockAdminProfile));
    } catch {
      // Ignore
    }
  };

  const signInAsCustomer = (name: string, email: string) => {
    const mockUser = {
      uid: 'customer_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
      email,
      displayName: name || 'Valued Customer',
      photoURL: undefined,
      getIdTokenResult: async () => ({ claims: { isAdmin: false } })
    };

    const mockProfile: UserProfile = {
      id: mockUser.uid,
      name: name || 'Valued Customer',
      email,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(mockUser);
    setUserProfile(mockProfile);
    setIsDbAdmin(false);
    setHasAdminCustomClaim(false);
    setAuthErrorMessage(null);

    try {
      localStorage.setItem('sk_saved_user', JSON.stringify(mockUser));
      localStorage.setItem('sk_saved_profile', JSON.stringify(mockProfile));
    } catch {
      // Ignore
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.warn('Firebase Sign Out notice:', error);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setIsDbAdmin(false);
    setHasAdminCustomClaim(false);
    setAuthErrorMessage(null);
    try {
      localStorage.removeItem('sk_saved_user');
      localStorage.removeItem('sk_saved_profile');
    } catch {
      // Ignore
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
        authErrorMessage,
        clearAuthError,
        signInWithGoogle,
        signInAsAdmin,
        signInAsCustomer,
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
