import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isCloudConfigured } from './supabase';
import { setCloudUser, migrateLocalToCloud } from './store';

// mode:
//  'loading' - checking for a saved session
//  'signedOut' - cloud is set up, no session, guest not chosen -> show Auth page
//  'cloud' - signed in, data syncs to Supabase
//  'guest' - chose to stay on this device only
//  'local' - Supabase not configured at all (dev/demo), device only
const AuthContext = createContext(null);
const GUEST_KEY = 'soulspace-guest';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState(isCloudConfigured ? 'loading' : 'local');
  const [syncError, setSyncError] = useState('');
  const [recovering, setRecovering] = useState(false);

  const applySession = useCallback(async (next) => {
    setSession(next);
    if (next?.user) {
      setCloudUser(next.user.id);
      localStorage.removeItem(GUEST_KEY);
      try {
        await migrateLocalToCloud(next.user.id);
        setSyncError('');
      } catch (err) {
        setSyncError("We couldn't copy this device's earlier entries to your account yet. They're still safe on this device.");
      }
      setMode('cloud');
    } else {
      setCloudUser(null);
      setMode(localStorage.getItem(GUEST_KEY) ? 'guest' : 'signedOut');
    }
  }, []);

  useEffect(() => {
    if (!isCloudConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      applySession(next);
    });
    return () => listener.subscription.unsubscribe();
  }, [applySession]);

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, '1');
    setMode('guest');
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setCloudUser(null);
    setMode('signedOut');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        mode,
        syncError,
        recovering,
        finishRecovery: () => setRecovering(false),
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
