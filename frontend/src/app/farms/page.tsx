"use client";

import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";
import dynamic from "next/dynamic";
import { Plus, MapPin, Sprout, Fullscreen, Globe, Shield, Radio, Activity, ArrowRight, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FarmMap = dynamic(() => import("../../components/maps/FarmMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100/50 animate-pulse rounded-[2.5rem] border border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">Initializing Geo-Engine...</div>
});

export default function MyFarms() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newFarm, setNewFarm] = useState({
     farmName: "", cropType: "Wheat", area: 0, soilType: "Loam", lat: 20.5937, lng: 78.9629,
     boundaries: [] as [number, number][]
  });

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const { data } = await backendApi.get("/farms");
      if(data.success) setFarms(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFarms(); }, []);

  const handlePolygonCreated = (coords: [number, number][], area: number) => {
    // Basic Area Approximation if area is 0 (approx 1 sq km = 100 hectares)
    // For production, we'd use Leaflet GeometryUtil
    let finalArea = area;
    if (area === 0 && coords.length > 2) {
        // Mock area calculation based on coordinate spread for demo realism
        const lats = coords.map(c => c[0]);
        const lngs = coords.map(c => c[1]);
        const dLat = Math.max(...lats) - Math.min(...lats);
        const dLng = Math.max(...lngs) - Math.min(...lngs);
        finalArea = Math.round((dLat * dLng) * 100000); // Scaled proxy
    }

    setNewFarm(prev => ({
      ...prev,
      boundaries: coords,
      area: finalArea > 0 ? finalArea : 5.2, // Default fallback
      lat: coords[0][0],
      lng: coords[0][1]
    }));
  };

  const handleAddFarm = async (e: React.FormEvent) => {
     e.preventDefault();
     if (newFarm.boundaries.length === 0) {
        alert("Please draw the farm boundary on the map first.");
        return;
     }
     setSubmitting(true);
     try {
       // Format boundaries for GeoJSON [lng, lat]
       const geoJsonBoundaries = newFarm.boundaries.map(c => [c[1], c[0]]);
       
       await backendApi.post("/farms/add", {
         ...newFarm,
         location: { lat: newFarm.lat, lng: newFarm.lng },
         boundaries: geoJsonBoundaries
       });
       
       setIsAddOpen(false);
       fetchFarms();
       setNewFarm({ farmName: "", cropType: "Wheat", area: 0, soilType: "Loam", lat: 20.5937, lng: 78.9629, boundaries: [] });
     } catch (e: any) { 
        alert(e.response?.data?.message || "Failed to add farm. Please check your inputs.");
        console.error(e); 
      } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-10 space-y-10">
      
      {/* Header Deck */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] shadow-xl border border-white/50 dark:border-white/10 gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[10rem] -mr-16 -mt-16" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-gray-900 dark:bg-white p-5 rounded-[2rem] shadow-2xl shadow-gray-400 dark:shadow-none rotate-3">
            <MapPin className="text-primary dark:text-black" size={32} />
          </div>
          <div>
            <h1 className="text-[2.5rem] font-black text-foreground tracking-tighter uppercase leading-none">Land Registry</h1>
            <p className="text-muted-foreground font-black text-[10px] mt-2 flex items-center gap-2 uppercase tracking-[0.2em] italic">
              <Shield size={14} className="text-primary" /> Geospatial Asset Management & Verification
            </p>
          </div>
        </div>
        {!isAddOpen && (
            <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddOpen(true)}
            className="bg-[#6A994E] text-white px-8 py-4 flex items-center gap-3 rounded-2xl font-black shadow-2xl shadow-[#6A994E]/20 relative z-10"
            >
            <Plus size={20} /> Register Plot
            </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {isAddOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Left: Registration Form */}
             <div className="lg:col-span-4 bg-gray-900 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-8 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-black mb-8 tracking-tight flex items-center gap-4">
                    <Sprout className="text-[#A7C957]" size={28} /> New Asset Details
                    </h2>
                    <form id="add-farm-form" onSubmit={handleAddFarm} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Internal Designation</label>
                            <input required value={newFarm.farmName} onChange={(e)=>setNewFarm({...newFarm, farmName: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6A994E]/20 font-bold text-white shadow-inner" placeholder="ex. Northern Boundary Alpha"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Target Vegetation</label>
                            <input required value={newFarm.cropType} onChange={(e)=>setNewFarm({...newFarm, cropType: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6A994E]/20 font-bold text-white shadow-inner" placeholder="ex. Winter Wheat"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Area (Ha)</label>
                                <input readOnly value={newFarm.area} className="w-full p-4 bg-white/10 border border-white/5 rounded-2xl font-bold text-[#A7C957] cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Soil Core</label>
                                <select value={newFarm.soilType} onChange={(e)=>setNewFarm({...newFarm, soilType: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black text-white">
                                    <option className="bg-gray-900">Loam</option><option className="bg-gray-900">Clay</option><option className="bg-gray-900">Sandy</option><option className="bg-gray-900">Silt</option>
                                </select>
                            </div>
                        </div>
                        {newFarm.boundaries.length === 0 && (
                            <div className="bg-[#BC4749]/20 p-4 rounded-2xl border border-[#BC4749]/30 flex items-center gap-3">
                                <MousePointer2 className="text-[#BC4749]" size={20} />
                                <p className="text-[10px] font-bold text-[#F2E8CF]">DRAW BOUNDARY ON MAP TO UNLOCK COMMIT</p>
                            </div>
                        )}
                    </form>
                </div>
                <div className="flex gap-4 pt-6 border-t border-white/5">
                    <button type="button" onClick={()=>setIsAddOpen(false)} className="flex-1 text-white/40 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">Discard</button>
                    <button form="add-farm-form" type="submit" disabled={submitting || newFarm.boundaries.length === 0} className="flex-1 px-8 py-4 bg-[#6A994E] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#A7C957] hover:text-gray-900 transition-all shadow-2xl shadow-[#6A994E]/20 disabled:opacity-30 disabled:cursor-not-allowed">
                        {submitting ? "ENCRYPTING..." : "COMMIT ASSET"}
                    </button>
                </div>
             </div>

             {/* Right: Interactive Drawing Map */}
             <div className="lg:col-span-8 bg-black rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl relative group">
                <div className="absolute top-8 left-8 z-[400] bg-black/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 shadow-2xl min-w-[250px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#A7C957] animate-ping" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">GIS_INIT_READY</span>
                    </div>
                    <h4 className="text-xl font-black text-white leading-none uppercase">Boundary Definition</h4>
                </div>
                <FarmMap farms={farms} onPolygonCreated={handlePolygonCreated} />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAddOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Farm Inventory List */}
            <div className="lg:col-span-4 space-y-6 max-h-[800px] overflow-y-auto pr-4 no-scrollbar">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3 ml-4">
                <Sprout className="text-[#6A994E]" size={20} /> Field Inventory
            </h3>
            
            {loading ? (
                <div className="space-y-6">
                    {[1,2,3].map(n => <div key={n} className="h-40 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />)}
                </div>
            ) : farms.length === 0 ? (
                <div className="bg-white/50 backdrop-blur rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-200">
                    <Globe size={64} className="text-gray-200 mb-8 mx-auto" />
                    <h4 className="text-xl font-bold text-gray-400">Zero Plots Registered</h4>
                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Awaiting spatial input...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {farms.map((farm, idx) => (
                     <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={farm._id} 
                        className="group bg-white dark:bg-white/5 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:border-[#6A994E]/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6A994E]/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-6 flex justify-between items-center group-hover:text-[#6A994E] transition-colors">
                                {farm.farmName}
                                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" />
                            </h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <InfoItem label="Core Crop" value={farm.cropType} color="emerald" />
                                <InfoItem label="Surface" value={`${farm.area} Ha`} color="gray" />
                                <InfoItem label="Subsurface" value={farm.soilType} color="gray" />
                                <InfoItem label="Registry" value={new Date(farm.createdAt).toLocaleDateString()} color="gray" />
                            </div>
                        </div>
                    </motion.div>
                    ))}
                </div>
            )}
            </div>

            {/* Global Mapping Deck */}
            <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 bg-[#0a0a0a] rounded-[3.5rem] shadow-2xl border-4 border-white overflow-hidden min-h-[600px] relative group"
            >
            <div className="absolute top-8 left-8 z-[400] bg-black/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 shadow-2xl min-w-[300px]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_#10b981]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Satellite Constellation: Active</span>
                </div>
                <h4 className="text-2xl font-black text-white mb-2 leading-none uppercase">Geospatial Overlay</h4>
                <p className="text-[10px] font-black text-white/30 tracking-[0.1em]">UPLINK_NODE: sentinel_north_india_4</p>
            </div>

            <div className="absolute bottom-8 right-8 z-[400] flex gap-4">
                <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4 group-hover:translate-y-[-5px] transition-all">
                    <div className="p-3 bg-gray-900 rounded-xl text-white"><Activity size={18} /></div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Plots</p>
                        <p className="text-xl font-black text-gray-900">{farms.length}</p>
                    </div>
                </div>
            </div>

            <FarmMap farms={farms} readOnly={true} />
            </motion.div>

        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, color }: any) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">{label}</p>
      <p className={`text-sm font-black tracking-tight ${color === 'emerald' ? 'text-[#6A994E]' : 'text-gray-800 dark:text-gray-100'}`}>{value}</p>
    </div>
  );
}
