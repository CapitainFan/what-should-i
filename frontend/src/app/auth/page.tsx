'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialIcons, AuthSwitch } from '@/features/auth/index';
import { LoginForm, RegisterForm } from '@/widgets/authForms/index'


export default function AuthPage() {
  const [isLoginForm, setIsLoginForm] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-72px)] overflow-hidden p-4 bg-gradient-to-bl from-blue-500 via-blue-600 to-blue-700">
      <AnimatePresence>
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
            transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
            className="flex-1 flex flex-col pt-2 relative"
          >
            <div className="mb-[25px]">
              <div className="flex justify-between items-center mt-4 px-6">
                <div className="flex-1"></div>
                <div className="flex-1 flex justify-center">
                  <AuthSwitch isLogin={isLoginForm} onToggle={setIsLoginForm} />
                </div>
                <div className="flex-1 flex justify-end"></div>
              </div>
            </div>

            <div className="px-6 pb-4 flex-1 flex flex-col">
              {isLoginForm ? (
                <>
                  <LoginForm />
                  <div className="mt-6">
                    <label className="flex items-center justify-center text-xs mt-7 mb-1">
                      Use social networks
                    </label>
                    <SocialIcons />
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
                  <RegisterForm />
                  <div className="mt-auto">
                    <label className="flex items-center justify-center text-xs mt-7 mb-1">
                      Use social networks
                    </label>
                    <SocialIcons />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}