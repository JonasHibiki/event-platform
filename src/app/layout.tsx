import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from '@/components/providers/SessionProvider'
import Navbar from '@/components/navigation/Navbar'

export const metadata: Metadata = {
  title: "vibber - Discover and create events",
  description: "A platform for discovering and sharing events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
