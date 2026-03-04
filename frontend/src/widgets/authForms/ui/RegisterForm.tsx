'use client';

import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { CheckboxAuth } from '@/features/auth/index';
import { useAuth } from '@/features/auth/index';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    setIsLoading(true);
    try {
      await register({ username, email, password });
      toast.success('Успешная регистрация');
      router.push('/chats/new');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="bg-white border-blue-500 h-[44px] rounded-2xl"
      />
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
      <Input
        placeholder="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="bg-white border-blue-500 h-[44px] rounded-2xl"
      />
      <div className="flex items-center space-x-2 mt-4">
        <CheckboxAuth onCheck={() => console.log('checked')} />
        <label className="text-sm">I agree to terms</label>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 h-[44px] text-xs font-normal text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-100"
      >
        {isLoading ? 'Processing...' : 'Registration'}
      </Button>
    </form>
  );
};