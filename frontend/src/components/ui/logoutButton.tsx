"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/app/store/useAuthStore';
import { authApi } from '@/app/lib/authApi';


export default function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/auth');
    }
  };

  return (
    <Button className='bg-white hover:bg-gray-300 text-black' onClick={handleLogout} variant="destructive">
      Выйти
    </Button>
  );
}