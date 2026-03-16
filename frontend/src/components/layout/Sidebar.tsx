"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, ShoppingBag, Gavel, HandCoins, Wallet, BarChart3, Settings, LogOut } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Farms", href: "/farms", icon: Map },
  { name: "Monitoring", href: "/monitoring", icon: BarChart3 },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Auctions", href: "/auctions", icon: Gavel },
  { name: "Loans", href: "/loans", icon: HandCoins },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Hide sidebar on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <aside className="w-64 h-screen bg-[#F2E8CF] border-r border-[#A7C957]/50 fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#386641] flex items-center gap-2">
          🌱 AgriSphere
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#6A994E] text-white shadow-md shadow-[#6A994E]/20"
                  : "text-[#386641] hover:bg-[#A7C957]/20"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-[#6A994E]"} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#A7C957]/50">
        <button 
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}