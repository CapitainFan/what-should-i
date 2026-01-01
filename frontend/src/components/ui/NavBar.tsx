'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Chat {
  _id: string;
  name: string;
}

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const authFetch = useAuthFetch();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const isChatPage = pathname.startsWith('/chats/new') || 
                    (pathname.startsWith('/chats/') && pathname !== '/chats' && !pathname.startsWith('/chats/new'));

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch('/api/chats/allChatsNames');
      
      if (response.ok) {
        const data: Chat[] = await response.json();
        setChats(data || []);
      } else {
        setError('Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Error loading chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && isAuthenticated) {
      fetchChats();
    }
  }, [open, isAuthenticated]);

  return (
    <div className="flex justify-end bg-gray-200 w-full h-18">
      {isAuthenticated ? (
        <>
          {isChatPage ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center ml-5">
                <Sheet open={open} onOpenChange={setOpen}>

                  <SheetTrigger asChild>
                    <Button className="bg-blue-500 hover:bg-blue-700 h-11 text-white px-4 py-2 rounded-md">
                      Chats
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="left" className="w-[400px] sm:w-[540px] bg-gray-200 border-none">

                    <SheetHeader className="mb-4">
                      <SheetTitle><h1 className='text-[30px]'>Your Chats</h1></SheetTitle>
                      <SheetDescription>
                        <div>Select a chat to open or create a new one</div>

                        <Button className='ml-6 mt-6 bg-blue-500 hover:bg-blue-700 h-11 w-70 text-white px-4 py-2 rounded-3xl'
                          onClick={() => {
                              window.location.href = '/chats/new';
                              setOpen(false);
                            }}
                        >
                          New Chat
                        </Button>
                      </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1">
                      {loading ? (

                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                            <p className="text-gray-500">Loading chats...</p>
                          </div>
                        </div>

                      ) : error ? (
                        <div className="text-center py-8">
                          <p className="text-red-500 mb-2">{error}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={fetchChats}
                          >
                            Retry
                          </Button>
                        </div>

                      ) : chats.length === 0 ? (

                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            No chats found. Create your first chat!
                          </p>
                        </div>

                      ) : (

                        <ScrollArea className="h-[calc(100vh-230px)] pr-4">
                          <div className="space-y-2">
                            {chats.map((chat) => (
                              <div 
                                key={chat._id} 
                                className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-md transition-colors cursor-pointer group"
                                onClick={() => {
                                  window.location.href = `/chats/${chat._id}`;
                                  setOpen(false);
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{chat.name}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/chats/${chat._id}`;
                                    setOpen(false);
                                  }}
                                >
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                      )}
                    </div>

                  </SheetContent>
                </Sheet>
              </div>
              <div className="flex items-center space-x-4 mr-5">
                <span className="text-gray-700 font-bold">{user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 h-11 text-white px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-bold">{user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 h-11 text-white px-4 py-2 rounded-md mr-5"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {window.location.href = '/auth';}}
              className="bg-blue-500 hover:bg-blue-700 h-11 text-white px-4 py-2 rounded-md mr-5"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}