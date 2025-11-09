"use client"

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "../store/useAuthStore";
import { authApi } from "../lib/authApi";

export default function AuthPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const router = useRouter();
  const { setAuth, setLoading, isLoading } = useAuthStore();

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
      setLoading(true);
      const data = await authApi.register({
        email: registerEmail,
        username: registerUsername,
        password: registerPassword,
      });

      const userData = {
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture
      };

      setAuth(data.accessToken, userData);
      
      toast.success("Успешная регистрация");
      router.push('/home');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Ошибка регистрации";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      setLoading(true);
      const data = await authApi.login({
        email: loginEmail,
        password: loginPassword,
      });

      const userData = {
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture
      };

      setAuth(data.accessToken, userData);

      toast.success("Успешный вход");
      router.push('/home');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Ошибка аутентификации";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
              disabled={isLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Пароль"
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-white h-15 w-full rounded-lg mt-3 hover:bg-gray-300 text-center"
              disabled={isLoading}
            >    
              <span className="text-black">
                {isLoading ? "Загрузка..." : "Войти"}
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
              disabled={isLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Имя пользователя"
              type="text"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
              disabled={isLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Пароль"
              type="password"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              disabled={isLoading}
            />
            <Input
              className="bg-white h-15 w-full rounded-lg text-center"
              placeholder="Подтвердите пароль"
              type="password"
              value={registerConfirmPassword}
              onChange={e => setRegisterConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-white h-15 w-full rounded-lg mt-3 hover:bg-gray-300 text-center"
              disabled={isLoading}
            >    
              <span className="text-black">
                {isLoading ? "Загрузка..." : "Зарегистрироваться"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}