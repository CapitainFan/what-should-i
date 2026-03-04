import './globals.css';
import { Providers } from './providers/index'
import { Navbar } from '@/widgets/navbar/index';


export const metadata = {
  title: 'What Should I',
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
        <Providers>
          <Navbar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}