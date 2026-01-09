import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KiBei API',
  description: 'Backend API for KiBei Mobile RDC',
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
