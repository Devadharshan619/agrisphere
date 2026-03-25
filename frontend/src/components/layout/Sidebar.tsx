"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Map, ShoppingBag, Gavel, HandCoins, 
  Wallet, BarChart3, Settings, LogOut, Info, Shield, Radio, X, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";


const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Farms", href: "/farms", icon: Map },
  { name: "Monitoring", href: "/monitoring", icon: BarChart3 },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Auctions", href: "/auctions", icon: Gavel },
  { name: "Loans", href: "/loans", icon: HandCoins },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Action Room", href: "/action-rooms", icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data } = await backendApi.get("/users/me");
        if (data.success) {
          setUserRole(data.data.role);
        }
      } catch (err) {
        console.error("Sidebar role fetch failed");
      }
    };
    fetchRole();
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const filteredNavItems = navItems.filter(item => {
    if (!userRole) return true; // Show all until role is loaded or if public
    
    if (userRole === 'admin' || userRole === 'superadmin') return true;

    if (userRole === 'banker') {
      return ["Dashboard", "Monitoring", "Loans", "Wallet"].includes(item.name);
    }

    if (userRole === 'trader') {
      return ["Dashboard", "Marketplace", "Auctions", "Wallet"].includes(item.name);
    }

    if (userRole === 'farmer') {
      return ["Dashboard", "My Farms", "Monitoring", "Marketplace", "Auctions", "Loans", "Wallet"].includes(item.name);
    }

    return true;
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border shadow-2xl overflow-y-auto">
      {/* Premium Logo Section */}
      <div className="p-8 pt-10">
        <Link href="/" className="group flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
            <Radio className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tighter">
              Agri<span className="text-accent">Sphere</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mt-1">Smart Agri-Solutions</p>
          </div>
        </Link>
      </div>

      <div className="px-6 py-4 flex-1">
         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4 mb-4">Operations Center</p>
         <nav className="space-y-1.5 font-medium">
            {filteredNavItems.map((item) => {
               const isActive = pathname.startsWith(item.href);
               return (
                  <Link
                     key={item.href}
                     href={item.href}
                     className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 group
                     ${isActive 
                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 translate-x-1" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                     <item.icon size={18} className={`transition-colors duration-300 ${isActive ? "text-primary-foreground" : "text-primary group-hover:text-accent"}`} />
                     <span className="text-[14px]">
                        {item.name}
                     </span>
                     {isActive && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                  </Link>
               );
            })}
         </nav>
      </div>

      <div className="p-6 space-y-4">
         <div className="bg-muted/50 border border-border p-5 rounded-3xl">
            <div className="flex items-center gap-2 mb-1">
               <Shield className="text-accent" size={14} />
               <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Secure Core</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Enterprise-grade security active. All transactions encrypted.</p>
         </div>

         <div className="space-y-1">
            <Link href="/settings" className={`flex items-center gap-4 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors text-[14px] group ${pathname === '/settings' ? 'text-foreground font-bold' : ''}`}>
               <Settings size={18} className="group-hover:rotate-45 transition-transform" />
               Settings
            </Link>
            <button 
               onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
               }}
               className="w-full flex items-center gap-4 px-6 py-4 text-destructive hover:bg-destructive/10 rounded-2xl transition-all font-bold text-[14px] group mt-2"
            >
               <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
               Sign Out
            </button>
         </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen fixed left-0 top-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-card border border-border rounded-2xl shadow-xl text-foreground"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.aside 
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 w-72 h-screen z-[101]"
            >
              <SidebarContent />
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-[-50px] p-2 bg-card border border-border rounded-xl text-foreground lg:hidden"
              >
                <X size={20} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}