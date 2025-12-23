import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'Next.js Frontend',
  description: 'Connected to Express backend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}