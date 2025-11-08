import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuth(requireAuth: boolean = false) {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return; // Don't redirect until hydrated
    
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, isAuthenticated, router, isHydrated]);

  return {
    user,
    token,
    isAuthenticated,
    isHydrated,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}
