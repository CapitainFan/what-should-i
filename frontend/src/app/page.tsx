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
      <div className='bg-white h-[calc(100%-72px)]'>
        <h1 className='absolute ml-30 mt-20 text-[80px] font-bold'>What</h1>
        <br/><br/><br/>
        <h1 className='absolute ml-30 mt-20 text-[80px] font-bold'>Should I?</h1>

        <div className='absolute ml-27 mt-61 w-150 h-30 bg-gray-200 rounded-4xl flex justify-center items-center'><h3 className='w-135 text-[15px]'>Приветсвуем в <strong>What Should I</strong> — платформа с ИИ-помощником <strong>Ви</strong>  для принятия решений. Неважно, планируете ли вы вечер, ищете новое хобби или решаете что приготовить — начните диалог, и <strong>Ви</strong> поможет выбрать лучший вариант.</h3></div>

        <button className='absolute bg-blue-500 text-white ml-35 mt-110 rounded-3xl h-15 w-50 font-bold hover:bg-blue-700'
        onClick={handleBeginChatButton}>Начать чат с Ви</button>

        <div className='flex justify-end items-center'>
          <Image alt='Изображение для главной страницы' src="/main_page_pic.PNG" width={560} height={560} className='w-auto h-140 '></Image>
        </div>
      </div>
  );
}