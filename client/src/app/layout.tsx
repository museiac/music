import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Museiac — release your sound",
  description: "A focused workspace for independent artists to grow their music.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
