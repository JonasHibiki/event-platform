import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from '@/components/providers/SessionProvider'
import Navbar from '@/components/navigation/Navbar'

export const metadata: Metadata = {
  title: "Arrangementer - Finn og opprett arrangementer",
  description: "En enkel plattform for å oppdage og dele arrangementer i Norge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body 
        className="font-sans antialiased bg-white"
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