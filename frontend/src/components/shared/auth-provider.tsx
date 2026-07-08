'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, initialized, checkMe } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkMe();
  }, [checkMe]);

  useEffect(() => {
    if (initialized) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [user, initialized, pathname, router]);

  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-zinc-400 font-medium">Memuat FirmanMan...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
