'use client';

import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/features/auth/index';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';


export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      router.push('/chats/new');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка аутентификации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white border-blue-500 h-[44px] rounded-2xl"
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-white border-blue-500 h-[44px] rounded-2xl"
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 h-[44px] text-xs font-normal text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-100"
      >
        {isLoading ? 'Processing...' : 'Login'}
      </Button>
    </form>
  );
};