"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, UserCircle, Menu, Globe, Zap, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (pathname === '/login' || pathname === '/register') return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
         const { data } = await backendApi.get("/users/me");
         if(data.success) {
           setUser(data.data);
         }
      } catch (err: any) {
         if (err.response?.status !== 401) {
            console.error("Navbar sync failure");
         }
      }
    };
    fetchUser();
  }, [pathname]);

  if (pathname === '/login' || pathname === '/register') return null;

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={`h-20 fixed top-0 right-0 z-40 transition-all duration-500 flex items-center justify-between px-8 lg:px-12
      ${scrolled ? "bg-background/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border-b border-border/40" : "bg-transparent"}
      w-full lg:w-[calc(100%-18rem)]`}
    >
      {/* Search Bar - Hidden on mobile */}
      <div className="flex-1 max-w-[400px] hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-black/50 focus:border-primary/20 transition-all outline-none text-[13px] font-bold placeholder-muted-foreground tracking-tight"
            placeholder="Search network assets..."
          />
        </div>
      </div>

      <div className="lg:hidden w-12" />

      {/* Right Actions */}
      <div className="flex items-center gap-4 lg:gap-8">
        
        <div className="flex items-center gap-2">
           <ThemeToggle />
           <button className="relative p-3 text-muted-foreground hover:text-foreground transition-all rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 group">
             <Bell className="h-5 w-5" />
             <span className="absolute top-3 right-3 h-2 w-2 bg-destructive rounded-full border-2 border-background shadow-sm"></span>
           </button>
        </div>

        <div className="h-8 w-px bg-border hidden sm:block opacity-40"></div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 cursor-pointer group pl-2 py-1 pr-1 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-black text-foreground tracking-tighter leading-tight">
              {user ? user.name : "Syncing..."}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
               {user?.role === 'superadmin' && <Shield size={10} className="text-primary" />}
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] leading-none">
                 {user ? user.role : "Citizen"}
               </p>
            </div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-[#1d1d1f] dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xl shadow-black/5 dark:shadow-white/5 transform transition-all group-hover:rotate-3">
            {user?.role === 'superadmin' || user?.role === 'admin' ? <Zap size={20} fill="currentColor" /> : <UserCircle size={24} />}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}