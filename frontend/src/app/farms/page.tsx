"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { Plus, MapPin, Sprout, Fullscreen } from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet/window
const FarmMap = dynamic(() => import("../../components/maps/FarmMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

export default function MyFarms() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFarm, setNewFarm] = useState({
     farmName: "", cropType: "", area: 0, soilType: "Loam", lat: 20.5937, lng: 78.9629
  });

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/farms", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if(data.success) {
        setFarms(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleAddFarm = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       await axios.post("http://localhost:5000/api/farms/add", {
         ...newFarm,
         location: { lat: newFarm.lat, lng: newFarm.lng },
         boundaries: [[newFarm.lng, newFarm.lat], [newFarm.lng + 0.01, newFarm.lat], [newFarm.lng + 0.01, newFarm.lat + 0.01], [newFarm.lng, newFarm.lat + 0.01]]
       }, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       setIsAddOpen(false);
       fetchFarms();
     } catch (e) {
       console.error("Failed to add farm", e);
     }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#386641] flex items-center gap-2">
            <MapPin className="text-[#6A994E]" /> My Farms
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your registered agricultural plots</p>
        </div>
        <button 
           onClick={() => setIsAddOpen(true)}
           className="bg-[#6A994E] text-white px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-[#386641] transition-colors shadow-md shadow-[#6A994E]/20"
        >
          <Plus size={20} /> Register New Farm
        </button>
      </div>

      {isAddOpen && (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A7C957]/50 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Register New Farm Plot</h2>
            <form onSubmit={handleAddFarm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><label className="text-sm font-medium text-gray-700">Farm Name</label>
                  <input required value={newFarm.farmName} onChange={(e)=>setNewFarm({...newFarm, farmName: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" placeholder="ex. North Plot A"/></div>
               <div><label className="text-sm font-medium text-gray-700">Crop Type</label>
                  <input required value={newFarm.cropType} onChange={(e)=>setNewFarm({...newFarm, cropType: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" placeholder="ex. Wheat"/></div>
               <div><label className="text-sm font-medium text-gray-700">Area (Hectares)</label>
                  <input type="number" step="0.1" required value={newFarm.area} onChange={(e)=>setNewFarm({...newFarm, area: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
               <div><label className="text-sm font-medium text-gray-700">Soil Type</label>
                  <select value={newFarm.soilType} onChange={(e)=>setNewFarm({...newFarm, soilType: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E] bg-white">
                      <option>Loam</option><option>Clay</option><option>Sandy</option><option>Silt</option>
                  </select></div>
               <div><label className="text-sm font-medium text-gray-700">Center Latitude</label>
                  <input type="number" step="0.0001" required value={newFarm.lat} onChange={(e)=>setNewFarm({...newFarm, lat: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
               <div><label className="text-sm font-medium text-gray-700">Center Longitude</label>
                  <input type="number" step="0.0001" required value={newFarm.lng} onChange={(e)=>setNewFarm({...newFarm, lng: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
               <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={()=>setIsAddOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#6A994E] rounded-lg text-white hover:bg-[#386641]">Save Farm</button>
               </div>
            </form>
         </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading farms...</div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <Sprout size={64} className="text-[#A7C957] mb-4 opacity-50"/>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No farms registered yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Register your agricultural plot to start monitoring crop health, predict yields, and apply for loans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 max-h-[700px] overflow-y-auto pr-2">
             {farms.map((farm) => (
               <div key={farm._id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#A7C957]/30 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Sprout size={80} className="text-[#6A994E]"/></div>
                  <h3 className="text-lg font-bold text-[#386641] mb-1">{farm.farmName}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                     <div>
                       <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Crop</p>
                       <p className="text-[#6A994E] font-medium">{farm.cropType}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Area</p>
                       <p className="text-gray-800 font-medium">{farm.area} Ha</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Soil</p>
                       <p className="text-gray-800 font-medium">{farm.soilType}</p>
                     </div>
                     <div>
                       <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Added</p>
                       <p className="text-gray-800 text-sm">{new Date(farm.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] relative">
             <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-700 flex items-center gap-2">
               <Fullscreen size={16} className="text-[#6A994E]"/> Satellite View Overview
             </div>
             {/* Dynamic Map Component ensures window object isn't accessed during SSR */}
             <FarmMap farms={farms} />
          </div>
        </div>
      )}
    </div>
  );
}
