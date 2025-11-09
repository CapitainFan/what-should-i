"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import { authApi } from '@/app/lib/authApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken, setAuth, isInitialized, setInitialized, logout } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) {
        setIsChecking(false);
        return;
      }

      if (accessToken) {
        try {
          const data = await authApi.verify();
          setAuth(data.accessToken, data.user);
          setInitialized(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
          setInitialized(true);
        }
      } else {
        setInitialized(true);
      }
      
      setIsChecking(false);
    };

    initializeAuth();
  }, [accessToken, setAuth, setInitialized, logout, isInitialized]);

  useEffect(() => {
    if (isInitialized && !accessToken && !isChecking) {
      router.push('/auth');
    }
  }, [isInitialized, accessToken, isChecking, router]);

  if (isChecking || !isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Проверка авторизации...</div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
}