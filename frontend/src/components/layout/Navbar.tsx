"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
         const token = localStorage.getItem("token");
         if(!token) return;
         
         const { data } = await axios.get("http://localhost:5000/api/users/me", {
           headers: { Authorization: `Bearer ${token}` }
         });
         
         if(data.success) {
           setUser(data.data);
         }
      } catch (err) {
         console.error("Failed to fetch user in navbar");
      }
    };
    fetchUser();
  }, [pathname]);

  // Hide navbar on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 fixed w-full pl-[18rem]">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#6A994E] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-full focus:bg-white focus:border-[#A7C957] focus:ring-2 focus:ring-[#A7C957]/20 transition-all outline-none text-sm font-medium placeholder-gray-400 text-gray-700"
            placeholder="Search farms, crops, auctions..."
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-[#6A994E] transition-colors rounded-full hover:bg-gray-50">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#386641] transition-colors">
              {user ? user.name : "Guest User"}
            </p>
            <p className="text-xs font-medium text-gray-500 capitalize">
              {user ? user.role : "Not Logged In"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#6A994E] to-[#A7C957] text-white flex items-center justify-center shadow-sm">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}