"use client"

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


export default function HomePage() {
  const router = useRouter();

  return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Добро пожаловать на главную страницу !</h1>
        <p><Button className='bg-white text-black hover:bg-gray-300' onClick={() => router.push('/auth')}>Зарегистрироваться / Залогинится</Button></p>
        <br/>
        <p><Button className='bg-white text-black hover:bg-gray-300' onClick={() => router.push('/home')}>Домашняя страница</Button></p>
        <br/>
      </div>
  );
}