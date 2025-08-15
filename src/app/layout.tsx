import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventsPlatform",
  description: "Connect in real life through events in Norway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className="font-sans antialiased"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}