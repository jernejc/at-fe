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
      // Force a refresh to get the latest claims from the backend with retry logic.
      if (!result.claims.user_type) {
        console.log('Missing user_type claim, retrying with backoff...');
        
        // Retry up to 3 times with exponential backoff
        // This handles the race condition where backend needs time to set custom claims
        const maxRetries = 3;
        const delays = [500, 1000, 2000]; // milliseconds
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // Wait before retrying (except first attempt which already has the initial result)
          if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
          }
          
          // Force refresh token to get latest claims from backend
          result = await firebaseUser.getIdTokenResult(true);
          
          if (result.claims.user_type) {
            console.log(`Successfully retrieved user_type claim on attempt ${attempt + 1}`);
            break;
          }
          
          console.log(`Attempt ${attempt + 1}/${maxRetries}: user_type still missing, retrying...`);
        }
        
        // If still missing after retries, log a warning
        if (!result.claims.user_type) {
          console.warn('user_type claim still missing after retries. This may indicate a backend issue.');
        }
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
