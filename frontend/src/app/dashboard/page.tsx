"use client";

import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";
import { Users, TrendingUp, Map, Landmark, Activity, Bell, Search, Globe, Shield, Zap, ShoppingBag } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

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
  { name: 'Wheat', value: 400, color: '#6A994E' },
  { name: 'Rice', value: 300, color: '#A7C957' },
  { name: 'Corn', value: 300, color: '#386641' },
  { name: 'Soybean', value: 200, color: '#BC4749' },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalFarms: 0,
    marketVolume: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch user info for role
        const userRes = await backendApi.get("/users/me");
        if (userRes.data.success) {
          setUser(userRes.data.data);
        }

        // Fetch stats
        const { data } = await backendApi.get("/analytics/stats");
        if (data.success) {
          setStats(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as any } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-primary">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center"
        >
          <Globe size={32} className="text-primary" />
        </motion.div>
        <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse text-primary/60">Synchronizing Local Node...</p>
      </div>
    );
  }

  const isFarmer = user?.role === 'farmer';
  const isBanker = user?.role === 'banker';
  const isTrader = user?.role === 'trader';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-screen-2xl mx-auto p-4 lg:p-10 space-y-10"
    >
      
      {/* Premium Header - Role Based */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 gap-8"
      >
            <div className="flex items-center gap-6">
              <div className="bg-gray-950 dark:bg-primary/20 p-5 rounded-[2rem] shadow-2xl rotate-3">
                {isFarmer ? <Map className="text-white dark:text-primary" size={32} /> : <Activity className="text-white dark:text-primary" size={32} />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-[2.5rem] font-black text-foreground tracking-tighter leading-none mb-1">
                    {isFarmer ? "Farmer Insight Hub" : isBanker ? "Portfolio Intelligence" : isTrader ? "Market Dynamics" : "Command Center"}
                  </h1>
                   <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    {isFarmer ? "Personal Node" : isBanker ? "Financial Node" : isTrader ? "Commercial Node" : "Global Node"}
                  </div>
                </div>
                 <p className="text-muted-foreground font-bold text-sm flex items-center gap-2">
                  <Shield size={14} className="text-primary" /> 
                  {isFarmer ? "Authorized Agricultural Identity Cluster" : isBanker ? "SBI Agri-Finance Control & Auditing Hub" : isTrader ? "Global Commodities Exchange Protocol" : "Distributed Agricultural Intelligence Network"}
                </p>
              </div>
            </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
          <div className="relative w-full sm:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
             <input type="text" placeholder={isFarmer ? "Search my assets..." : "Global system search..."} className="w-full pl-12 pr-6 py-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold text-foreground shadow-inner" />
          </div>
          <div className="flex items-center gap-4 bg-foreground dark:bg-white text-background dark:text-gray-900 p-1.5 rounded-2xl shadow-xl">
             <div className="p-3 bg-white/10 dark:bg-black/10 rounded-xl cursor-pointer hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
                <Bell size={20} />
             </div>
             <div className="pr-4 py-2 border-l border-white/10 dark:border-black/10 pl-4">
                <p className="text-[10px] font-black text-white/60 dark:text-black/40 uppercase tracking-widest mb-0.5">Core Health</p>
                <p className="text-sm font-black text-emerald-400 dark:text-emerald-600 tracking-tight">PROTECTED</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid - Role Based */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isFarmer ? (
          <>
            <KPICard icon={<Map />} label="My Land Plots" value="3" trend="+1" trendDir="up" />
            <KPICard icon={<TrendingUp />} label="Active Bids" value="12" trend="+3" trendDir="up" />
            <KPICard icon={<Users />} label="Buyer Contacts" value="8" trend="+2" trendDir="up" />
            <KPICard icon={<Landmark />} label="Total Sales Value" value="₹2.4M" trend="+₹450k" trendDir="up" color="emerald"/>
          </>
        ) : isTrader ? (
          <>
            <KPICard icon={<ShoppingBag />} label="Market Positions" value="24" trend="+8" trendDir="up" />
            <KPICard icon={<Activity />} label="Trade Volume" value="1.2k Tons" trend="+12%" trendDir="up" />
            <KPICard icon={<Users />} label="Active Suppliers" value="15" trend="+2" trendDir="up" />
            <KPICard icon={<Landmark />} label="Escrow Balance" value="₹4.8M" trend="+₹1.2M" trendDir="up" color="emerald"/>
          </>
        ) : isBanker ? (
          <>
            <KPICard icon={<Landmark />} label="Active Loans" value="142" trend="+12" trendDir="up" />
            <KPICard icon={<Users />} label="Farmer Clients" value="340" trend="+24" trendDir="up" />
            <KPICard icon={<Shield />} label="Collateral Value" value="₹85M" trend="+₹2.4M" trendDir="up" />
            <KPICard icon={<TrendingUp />} label="Disbursement" value="₹12.1M" trend="+₹1.1M" trendDir="up" color="emerald"/>
          </>
        ) : (
          <>
            <KPICard icon={<Users />} label="Total Farmers" value={stats.totalFarmers.toLocaleString()} trend="+0.2%" trendDir="up" />
            <KPICard icon={<Map />} label="Active Plots" value={stats.totalFarms.toLocaleString()} trend="+0.5%" trendDir="up" />
            <KPICard icon={<TrendingUp />} label="Market Volume" value={`₹${(stats.marketVolume / 1000000).toFixed(1)}M`} trend="+1.2%" trendDir="up" color="green"/>
            <KPICard icon={<Landmark />} label="Bureau Capital" value="₹12.1M" trend="+0.1%" trendDir="up" color="emerald"/>
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Visual Intelligence Area */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden"
          >
             <div className="flex justify-between items-center mb-10">
                 <div>
                     <h3 className="text-2xl font-black text-foreground tracking-tight">
                      {isFarmer ? "My Yield Intelligence" : isBanker ? "Asset Performance" : isTrader ? "Market Liquidity" : "Network Interaction"}
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground mt-1 italic leading-none">
                      {isFarmer ? "Aggregated telemetry from your connected plots" : isBanker ? "Active portfolio Health and Collateral Auditing" : isTrader ? "Real-time demand and supply elasticity" : "Aggregated telemetry data across 4 nodes"}
                    </p>
                 </div>
                <div className="flex bg-muted p-1.5 rounded-2xl border border-border">
                    {['24H', '7D', '30D'].map(t => (
                       <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === '7D' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
                    ))}
                </div>
             </div>
             
             <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={platformStats} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6A994E" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#6A994E" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#BC4749" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#BC4749" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="currentColor" className="opacity-[0.05] dark:opacity-[0.1]" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 'bold'}} className="text-muted-foreground" dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 'bold'}} className="text-muted-foreground" dx={-10} />
                        <Tooltip 
                           contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                           itemStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                        />
                        <Area type="monotone" dataKey="activeUsers" stroke="#6A994E" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="transactions" stroke="#BC4749" strokeWidth={5} fillOpacity={1} fill="url(#colorTx)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </motion.div>

          {/* Right Column: Mini Analytics and Logs */}
          <div className="lg:col-span-1 space-y-10">
              
              <motion.div 
                variants={itemVariants}
                className="bg-gray-950 dark:bg-white/5 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
                  <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mb-10">
                   {isFarmer ? "Market Position Matrix" : isBanker ? "Risk Exposure Matrix" : isTrader ? "Commodity Flow Matrix" : "Global Crop Matrix"}
                 </h3>
                 
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cropDistribution} margin={{ top: 0, right: 30, left: -10, bottom: 0 }} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#fff', opacity: 0.5, fontSize: 10, fontWeight: 'bold'}} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}/>
                            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                               {cropDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase mb-1">Top Performer</p>
                       <p className="text-xl font-black text-[#6A994E]">WHEAT</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                       <Zap className="text-[#A7C957]" size={20} />
                    </div>
                 </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-white/10"
              >
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#BC4749] animate-pulse" /> Security Sentinel
                  </h3>
                  <div className="space-y-6">
                      <LogItem status="success" msg="Global backup cycle completed" time="2m ago" />
                      <LogItem status="warning" msg="Unusual traffic from node_42" time="14m ago" />
                      <LogItem status="info" msg="Farmer_88 added 200kg to market" time="1h ago" />
                  </div>
                  <button className="w-full mt-10 py-4 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-secondary hover:text-foreground transition-all border border-dashed border-border">View Master Protocols</button>
              </motion.div>
          </div>

      </div>
    </motion.div>
  );
}

function KPICard({ icon, label, value, trend, trendDir, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] shadow-xl border border-border/40 dark:border-white/10 group relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className={`absolute -right-6 -top-6 w-32 h-32 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 ${color === 'red' ? 'text-red-500' : 'text-primary'}`}>
         {icon && typeof icon === 'object' ? { ...icon, props: { ...icon.props, size: 120 } } : icon}
      </div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-2xl ${color === 'red' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
           {icon && typeof icon === 'object' ? { ...icon, props: { ...icon.props, size: 24 } } : icon}
        </div>
        <div className={`flex items-center gap-1 font-black text-[10px] px-2.5 py-1 rounded-lg ${trendDir === 'up' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>
           {trendDir === 'up' ? '↗' : '↘'} {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 relative z-10">{label}</p>
        <p className="text-3xl font-black text-foreground tracking-tighter relative z-10 truncate">{value}</p>
      </div>
    </motion.div>
  );
}

function LogItem({ status, msg, time }: any) {
  const statusColors: any = {
    success: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
    warning: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
    info: { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" }
  };
  
  const current = statusColors[status] || { dot: "bg-gray-400", text: "text-muted-foreground" };

  return (
    <div className="flex justify-between items-center group cursor-pointer py-1">
       <div className="flex items-center gap-4">
          <div className={`w-1.5 h-1.5 rounded-full ${current.dot} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
          <p className={`text-xs font-bold transition-colors uppercase tracking-tight ${current.text} group-hover:brightness-75`}>{msg}</p>
       </div>
       <span className="text-[10px] font-black text-muted-foreground group-hover:text-foreground transition-colors">{time}</span>
    </div>
  );
}