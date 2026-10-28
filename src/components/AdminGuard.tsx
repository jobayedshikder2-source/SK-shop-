import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  RefreshCw, 
  ArrowLeft, 
  User, 
  AlertTriangle,
  Mail,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  onBackToStore?: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, onBackToStore }) => {
  const { 
    currentUser, 
    loading: authLoading, 
    signInWithGoogle, 
    signInAsAdmin,
    signOut, 
    isAdmin, 
    hasAdminCustomClaim, 
    authErrorMessage,
    clearAuthError,
    checkAdminClaims 
  } = useAuth();

  const [verifyingClaims, setVerifyingClaims] = useState(false);
  const [claimChecked, setClaimChecked] = useState(false);
  const [customClaimsDetails, setCustomClaimsDetails] = useState<Record<string, any> | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Directly verify the Firebase ID Token for 'isAdmin' custom claim
  const verifyTokenClaims = async (forceRefresh: boolean = false) => {
    if (!currentUser) {
      setCustomClaimsDetails(null);
      setClaimChecked(true);
      return;
    }

    try {
      setVerifyingClaims(true);
      setRefreshMessage(null);
      const tokenResult = await currentUser.getIdTokenResult(forceRefresh);
      setCustomClaimsDetails(tokenResult?.claims || {});
      await checkAdminClaims(forceRefresh);
      if (forceRefresh) {
        setRefreshMessage('Token refreshed successfully. Custom claims re-evaluated.');
      }
    } catch (err: any) {
      console.error('Failed to inspect token custom claims:', err);
      setRefreshMessage('Failed to inspect token claims: ' + (err.message || 'Unknown error'));
    } finally {
      setVerifyingClaims(false);
      setClaimChecked(true);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser) {
      verifyTokenClaims(false);
    } else if (!authLoading && !currentUser) {
      setClaimChecked(true);
    }
  }, [authLoading, currentUser]);

  // 1. Initial Authentication & Claim Loading State
  if (authLoading || (currentUser && !claimChecked)) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center max-w-sm text-center space-y-5">
          <div className="relative">
            <img
              src="./assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png"
              alt="SK Shop Logo"
              className="w-20 h-20 rounded-full object-contain border-2 border-stone-700 shadow-xl animate-pulse"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 text-stone-950 rounded-full shadow-md">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif tracking-tight text-white">SK SHOP Admin Portal</h2>
            <p className="text-xs text-stone-400 mt-1">Verifying Firebase Authentication & 'isAdmin' custom claims...</p>
          </div>
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // 2. Unauthenticated User View (Must sign in first)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-stone-850/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="./assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png"
                alt="SK Shop Logo"
                className="w-20 h-20 rounded-full object-contain border border-stone-700 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-rose-500 text-white rounded-full shadow-md">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2">
              Restricted Area · /admin
            </span>
            <h1 className="text-2xl font-bold font-serif text-white tracking-tight">Admin Authentication Required</h1>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Access to the SK Shop administrative dashboard is restricted. Sign in with your authorized admin account (<span className="text-amber-400 font-semibold font-mono">jobayedshikder2@gmail.com</span>).
            </p>
          </div>

          {authErrorMessage && (
            <div className="p-3 bg-amber-950/60 border border-amber-700/50 rounded-2xl text-left space-y-1 text-xs text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Firebase Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-100/90">{authErrorMessage}</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={() => signInAsAdmin('jobayedshikder2@gmail.com')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>One-Click Admin Login (jobayedshikder2)</span>
            </button>

            <button
              onClick={signInWithGoogle}
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs rounded-xl border border-stone-700 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>

            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="w-full py-2 px-4 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 font-medium text-xs rounded-xl border border-stone-800 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Storefront</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 flex flex-col items-center gap-1">
            <span>Need administrator credentials or assistance?</span>
            <a 
              href="mailto:skshopsaport@gmail.com"
              className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>skshopsaport@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. User Authenticated, but lacks 'isAdmin' Custom Claim
  // Note: We also support isDemoAdmin / bootstrapped admin with clear notice if active
  const hasExactClaim = Boolean(customClaimsDetails?.isAdmin === true || hasAdminCustomClaim);
  const isAuthorized = hasExactClaim || isAdmin;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-stone-850/95 border border-rose-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                403 Access Denied
              </span>
              <h2 className="text-xl font-bold font-serif text-white tracking-tight mt-1">
                Admin Custom Claim Missing
              </h2>
            </div>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            Your authenticated account does not possess the required <span className="font-mono text-amber-400 font-semibold">'isAdmin'</span> custom claim on your Firebase ID token. Access to the <span className="font-mono text-stone-200">/admin</span> dashboard is strictly restricted.
          </p>

          {/* Diagnostic Claims Inspection Box */}
          <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-stone-400 border-b border-stone-800 pb-2">
              <span className="font-sans font-bold text-stone-300">Authentication Diagnostic</span>
              <span className="text-[10px] text-stone-500">Firebase Token Claims</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
              <span className="text-stone-500">Account:</span>
              <span className="col-span-2 text-stone-200 truncate">{currentUser.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <span className="text-stone-500">User UID:</span>
              <span className="col-span-2 text-stone-400 truncate">{currentUser.uid}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <span className="text-stone-500">'isAdmin' Claim:</span>
              <span className="col-span-2 font-bold text-rose-400">
                {customClaimsDetails?.isAdmin ? 'true' : 'false / not set'}
              </span>
            </div>
          </div>

          {refreshMessage && (
            <div className="p-3 bg-stone-800 text-amber-300 rounded-xl text-xs flex items-center gap-2 border border-stone-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{refreshMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => verifyTokenClaims(true)}
              disabled={verifyingClaims}
              className="flex-1 py-2.5 px-4 bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold text-xs rounded-xl border border-stone-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifyingClaims ? 'animate-spin' : ''}`} />
              <span>{verifyingClaims ? 'Re-verifying...' : 'Refresh Token Claims'}</span>
            </button>

            <button
              onClick={signOut}
              className="py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 font-semibold text-xs rounded-xl border border-rose-800/40 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          </div>

          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-white font-medium text-xs rounded-xl border border-stone-800 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </button>
          )}

          <div className="text-center pt-3 border-t border-stone-800 text-[11px] text-stone-500">
            <span>To request official administrator access, contact: </span>
            <a href="mailto:skshopsaport@gmail.com" className="text-amber-400 hover:underline">
              skshopsaport@gmail.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized: Render Admin Panel with security claim badge
  return (
    <div className="relative min-h-screen">
      {/* Security Verification Indicator */}
      <aside aria-label="Security status banner" className="bg-stone-950 border-b border-stone-800 px-4 py-1.5 text-[11px] text-stone-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-stone-300">
            Admin Route Guard: Active
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            {hasExactClaim ? "Claim 'isAdmin': Verified" : "Admin Authorized"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-stone-500">
          <span className="truncate max-w-[200px] sm:max-w-none">{currentUser.email}</span>
          <a
            href="mailto:skshopsaport@gmail.com"
            className="text-stone-400 hover:text-amber-400 transition hidden sm:inline"
            title="Admin Support"
          >
            skshopsaport@gmail.com
          </a>
        </div>
      </aside>

      {/* Admin Protected Content */}
      {children}
    </div>
  );
};
