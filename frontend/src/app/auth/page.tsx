"use client"

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/contexts/AuthContext';


export default function AuthPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerEmail || !registerUsername || !registerPassword || !registerConfirmPassword) {
      toast.error("Заполните все поля");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      setRegisterLoading(true);
      
      const response = await fetch('http://localhost:8000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      toast.success("Успешная регистрация");
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      
    } catch (error: any) {
      const errorMessage = error.message || "Ошибка регистрации";
      toast.error(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };



  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);
    
    if (!loginEmail || !loginPassword) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      await login({ email: loginEmail, password: loginPassword });
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-black w-full h-[calc(100vh-52px)]">
      <div className="flex justify-center space-x-20 max-w-4xl w-full">
        <form className="flex-1 max-w-md" onSubmit={handleLoginSubmit}>
          <h2 className="text-white text-2xl font-bold mb-6 text-center">Вход</h2>
          <div className="flex flex-col items-center space-y-5">
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Email"
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              disabled={loginLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Пароль"
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              disabled={loginLoading}
            />
            <Button
              type="submit"
              className="bg-white h-15 w-full rounded-lg mt-3 hover:bg-gray-300 text-center"
              disabled={loginLoading}
            >    
              <span className="text-black">
                {loginLoading ? "Загрузка..." : "Войти"}
              </span>
            </Button>
          </div>
        </form>

        <form className="flex-1 max-w-md" onSubmit={handleRegisterSubmit}>
          <h2 className="text-white text-2xl font-bold mb-6 text-center">Регистрация</h2>
          <div className="flex flex-col items-center space-y-5">
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Email"
              type="email"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
              disabled={registerLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Имя пользователя"
              type="text"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
              disabled={registerLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Пароль"
              type="password"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              disabled={registerLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Подтвердите пароль"
              type="password"
              value={registerConfirmPassword}
              onChange={e => setRegisterConfirmPassword(e.target.value)}
              disabled={registerLoading}
            />
            <Button
              type="submit"
              className="bg-white h-15 w-full rounded-lg mt-3 hover:bg-gray-300 text-center"
              disabled={registerLoading}
            >    
              <span className="text-black">
                {registerLoading ? "Загрузка..." : "Зарегистрироваться"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}