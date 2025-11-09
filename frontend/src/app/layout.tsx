import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}