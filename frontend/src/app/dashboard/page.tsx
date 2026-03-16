"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Map, Landmark, Activity, Bell } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const platformStats = [
  { name: 'Mon', activeUsers: 4000, transactions: 2400 },
  { name: 'Tue', activeUsers: 3000, transactions: 1398 },
  { name: 'Wed', activeUsers: 2000, transactions: 9800 },
  { name: 'Thu', activeUsers: 2780, transactions: 3908 },
  { name: 'Fri', activeUsers: 1890, transactions: 4800 },
  { name: 'Sat', activeUsers: 2390, transactions: 3800 },
  { name: 'Sun', activeUsers: 3490, transactions: 4300 },
];

const cropDistribution = [
  { name: 'Wheat', value: 400 },
  { name: 'Rice', value: 300 },
  { name: 'Corn', value: 300 },
  { name: 'Soybean', value: 200 },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading system operations...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#386641] flex items-center gap-2">
            <Activity className="text-[#6A994E]" /> SysAdmin Console
          </h1>
          <p className="text-gray-500 text-sm mt-1">Global oversight of the AgriSphere platform operations</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BC4749] rounded-full"></span>
              <Bell size={20} />
           </button>
           <div className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg shadow-md">
              System Status: <span className="text-green-400">100% Operational</span>
           </div>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-[#6A994E]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={60} /></div>
            <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2"><Users size={16} /> Total Registered Users</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">14,208</div>
            <div className="text-xs font-semibold text-[#6A994E] flex items-center gap-1"><TrendingUp size={12}/> +12% this month</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-[#6A994E]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Map size={60} /></div>
            <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2"><Map size={16} /> Connected Farms</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">8,450</div>
            <div className="text-xs font-semibold text-[#6A994E] flex items-center gap-1"><TrendingUp size={12}/> +5.4% this month</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-[#A7C957]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={60} /></div>
            <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2"><TrendingUp size={16} /> Marketplace Volume</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">₹42.5M</div>
            <div className="text-xs font-semibold text-[#6A994E] flex items-center gap-1"><TrendingUp size={12}/> +18% this month</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-[#BC4749]/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Landmark size={60} /></div>
            <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2"><Landmark size={16} /> Disbursed Loans</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">₹12.1M</div>
            <div className="text-xs font-semibold text-[#BC4749] flex items-center gap-1"><TrendingUp size={12}/> -2% this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Platform Engagement Network</h3>
                <select className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none">
                    <option>Last 7 Days</option>
                    <option>This Month</option>
                    <option>This Year</option>
                </select>
             </div>
             <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={platformStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6A994E" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6A994E" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#BC4749" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#BC4749" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                        <Area type="monotone" dataKey="activeUsers" stroke="#6A994E" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="transactions" stroke="#BC4749" strokeWidth={3} fillOpacity={1} fill="url(#colorTx)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Secondary Chart / Logs */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
             <h3 className="font-bold text-gray-800 mb-6">Registered Crop Distribution</h3>
             <div className="flex-1 min-h-[250px] w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                        <Bar dataKey="value" fill="#A7C957" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
             
             <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Recent Security Logs</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> <span className="text-gray-600">Admin Login (IP: 192.168.1.1)</span></div>
                        <span className="text-gray-400 text-xs">2m ago</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> <span className="text-gray-600">Failed auth attempt (user_id: 81)</span></div>
                        <span className="text-gray-400 text-xs">15m ago</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#6A994E]"></span> <span className="text-gray-600">Sys Backup Completed</span></div>
                        <span className="text-gray-400 text-xs">1h ago</span>
                    </div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}