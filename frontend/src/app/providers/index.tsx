'use client';

import { AuthProvider } from './ui/AuthProvider';
import { ReactToast } from './ui/ToastProvider'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
      <ReactToast/>
    </AuthProvider>
  );
};