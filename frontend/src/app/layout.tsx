"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import PageTransition from "../components/providers/PageTransition";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen transition-colors duration-500 font-poppins">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {isAuthPage ? (
            <main className="min-h-screen w-full">
               <PageTransition>
                 {children}
               </PageTransition>
            </main>
          ) : (
            <div className="flex z-0 relative">
              <Sidebar />
              <div className="flex-1 lg:pl-72 min-h-screen relative overflow-hidden flex flex-col">
                <Navbar />
                <main className="flex-1 w-full pt-16 md:pt-20 max-w-[1800px] mx-auto p-4 md:p-10 lg:p-12">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
