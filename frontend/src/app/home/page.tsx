"use client"

import ProtectedRoute from '@/components/ui/ProtectedRoute';
import { useAuthStore } from '../store/useAuthStore';
import LogoutButton from '@/components/ui/logoutButton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Добро пожаловать, {user?.username}!</h1>
        <p className="mb-4 text-white">Email: {user?.email}</p>
        <p className="mb-4 text-white">ID: {user?._id}</p>
        <p><Button className='bg-white text-black hover:bg-gray-300' onClick={() => router.push('/')}>На главную страницу</Button></p>
        <br/>
        <LogoutButton />
      </div>
    </ProtectedRoute>
  );
}