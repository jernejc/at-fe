import { useState, useEffect, useCallback } from 'react';
import { firebaseAuth } from '@/lib/auth/firebaseClient';
import { onAuthStateChanged, User, IdTokenResult } from 'firebase/auth';

interface AuthUser {
  uid: string;
  email: string | null;
  userType: 'pdm' | 'partner';
  partnerId: number | null;
  partnerName: string | null;
  claims: Record<string, any>;
}

interface UseAuthUserReturn {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAuthUser(): UseAuthUserReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClaims = useCallback(async (firebaseUser: User) => {
    try {
      // First try to get claims (potentially from cache)
      let result: IdTokenResult = await firebaseUser.getIdTokenResult();
      
      // If user_type is missing, it implies claims might not be synced yet (e.g. new user).
      // Force a refresh to get the latest claims from the backend.
      if (!result.claims.user_type) {
        console.log('Missing user_type claim, forcing token refresh...');
        result = await firebaseUser.getIdTokenResult(true);
      }

      const claims = result.claims;

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        userType: (claims.user_type as 'pdm' | 'partner') || 'pdm',
        partnerId: (claims.partner_id as number) || null,
        partnerName: (claims.partner_name as string) || null,
        claims: claims,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching user claims:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user claims'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        fetchClaims(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchClaims]);

  const refresh = useCallback(async () => {
    if (firebaseAuth.currentUser) {
      setLoading(true);
      // Force refresh of the token
      await firebaseAuth.currentUser.getIdToken(true);
      await fetchClaims(firebaseAuth.currentUser);
    }
  }, [fetchClaims]);

  return { user, loading, error, refresh };
}
