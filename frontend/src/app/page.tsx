"use client"

import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const handleBeginChatButton = async () => {
    if (isAuthenticated) {
      window.location.href = '/chats/new'
    } else {
      window.location.href = '/auth'
    }
  };

  return (
    <div className='bg-white min-h-[calc(100vh-72px)] flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-8 lg:py-0'>
      <div className='w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-10 lg:mb-0'>
        <div className='mb-6 lg:mb-8'>
          <h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight'>
            What
          </h1>
          <h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight'>
            Should I?
          </h1>
        </div>

        <div className='max-w-xl lg:max-w-lg xl:max-w-2xl bg-gray-100 rounded-3xl lg:rounded-4xl p-4 sm:p-6 mb-8 lg:mb-10'>
          <p className='text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed'>
            Приветствуем в <strong className='font-semibold'>What Should I</strong> — платформа с ИИ-помощником <strong className='font-semibold'>Ви</strong> для принятия решений. Неважно, планируете ли вы вечер, ищете новое хобби или решаете что приготовить — начните диалог, и <strong className='font-semibold'>Ви</strong> поможет выбрать лучший вариант.
          </p>
        </div>

        <button 
          className='bg-blue-500 text-white rounded-3xl px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-bold hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl'
          onClick={handleBeginChatButton}
        >
          Начать чат с Ви
        </button>
      </div>

      <div className='w-full lg:w-1/2 flex justify-center lg:justify-end'>
        <div className='relative w-full max-w-md lg:max-w-lg xl:max-w-xl'>
          <Image 
            alt='Изображение для главной страницы' 
            src="/main_page_pic.PNG" 
            width={672} 
            height={560}
            priority
            className='w-full h-auto object-contain rounded-lg lg:rounded-xl'
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          />
        </div>
      </div>
    </div>
  );
}