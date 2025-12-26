import NavBar from '@/components/ui/NavBar';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ReactToast from '@/components/ui/react-toast';

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
          <NavBar/>
          {children}
          <ReactToast/>
        </AuthProvider>
      </body>
    </html>
  );
}