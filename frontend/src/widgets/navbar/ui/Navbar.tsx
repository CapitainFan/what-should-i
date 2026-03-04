'use client';

import { useState, useEffect } from 'react';
import { useAuth, useAuthFetch } from '@/features/auth/index';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet';
import { ChatList } from '@/features/chat/index';
import { Chat } from '@/entities/chat/model/types';
import { fetchChats, updateChatName, deleteChat } from '@/features/chat/index';

export function Navbar() {
  const { isAuthenticated, user, logout, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const pathname = usePathname();

  if (!pathname) return null;

  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchChats(authFetch);
      setChats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && isAuthenticated) loadChats();
  }, [open, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleChatSelect = (chatId: string) => {
    window.location.href = `/chats/${chatId}`;
    setOpen(false);
  };

  const handleChatUpdateName = async (chatId: string, newName: string) => {
    try {
      await updateChatName(authFetch, chatId, newName);
      loadChats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chat');
    }
  };

  const handleChatDelete = async (chatId: string) => {
    try {
      await deleteChat(authFetch, chatId);
      loadChats();
      if (pathname.startsWith(`/chats/${chatId}`)) {
        window.location.href = '/chats/new';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
    }
  };

  const handleNewChat = () => {
    window.location.href = '/chats/new';
    setOpen(false);
  };

  const isChatPage = pathname.startsWith('/chats/new') ||
    (pathname.startsWith('/chats/') && pathname !== '/chats' && !pathname.startsWith('/chats/new'));

  if (!isAuthenticated) {
    return (
      <div className="flex justify-end bg-gray-200 w-full h-18">
        <div className="flex items-center">
          <button
            onClick={() => (window.location.href = '/auth')}
            className="bg-blue-500 hover:bg-blue-700 h-11 text-white px-4 py-2 rounded-md mr-5"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end bg-gray-200 w-full h-18">
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
                  <SheetTitle>
                    <div className="text-[30px]">Your Chats</div>
                  </SheetTitle>
                  <SheetDescription>
                    <div>Select a chat to open or create a new one</div>
                    <Button
                      className="ml-6 mt-6 bg-blue-500 hover:bg-blue-700 h-11 w-70 text-white px-4 py-2 rounded-3xl"
                      onClick={handleNewChat}
                    >
                      New Chat
                    </Button>
                  </SheetDescription>
                </SheetHeader>
                <ChatList
                  chats={chats}
                  loading={loading}
                  error={error}
                  onSelectChat={handleChatSelect}
                  onUpdateChatName={handleChatUpdateName}
                  onDeleteChat={handleChatDelete}
                  onRetry={() => {
                    refreshAccessToken();
                    loadChats();
                  }}
                  onNewChat={handleNewChat}
                />
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
    </div>
  );
}