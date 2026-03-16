import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriSphere | AI-Powered Agriculture Platform",
  description: "A full-stack agricultural intelligence SaaS platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F9F9F9] min-h-screen text-gray-900`}>
        <div className="flex z-0 relative">
          <Sidebar />
          <div className="flex-1 min-h-screen relative overflow-hidden flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
