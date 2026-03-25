"use client";

import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";
import { Search, Filter, ShoppingBag, Plus, Tag, CheckCircle2, TrendingUp, Info, Globe, Zap, ArrowRight, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [userRole, setUserRole] = useState("farmer");
  
  const [newListing, setNewListing] = useState({
     farmId: "", cropName: "", quantity: 0, qualityGrade: "A", pricePerUnit: 0, harvestDate: ""
  });

  const [momentum, setMomentum] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resMe = await backendApi.get("/users/me");
      setUserRole(resMe.data.data.role);

      const resListings = await backendApi.get("/marketplace/all");
      setListings(resListings.data.data || []);

      const resMom = await backendApi.get("/analytics/momentum");
      setMomentum(resMom.data.data || []);

      if(resMe.data.data.role === 'farmer') {
         const resFarms = await backendApi.get("/farms");
         setFarms(resFarms.data.data || []);
         if(resFarms.data.data && resFarms.data.data.length > 0) {
            setNewListing(prev => ({...prev, farmId: resFarms.data.data[0]._id}));
         }
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddListing = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       await backendApi.post("/marketplace/create", newListing);
       setIsAddOpen(false);
       fetchData();
     } catch (e) {
       console.error("Failed to add listing", e);
     }
  };

  const handleBuy = async (listingId: string, quantityToBuy: number) => {
     try {
        const { data } = await backendApi.post("/marketplace/buy", {
            listingId,
            quantityToBuy
        });
        if(data.success) {
            alert(`Trade Executed! Balance Updated.`);
            fetchData();
        }
     } catch(e: any) {
        alert(e.response?.data?.message || "Trade Blocked");
     }
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-10 space-y-10">
      
      {/* Visual Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-white/10 gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#6A994E]/5 rounded-bl-full" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-[#A7C957] p-5 rounded-[2rem] shadow-lg shadow-[#A7C957]/20 text-white">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">Global Trade Hub</h1>
            <p className="text-muted-foreground font-bold text-sm mt-1.5 flex items-center gap-2 uppercase tracking-widest italic">
              <Globe size={14} className="text-[#6A994E]" /> Verified Peer-to-Peer Commodity Marketplace
            </p>
          </div>
        </div>
        
        {userRole === 'farmer' && (
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsAddOpen(!isAddOpen)}
               className="bg-gray-900 text-white px-8 py-4 flex items-center gap-3 rounded-2xl font-black hover:bg-black transition-all shadow-2xl shadow-gray-300 relative z-10"
            >
              <Plus size={20} /> Publish Crop
            </motion.button>
        )}
      </motion.div>

      {/* Add Listing Overlay */}
      <AnimatePresence>
        {isAddOpen && (
           <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
           >
              <div className="bg-gray-50 dark:bg-white/5 p-10 rounded-[3rem] border-4 border-white dark:border-white/10 shadow-2xl space-y-8">
                 <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Tag className="text-[#6A994E]" /> New Market Position
                 </h2>
                 
                 {farms.length === 0 ? (
                    <div className="bg-[#BC4749]/10 text-[#BC4749] p-6 rounded-3xl border border-[#BC4749]/20 font-bold text-center">
                        Active farm registration required to list yields.
                    </div>
                 ) : (
                    <form onSubmit={handleAddListing} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Origin Farm</label>
                       <select required value={newListing.farmId} onChange={(e)=>setNewListing({...newListing, farmId: e.target.value})} className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-black text-foreground shadow-sm">
                          {farms.map(f => (<option key={f._id} value={f._id} className="dark:bg-[#0a0a0a]">{f.farmName} ({f.cropType})</option>))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Crop Variety</label>
                       <input required value={newListing.cropName} onChange={(e)=>setNewListing({...newListing, cropName: e.target.value})} className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold text-foreground shadow-sm" placeholder="ex. Sona Masuri Rice"/>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Volume (Tons)</label>
                       <input type="number" required value={newListing.quantity} onChange={(e)=>setNewListing({...newListing, quantity: Number(e.target.value)})} className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-black text-foreground shadow-sm" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Quality Grade</label>
                       <select value={newListing.qualityGrade} onChange={(e)=>setNewListing({...newListing, qualityGrade: e.target.value})} className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-black text-foreground shadow-sm">
                          <option value="A" className="dark:bg-[#0a0a0a]">Grade A (Export Premium)</option>
                          <option value="B" className="dark:bg-[#0a0a0a]">Grade B (Standard Market)</option>
                          <option value="C" className="dark:bg-[#0a0a0a]">Grade C (Industrial)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Rate per Ton (₹)</label>
                       <input type="number" required value={newListing.pricePerUnit} onChange={(e)=>setNewListing({...newListing, pricePerUnit: Number(e.target.value)})} className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-black text-foreground shadow-sm" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Harvest Window</label>
                       <input type="date" value={newListing.harvestDate} onChange={(e)=>setNewListing({...newListing, harvestDate: e.target.value})} className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-black text-foreground shadow-sm" />
                    </div>
                    
                    <div className="lg:col-span-3 flex justify-end gap-4 pt-6">
                        <button type="button" onClick={()=>setIsAddOpen(false)} className="px-8 py-4 text-muted-foreground font-bold hover:text-foreground transition-colors uppercase tracking-widest text-xs">Cancel</button>
                        <button type="submit" className="px-12 py-4 bg-[#6A994E] text-white rounded-2xl font-black shadow-2xl shadow-[#6A994E]/20 hover:bg-[#386641] transition-all">DEPOSIT TO MARKET</button>
                    </div>
                    </form>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-8">
             <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-4">
                <div className="flex-1 relative w-full group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#6A994E] transition-colors" size={20} />
                   <input type="text" placeholder="Search indices..." className="w-full pl-14 pr-8 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#6A994E]/5 font-bold text-gray-800 dark:text-gray-100 shadow-xl shadow-gray-100 dark:shadow-none" />
                </div>
                <button className="px-8 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[1.5rem] flex items-center gap-3 text-gray-900 dark:text-gray-100 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-xl shadow-gray-100 dark:shadow-none">
                   <Filter size={18} /> Filters
                </button>
             </div>

             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1,2,3,4].map(n => <div key={n} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />)}
                </div>
             ) : listings.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                   <TrendingUp size={80} className="text-gray-200 mb-8" />
                   <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Market Liquidity Dry</h3>
                   <p className="text-muted-foreground font-bold mb-8">Direct listings are currently unavailable for this region.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {listings.map((listing, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={listing._id} 
                        className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col group hover:border-[#6A994E]/30 transition-all"
                      >
                         <div className="p-8 pb-4 flex-1">
                            <div className="flex justify-between items-start mb-6">
                               <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${listing.qualityGrade === 'A' ? 'bg-[#F2E8CF] text-[#386641] border-[#A7C957]' : 'bg-muted text-muted-foreground border-border'}`}>
                                  GRADE {listing.qualityGrade}
                               </div>
                               <button className="text-muted-foreground hover:text-[#BC4749] transition-colors"><Plus size={20} /></button>
                            </div>
                            
                            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2 group-hover:text-[#6A994E] transition-colors uppercase">{listing.cropName}</h3>
                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-8 uppercase">
                               <CheckCircle2 size={14} className="text-[#6A994E]"/> ORIGIN: {listing.farmerId?.name?.toUpperCase() || "VERIFIED NODE"}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-50 dark:border-white/5">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Volume</p>
                                  <p className="text-lg font-black text-gray-900 dark:text-gray-100">{listing.quantity} <span className="text-[10px] opacity-40 uppercase">Tons</span></p>
                               </div>
                               <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-50 dark:border-white/5">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Rate</p>
                                  <p className="text-lg font-black text-[#6A994E]">₹{listing.pricePerUnit.toLocaleString('en-IN')}</p>
                               </div>
                            </div>
                         </div>

                         <div className="p-8 pt-4">
                            <div className="flex justify-between items-center bg-gray-900 p-2 pl-6 rounded-2xl">
                               <div className="text-white">
                                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Execution Value</p>
                                  <p className="text-sm font-black tracking-tight">₹{(listing.quantity * listing.pricePerUnit).toLocaleString('en-IN')}</p>
                               </div>
                               {(userRole === 'trader' || userRole === 'admin') ? (
                                  <button 
                                     onClick={() => handleBuy(listing._id, listing.quantity)}
                                     className="bg-[#A7C957] hover:bg-white text-gray-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                  >
                                     EXECUTE
                                  </button>
                               ) : (
                                  <div className="text-[8px] font-black text-gray-600 uppercase px-6">LOCKED</div>
                               )}
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
             )}
          </div>

          {/* Side Intelligence */}
          <div className="lg:col-span-1 space-y-10">
             
             <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 transition-transform duration-1000 group-hover:scale-150 rotate-12">
                   <TrendingUp size={120} />
                </div>
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-10">Market Momentum</h3>
                
                <div className="space-y-8 relative z-10">
                   {momentum.map((item, i) => (
                      <div key={i} className={`flex justify-between items-center ${!item.isUp && i > 2 ? 'opacity-40' : ''}`}>
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px] ${item.isUp ? 'bg-emerald-500 shadow-emerald-500' : 'bg-rose-500 shadow-rose-500'}`} />
                            <span className="text-xs font-black tracking-tight">{item.name} {item.name.includes('FUTURES') ? '' : 'VAL'}</span>
                         </div>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${item.isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                            {item.change}
                         </span>
                      </div>
                   ))}
                </div>

                <div className="mt-12 pt-10 border-t border-white/5">
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Trade Protocol v4.0</p>
                   <button className="flex items-center gap-2 text-[#A7C957] font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                      ANALYZE COMMODITIES <ArrowRight size={14} />
                   </button>
                </div>
             </div>

             <div className="bg-[#6A994E]/5 border border-[#6A994E]/10 p-10 rounded-[3rem] flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-[2rem] shadow-xl flex items-center justify-center mb-8 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                   <Shield className="text-[#6A994E] dark:text-[#A7C957]" size={32} />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-4 tracking-tight">Secure Clearing</h4>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed mb-8">All transactions are backed by AgriSphere Escrow protocols. Payments released only upon supply validation.</p>
                <button className="bg-white dark:bg-white/10 px-8 py-3 rounded-2xl text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/20">View Governance</button>
             </div>

          </div>
       </div>
    </div>
  );
}
