import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from '@/components/providers/SessionProvider'
import Navbar from '@/components/navigation/Navbar'

export const metadata: Metadata = {
  title: {
    default: "vibber",
    template: "%s | vibber",
  },
  description: "Discover and create events",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://vibber.no"),
  openGraph: {
    type: "website",
    siteName: "vibber",
    title: "vibber",
    description: "Discover and create events",
  },
  twitter: {
    card: "summary_large_image",
  },
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
