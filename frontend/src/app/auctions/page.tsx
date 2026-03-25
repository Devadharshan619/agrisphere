"use client";

import { useState, useEffect, useRef } from "react";
import { backendApi } from "@/services/api";
import io from "socket.io-client";
import { Gavel, Clock, Trophy, TrendingUp, Plus, Hammer, AlertCircle, Zap, Shield, Radio, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auctions() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [userRole, setUserRole] = useState("farmer");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);

  const [newAuction, setNewAuction] = useState({
     farmId: "", cropName: "", quantity: 0, basePrice: 0, startTime: "", durationMinutes: 60
  });

  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const s = io(socketUrl);
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to Real-Time Floor");
    });

    s.on("newBid", (data: any) => {
       console.log("New Bid Received via Relay:", data);
       setAuctions(prev => prev.map(a => 
          a._id === data.auctionId 
          ? { ...a, currentHighestBid: data.currentHighestBid, highestBidderId: { name: "NEW_BIDDER_RELAY" } } 
          : a
       ));
    });

    return () => { s.disconnect(); };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const resMe = await backendApi.get("/users/me");
      setUserRole(resMe.data.data.role);

      const resAuctions = await backendApi.get("/auctions/all");
      const auctionData = resAuctions.data.data || [];
      setAuctions(auctionData);

      // Join rooms for all active auctions
      if (socket) {
        auctionData.forEach((a: any) => {
           socket.emit("joinAuction", a._id);
        });
      }

      if(resMe.data.data.role === 'farmer') {
         const resFarms = await backendApi.get("/farms");
         setFarms(resFarms.data.data || []);
         if(resFarms.data.data && resFarms.data.data.length > 0) setNewAuction(prev => ({...prev, farmId: resFarms.data.data[0]._id}));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { 
    if (socket) fetchData(); 
  }, [socket]);

  const handleSchedule = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newAuction.farmId) {
        alert("Please register a farm first to start an auction.");
        return;
     }
     try {
       const res = await backendApi.post("/auctions/create", 
          { ...newAuction, startingBid: newAuction.basePrice }
       );
       if (socket && res.data.data) socket.emit("joinAuction", res.data.data._id);
       setIsScheduleOpen(false);
       fetchData();
     } catch (e: any) { 
       alert(e.response?.data?.message || "Failed to create auction. Ensure you have a registered farm.");
       console.error(e); 
     }
  };

  const handlePlaceBid = async (auctionId: string) => {
     const amount = bidAmounts[auctionId];
     if(!amount) return;
     try {
        await backendApi.post(`/auctions/${auctionId}/bid`, 
          { bidAmount: amount }
        );
        setBidAmounts(prev => ({ ...prev, [auctionId]: 0 }));
     } catch (e: any) { alert(e.response?.data?.message || "Internal Node Error"); }
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-10 space-y-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[10rem] -mr-10 -mt-10" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-primary p-5 rounded-[2rem] shadow-2xl shadow-primary/20 text-white animate-pulse">
            <Radio size={32} />
          </div>
          <div>
            <h1 className="text-[2.5rem] font-black text-foreground tracking-tighter uppercase leading-none">Live Auction Floor</h1>
            <p className="text-muted-foreground font-black text-[10px] mt-1.5 flex items-center gap-2 tracking-[0.2em] italic uppercase">
               <Activity size={14} className="text-primary" /> Real-Time Bid Telemetry Active
            </p>
          </div>
        </div>
        {userRole === 'farmer' && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsScheduleOpen(!isScheduleOpen)} className="bg-gray-900 text-white px-8 py-4 flex items-center gap-3 rounded-2xl font-black shadow-2xl shadow-gray-400 dark:shadow-none relative z-10 transition-all hover:bg-black">
              <Plus size={20} /> New Auction Slot
            </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {isScheduleOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10">
             <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3"><Clock className="text-[#6A994E]" /> Open Trading Window</h2>
             <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Source Plot</label>
                   <select required value={newAuction.farmId} onChange={(e)=>setNewAuction({...newAuction, farmId: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none font-black text-gray-800 dark:text-gray-100 focus:ring-4 focus:ring-[#6A994E]/10">
                      {farms.map(f => (<option key={f._id} value={f._id} className="dark:bg-[#0a0a0a]">{f.farmName}</option>))}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Stock ID</label>
                   <input required value={newAuction.cropName} onChange={(e)=>setNewAuction({...newAuction, cropName: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none font-black text-gray-800 dark:text-gray-100 focus:ring-4 focus:ring-[#6A994E]/10" placeholder="ex. PREMIUM_WHEAT_01" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Quantity (Tons)</label>
                   <input type="number" required value={newAuction.quantity} onChange={(e)=>setNewAuction({...newAuction, quantity: Number(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none font-black text-gray-800 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Starting Floor (₹)</label>
                   <input type="number" required value={newAuction.basePrice} onChange={(e)=>setNewAuction({...newAuction, basePrice: Number(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none font-black text-gray-800 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Uplink Time</label>
                   <input type="datetime-local" required value={newAuction.startTime} onChange={(e)=>setNewAuction({...newAuction, startTime: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none font-black text-gray-800 dark:text-gray-100" />
                </div>
                <div className="flex items-center justify-end gap-4 lg:col-span-1 pt-6">
                   <button type="button" onClick={()=>setIsScheduleOpen(false)} className="text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:text-foreground">Discard</button>
                   <button type="submit" className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl text-xs tracking-widest">PUBLISH_NODE</button>
                </div>
             </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-8">
            {loading ? (
                <div className="h-[500px] bg-white rounded-[3rem] animate-pulse border border-gray-100" />
            ) : auctions.length === 0 ? (
                <div className="bg-white dark:bg-white/5 rounded-[3rem] p-32 text-center border-2 border-dashed border-gray-200 dark:border-white/10">
                   < Hammer size={80} className="text-gray-100 dark:text-gray-800 mb-8 mx-auto" />
                   <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">Inertia State</h3>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No active trading signatures detected.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-10">
                   {auctions.map((auction, idx) => (
                      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={auction._id} className="bg-white dark:bg-white/5 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden group hover:border-[#6A994E]/30 transition-all">
                         <div className="flex flex-col xl:flex-row">
                            <div className="p-10 xl:w-2/3 space-y-8">
                               <div className="flex items-center gap-4">
                                  <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px] ${auction.status === 'active' ? 'bg-emerald-500 shadow-emerald-500' : 'bg-amber-500 shadow-amber-500'}`} />
                                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{auction.status === 'active' ? 'Trading Cycle Active' : 'Synchronization Pending'}</span>
                               </div>
                               <div>
                                  <h3 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase mb-2 group-hover:text-[#6A994E] transition-colors">{auction.cropName}</h3>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TRANSACTION_ID: {auction._id.slice(-12).toUpperCase()} • VOL: {auction.quantity} MT</p>
                               </div>
                               <div className="grid grid-cols-2 gap-8">
                                  <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={40} /></div>
                                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">High Bid</p>
                                     <p className="text-3xl font-black text-[#6A994E] dark:text-[#A7C957] tabular-nums">₹{auction.currentHighestBid?.toLocaleString('en-IN')}</p>
                                  </div>
                                  <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10">
                                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Lead Signature</p>
                                     <p className="text-sm font-black text-foreground uppercase truncate tracking-tight">{auction.highestBidderId?.name || "Initializing..."}</p>
                                  </div>
                               </div>
                               <div className="flex gap-4">
                                  {(userRole === 'trader' || userRole === 'admin') && (
                                     <div className="flex-1 flex gap-4">
                                        <input type="number" value={bidAmounts[auction._id] || ""} onChange={(e)=>setBidAmounts({...bidAmounts, [auction._id]: Number(e.target.value)})} className="w-1/2 p-5 bg-gray-900 text-[#A7C957] rounded-2xl outline-none font-black text-lg shadow-inner ring-4 ring-gray-950" placeholder="VALUE_ENTRY" />
                                        <button onClick={()=>handlePlaceBid(auction._id)} className="flex-1 bg-[#6A994E] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#6A994E]/30 hover:bg-[#386641] transition-all hover:scale-[1.02] active:scale-95">Commit Bid</button>
                                     </div>
                                  )}
                               </div>
                            </div>
                            <div className="bg-gray-900 p-10 xl:w-1/3 flex flex-col justify-between text-white relative">
                               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                               <div className="relative z-10">
                                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Expiry Deck</p>
                                  <div className="flex items-center gap-4">
                                     <Clock size={32} className="text-[#A7C957] animate-pulse" />
                                     <span className="text-4xl font-black tracking-tighter tabular-nums">14:55</span>
                                  </div>
                               </div>
                               <div className="relative z-10 pt-10 border-t border-white/5">
                                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Clearing Node</p>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase italic">
                                     <Shield size={14} className="text-primary" />
                                     Secure Asset Locked
                                  </div>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
            )}
         </div>
         <div className="lg:col-span-4 space-y-10">
            <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col items-center text-center group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 transition-transform duration-1000 group-hover:scale-150"><Trophy size={100} /></div>
               <div className="bg-[#F2E8CF] dark:bg-[#A7C957]/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform shadow-xl">
                  <Trophy size={48} className="text-[#6A994E] dark:text-[#A7C957]" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2 uppercase">Market Alpha</h3>
                <p className="text-muted-foreground font-bold text-[10px] px-4 uppercase tracking-widest leading-relaxed">Aggregated high-fidelity yields from Global Tier-1 farms.</p>
               <div className="w-full mt-10 space-y-3">
                  <div className="flex justify-between p-5 bg-gray-50 dark:bg-white/10 rounded-2xl border border-gray-100 dark:border-white/10">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Index</span>
                     <span className="text-xs font-black text-gray-900 dark:text-gray-100 tracking-tighter">AGRI_SENTINEL #12</span>
                  </div>
               </div>
            </div>
            <div className="bg-[#BC4749] p-12 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />
               <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10">Sector Benchmark</h4>
               <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                     <span>T1_WHEAT_MAX</span>
                     <span className="text-[#A7C957] p-2 bg-white/5 rounded-xl">₹34,100</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                     <span>T1_RICE_MAX</span>
                     <span className="text-[#A7C957] p-2 bg-white/5 rounded-xl">₹38,500</span>
                  </div>
               </div>
            </div>
          </div>
       </div>
    </div>
  );
}
