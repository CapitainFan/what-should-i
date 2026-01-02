'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IoTrashOutline } from "react-icons/io5";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FaRegEdit } from "react-icons/fa";


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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleChatUpdateName = async (chatId: string, newName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch(`/api/chats/changeChatName/${chatId}`, {
        method: 'PUT',
        body: JSON.stringify({ newName })
      });

      if (response.ok) {
        fetchChats();
        setEditingChatId(null);
      } else {
        setError('Failed to update chat');
      }
    } catch (error) {
      console.error('Error updating chat:', error);
      setError('Error updating chat');
    } finally {
      setLoading(false);
    }
  };

  const handleChatDelete = async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch(`/api/chats/${chatId}`, {method: 'DELETE'});

      if (response.ok) {
        fetchChats()
      } else {
        setError('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Error deleting chat');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (chat: Chat) => {
    setEditingChatId(chat._id);
    setNewChatName(chat.name);
  };

  const handleSaveEdit = (chatId: string) => {
    if (newChatName.trim()) {
      handleChatUpdateName(chatId, newChatName.trim());
    } else {
      setEditingChatId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
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

  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingChatId]);

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
                      <SheetTitle><div className='text-[30px]'>Your Chats</div></SheetTitle>
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
                            <div className="text-gray-500">Loading chats...</div>
                          </div>
                        </div>

                      ) : error ? (
                        <div className="text-center py-8">
                          <div className="text-red-500 mb-2">{error}</div>
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
                          <div className="text-gray-500 mb-4">
                            No chats found. Create your first chat!
                          </div>
                        </div>

                      ) : (

                        <ScrollArea className="h-[calc(100vh-230px)] pr-4">
                          <div className="space-y-2">
                            {chats.map((chat) => (
                              <div 
                                key={chat._id}
                                className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-md transition-colors cursor-pointer group"
                              >
                                {editingChatId === chat._id ? (
                                  <div className="flex items-center gap-2 w-full">
                                    <Input
                                      ref={inputRef}
                                      value={newChatName}
                                      onChange={(e) => setNewChatName(e.target.value)}
                                      onKeyDown={(e) => handleKeyDown(e, chat._id)}
                                      onBlur={() => handleSaveEdit(chat._id)}
                                      className="flex-1"
                                      placeholder="Chat name"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      className="font-medium truncate w-70"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/chats/${chat._id}`;
                                        setOpen(false);
                                      }}
                                    >
                                      {chat.name.slice(0, 30) + (chat.name.length > 30 ? '...' : '')}
                                    </Button>

                                    <Button 
                                      variant="outline"
                                      className='bg-blue-500 hover:bg-blue-600 h-9 w-9 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditing(chat);
                                      }}  
                                    >
                                      <FaRegEdit />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="outline"
                                          className='bg-red-500 hover:bg-red-600 h-9 w-9 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <IoTrashOutline />
                                        </Button>
                                      </AlertDialogTrigger>

                                      <AlertDialogContent className='bg-gray-200'>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Точно хотите удалить этот чат?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Это действие необратимо. Оно навсегда удалит это чат!
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Вернуться</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleChatDelete(chat._id)} className='bg-red-500 hover:bg-red-700 text-white'>Удалить</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
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