"use client"

import { useAuth } from '@/contexts/AuthContext';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CheckboxAuth,
  AuthSwitch,
  GoogleIcon,
  AppleIcon,
  FaceBookIcon,
  DiskordIcon,
  TelegramIcon,
} from "@/components/ui/AuthComponents"
import { motion, AnimatePresence } from "framer-motion"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";


export default function AuthPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleAuthToggle = (isLogin: boolean) => {
    setIsLoginForm(isLogin);
  };

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
      
      await register({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      });

      toast.success("Успешная регистрация");

      router.push('/chats/new');
      
    } catch (error: any) {
      const errorMessage = error.message || "Ошибка регистрации";
      toast.error(errorMessage);
    }
  };



  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      await login({ email: loginEmail, password: loginPassword });
      router.push('/chats/new');
    } catch (error: any) {
      const errorMessage = error.message || "Ошибка аутенфикации";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-72px)] overflow-hidden p-4 bg-gradient-to-bl from-blue-500 from- via-blue-600 via- to-blue- to-">
        <AnimatePresence>
          {true && (
            <div 
              className={`
                bg-gray-200 border-none
                w-[360px] 
                ${isLoginForm ? 'h-[506px]' : 'h-[556px]'}
                overflow-hidden
                p-0 rounded-xl
                flex flex-col
              `}
            >

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ 
                  duration: 1,
                  ease: [0.33, 1, 0.68, 1]
                }}
                className="flex-1 flex flex-col pt-2 relative"
              >
                <div className="mb-[25px]">
                  <div className="flex justify-between items-center mt-4 px-6">
                    <div className="flex-1"></div>
                    <div className="flex-1 flex justify-center">
                      <AuthSwitch 
                        isLogin={isLoginForm} 
                        onToggle={handleAuthToggle} 
                      />
                    </div>
                    <div className="flex-1 flex justify-end">
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4 flex-1 flex flex-col">
                  {isLoginForm ? (
                    <>
                      <div className="grid gap-4 py-2">
                        <form className="space-y-4">
                          <Input
                            id="loginEmail" name="loginEmail"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            placeholder="Email" type="text"
                            className="bg-white border-blue-500 h-[44px] rounded-2xl focus-visible:ring-0 focus:outline-none"
                          />
                          <Input
                            id="loginPassword" name="loginPassword"
                            value={loginPassword} 
                            onChange={e => setLoginPassword(e.target.value)}
                            placeholder="Password" type="password" 
                            className="bg-white border-blue-500 h-[44px] rounded-2xl focus-visible:ring-0 focus:outline-none"
                          />
                        </form>
                      </div>
                      
                      <div className="mt-6">
                          <Button
                            className="w-full mt-4 h-[44px] flex items-center justify-center text-xs leading-[12px]
                            font-normal text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-100"
                            type="button"
                            onClick={handleLoginSubmit}
                          >
                            {isLoading ? "Processing..." : "Login"}
                          </Button>
                        
                        <label className="flex items-center justify-center text-xs mt-7 mb-1">
                          Use social networks
                        </label>

                        <div className="flex justify-center mt-3">
                          <div className="flex gap-3 w-[322px] justify-center">
                            <GoogleIcon/>
                            <AppleIcon/>
                            <FaceBookIcon/>
                            <DiskordIcon/>
                            <TelegramIcon/>
                          </div>
                        </div>

                        <Link 
                          className="flex items-center justify-center text-xs mt-4 text-gray-400 underline"
                          href="#"
                          >
                          Forgot password ?
                        </Link>
                        
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 py-2">
                        <form className="space-y-2">
                          <Input
                            id="registerUsername" name="registerUsername"
                            value={registerUsername}
                            onChange={e => setRegisterUsername(e.target.value)}
                            placeholder="Username" type="text"
                            className="bg-white border-blue-500 h-[44px] rounded-2xl focus-visible:ring-0 focus:outline-none"
                          />
                          <Input
                            id="registerEmail" name="registerEmail"
                            value={registerEmail}
                            onChange={e => setRegisterEmail(e.target.value)}
                            placeholder="Email" type="text"
                            className="bg-white border-blue-500 h-[44px] rounded-2xl focus-visible:ring-0 focus:outline-none"
                          />
                          <Input
                            id="registerPassword" name="registerPassword"
                            value={registerPassword}
                            onChange={e => setRegisterPassword(e.target.value)}
                            placeholder="Password" type="password"
                            className="bg-white border-blue-500 h-[44px] rounded-2xl focus-visible:ring-0 focus:outline-none"
                          />
                          <Input
                            id="registerConfirmPassword" name="registerConfirmPassword"
                            value={registerConfirmPassword}
                            onChange={e => setRegisterConfirmPassword(e.target.value)}
                            placeholder="Confirm Password" type="password"
                            className="bg-white border-blue-500 h-[44px] rounded-2xl focus-visible:ring-0 focus:outline-none"
                          />
                        </form>
                      </div>
                      
                      <div className="mt-6 mb-4">
                        <div className="flex items-center space-x-2">
                          <CheckboxAuth
                             onCheck={() => console.log("Галочка установлена!")}
                          />
                          <label htmlFor="terms" className="text-sm">
                            Use social networks
                          </label>
                        </div>
                      </div>

                      <div className="mt-auto">
                          <Button
                            className="w-full mt-4 h-[44px] flex items-center justify-center text-xs leading-[12px]
                            font-normal text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-100"
                            type="button"
                            onClick={handleRegisterSubmit}
                          >
                            {isLoading ? "Processing..." : "Registration"}
                        </Button>
                        
                        <label className="flex items-center justify-center text-xs mt-7 mb-1">
                          Use social networks
                        </label>

                        <div className="flex justify-center mt-3">
                          <div className="flex gap-3 w-[322px] justify-center">
                            <GoogleIcon/>
                            <AppleIcon/>
                            <FaceBookIcon/>
                            <DiskordIcon/>
                            <TelegramIcon/>
                          </div>
                        </div>

                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}