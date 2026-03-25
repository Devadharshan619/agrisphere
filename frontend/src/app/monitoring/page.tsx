"use client";

import { useState, useEffect, useRef } from "react";
import { backendApi, aiApi } from "@/services/api";
import { Activity, ThermometerSun, Droplets, CloudRain, ShieldCheck, AlertTriangle, Radio, Zap, Info, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const FarmMap = dynamic(() => import("../../components/maps/FarmMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100/50 animate-pulse rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-medium">Initializing Satellite Core...</div>
});

export default function MonitoringDashboard() {
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [telemetry, setTelemetry] = useState<string[]>([]);
  const [isMappingMode, setIsMappingMode] = useState(false);
  const [newFarmCoords, setNewFarmCoords] = useState<[number, number][]>([]);
  const telemetryEndRef = useRef<HTMLDivElement>(null);

  const fetchFarms = async () => {
    try {
      const { data } = await backendApi.get("/farms");
      if(data.success && data.data.length > 0) {
        setFarms(data.data);
        if (!selectedFarm) setSelectedFarm(data.data[0]);
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

  useEffect(() => {
    if (selectedFarm && !isMappingMode) {
      analyzeFarm(selectedFarm);
      addTelemetry(`Satellite Lock established on [${selectedFarm.farmName}]`);
    }
  }, [selectedFarm, isMappingMode]);

  useEffect(() => {
    telemetryEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [telemetry]);

  const addTelemetry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTelemetry(prev => [...prev.slice(-15), `[${time}] ${msg}`]);
  };

  const analyzeFarm = async (farm: any) => {
    setAnalyzing(true);
    addTelemetry("Requesting multispectral scan (Sentinel-2)...");
    try {
      const dummyNDVI = Array.from({length: 12}, () => Math.random() * 0.4 + 0.4);
      
      const healthRes = await backendApi.post(`/farms/${farm._id}/analyze`, {
        ndvi_values: dummyNDVI,
        spectral_bands: [0.12, 0.45, 0.33, 0.1]
      });
      addTelemetry("NDVI layer computed successfully.");

      const yieldRes = await aiApi.post("/predict-yield", {
        crop_type: farm.cropType || "Wheat",
        soil_moisture: 42.5,
        temperature: 24.8,
        rainfall: 120.5,
        farm_size_acres: farm.area || 5
      });
      addTelemetry("Predictive model inference completed.");

      setAiData({
        health: healthRes.data,
        yieldPrediction: yieldRes.data
      });

      setFarms(prev => prev.map(f => f._id === farm._id ? { ...f, healthScore: healthRes.data.average_ndvi } : f));
    } catch (e: any) {
      addTelemetry(`ERROR: ${e.response?.data?.message || "AI Service offline"}`);
      console.error("AI Analysis failed", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePolygonCreated = (coords: [number, number][], area: number) => {
    setNewFarmCoords(coords);
    addTelemetry(`New boundary captured: ${coords.length} vertices detected.`);
  };

  const handleSaveFarm = async () => {
    if (newFarmCoords.length === 0) return;
    try {
      setAnalyzing(true);
      const geoJsonBoundaries = [newFarmCoords.map(c => [c[1], c[0]])];
      const res = await backendApi.post("/farms/add", {
        farmName: `Farm Block ${farms.length + 1}`,
        location: { 
          type: "Point", 
          coordinates: [newFarmCoords[0][1], newFarmCoords[0][0]] 
        },
        boundaries: {
          type: "Polygon",
          coordinates: geoJsonBoundaries
        },
        cropType: "Wheat",
        area: 5.2,
        soilType: "Loam"
      });
      if (res.data.success) {
        addTelemetry("Spatial data committed to database.");
        await fetchFarms();
        setIsMappingMode(false);
        setNewFarmCoords([]);
      }
    } catch (e) {
      console.error(e);
      addTelemetry("ERROR: Failed to commit spatial data.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      <p className="text-muted-foreground font-bold tracking-widest text-xs animate-pulse text-center uppercase">Synchronizing Uplink...</p>
    </div>
  );

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-10 space-y-10">
      
      {/* Dynamic Header */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-white/10 gap-8">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl shadow-lg transition-all ${isMappingMode ? 'bg-[#A7C957] rotate-12' : 'bg-[#BC4749]'} shadow-xl`}>
            <Radio className="text-white animate-pulse" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-foreground tracking-tight">AI Live Monitor</h1>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">v4.0 Pro</span>
            </div>
            <p className="text-muted-foreground text-sm font-bold mt-1.5 flex items-center gap-2 italic uppercase tracking-tighter">
              <Activity size={14} className="text-primary" /> Multi-Spectral Satellite Telemetry
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {!isMappingMode ? (
            <>
              {farms.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <select 
                    className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-primary/10 font-black text-foreground transition-all cursor-pointer shadow-inner"
                    value={selectedFarm?._id || ""}
                    onChange={(e) => {
                      const selected = farms.find(f => f._id === e.target.value);
                      setSelectedFarm(selected);
                    }}
                  >
                    {farms.map(farm => (
                      <option key={farm._id} value={farm._id}>{farm.farmName}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 text-muted-foreground">▼</div>
                </div>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsMappingMode(true)} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-2xl">
                <Plus size={20} /> INITIALIZE MAPPING
              </motion.button>
              {farms.length > 0 && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => analyzeFarm(selectedFarm)} disabled={analyzing} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#6A994E] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#386641] disabled:opacity-50 transition-all shadow-2xl shadow-[#6A994E]/20">
                  <Zap size={20} className={analyzing ? "animate-spin" : ""} /> {analyzing ? "SCANNING..." : "SYNC SATELLITE"}
                </motion.button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4">
               <motion.button whileHover={{ scale: 1.02 }} onClick={handleSaveFarm} className="bg-[#6A994E] text-white px-10 py-4 rounded-2xl font-black shadow-xl uppercase tracking-widest text-xs">SAVE BOUNDARY</motion.button>
               <motion.button whileHover={{ scale: 1.02 }} onClick={() => setIsMappingMode(false)} className="bg-white text-rose-500 border border-gray-100 px-10 py-4 rounded-2xl font-black shadow-xl uppercase tracking-widest text-xs">ABORT_MAP</motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {farms.length === 0 && !isMappingMode ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto p-12 bg-white dark:bg-white/5 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10 text-center mt-12">
           <div className="bg-[#F2E8CF] dark:bg-[#A7C957]/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
             <Info className="text-[#6A994E] dark:text-[#A7C957]" size={40} />
           </div>
           <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4 tracking-tighter">Satellite Hub Offline</h2>
           <p className="text-muted-foreground mb-10 text-lg leading-relaxed font-bold">Map your field boundaries to activate military-grade satellite monitoring and AI predictive analytics.</p>
           <button onClick={() => setIsMappingMode(true)} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest text-xs">Initialize Mapping Protocol</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={<ThermometerSun />} label="Temp" value="28.4°C" color="orange" trend="+2.1%" />
              <MetricCard icon={<CloudRain />} label="Rain" value="12mm" color="blue" trend="-0.4%" />
              <MetricCard icon={<Droplets />} label="Soil" value="39%" color="green" trend="Optimum" />
              <MetricCard icon={<Activity />} label="Health" value={aiData?.health?.average_ndvi || "0.62"} color="emerald" trend="Optimal" />
            </div>

            <motion.div className="group relative bg-[#0a0a0a] rounded-[3rem] shadow-2xl border-4 border-white/5 overflow-hidden h-[650px]">
              <div className="absolute top-8 left-8 z-[400] bg-black/60 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-2xl min-w-[280px]">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">Target Acquisition</p>
                <h4 className="text-2xl font-black text-white mb-2">{isMappingMode ? "CALIBRATING FIELD..." : selectedFarm?.farmName || "IDLE"}</h4>
                <div className="flex items-center gap-3 mt-4">
                  <div className={`inline-flex items-center gap-2 ${isMappingMode ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'} text-[10px] font-black px-3 py-1.5 rounded-xl border ${isMappingMode ? 'border-amber-500/20' : 'border-green-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isMappingMode ? 'bg-amber-500' : 'bg-green-500'} animate-ping`} />
                    {isMappingMode ? 'SCANNING TERRAIN' : 'UPLINK ACTIVE'}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 right-8 z-[400] w-80 bg-black/80 backdrop-blur-3xl text-green-400 p-6 rounded-[2rem] shadow-2xl border border-white/5 font-mono text-[10px]">
                 <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Telemetry Log</span>
                   <Activity size={12} className="opacity-40 animate-pulse text-white" />
                 </div>
                 <div className="space-y-2 h-40 overflow-y-auto no-scrollbar scroll-smooth">
                   {telemetry.map((t, idx) => (
                      <div key={idx} className="flex gap-2 leading-relaxed">
                        <span className="text-white/20">|</span>
                        <span className="opacity-80 break-words">{t}</span>
                      </div>
                   ))}
                   <div ref={telemetryEndRef} />
                 </div>
              </div>

               <FarmMap 
                 farms={farms.map(f => (selectedFarm && f._id === selectedFarm._id) ? { ...f, healthScore: aiData?.health?.average_ndvi || 0.6 } : f)} 
                 readOnly={!isMappingMode}
                 onPolygonCreated={handlePolygonCreated}
               />
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <AnimatePresence mode="wait">
              {!isMappingMode && selectedFarm ? (
                <motion.div key={selectedFarm?._id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-10">
                  <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#6A994E]/5 rounded-bl-[4rem] -mr-8 -mt-8" />
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 bg-[#6A994E]/10 rounded-2xl">
                        <ShieldCheck className="text-[#6A994E]" size={32} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest leading-none">Health Scan</h3>
                        <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">AI Classification</p>
                      </div>
                    </div>
                    {analyzing ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-10 bg-gray-50 rounded-2xl w-full" />
                        <div className="h-4 bg-gray-50 rounded-lg w-3/4" />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-4xl font-black text-[#386641] dark:text-[#A7C957] mb-6 tracking-tighter uppercase">{aiData?.health?.health_status || "ANALYZING..."}</h2>
                        <div className="space-y-4">
                          {aiData?.health?.recommendations?.map((r: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                              <Zap size={18} className="text-[#6A994E] shrink-0 mt-0.5" />
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed uppercase">{r}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#6A994E]" />
                    <h3 className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] mb-8">Yield Engine Output</h3>
                    {analyzing ? (
                      <div className="space-y-8 animate-pulse"><div className="h-16 bg-white/5 rounded-3xl" /></div>
                    ) : (
                      <div className="space-y-10">
                        <div>
                          <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-7xl font-black tracking-tighter tabular-nums">{Math.round(aiData?.yieldPrediction?.predicted_yield_kg || 0)}</span>
                            <span className="text-xl font-bold text-[#A7C957]">KG</span>
                          </div>
                          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest italic">~ Total Field Yield Projection</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-3xl border border-white/10 flex justify-between items-center group hover:bg-[#6A994E] transition-colors">
                            <span className="text-[10px] font-black uppercase text-white/50 group-hover:text-white">Est. Value</span>
                            <span className="text-2xl font-black text-[#A7C957] group-hover:text-white">₹ {(Math.round(aiData?.yieldPrediction?.predicted_yield_kg || 0) * 35).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                            <span>Confidence Deck</span>
                            <span>{Math.round((aiData?.yieldPrediction?.prediction_confidence || 0.92) * 100)}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-3 p-1 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(aiData?.yieldPrediction?.prediction_confidence || 0.92) * 100}%` }} className="bg-gradient-to-r from-[#6A994E] to-[#A7C957] h-full rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : isMappingMode ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 p-10 rounded-[3rem] border-2 border-dashed border-white/20 text-center space-y-8 text-white">
                   <div className="bg-[#6A994E] w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                      <Plus className="text-white" size={40} />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Mapping Unit Active</h3>
                   <p className="text-xs font-bold text-white/40 leading-relaxed uppercase tracking-widest">Trace boundaries using the PEN tool. Double click to finalize spatial capture.</p>
                   {newFarmCoords.length > 0 && (
                      <div className="bg-[#A7C957]/10 p-6 rounded-2xl border border-[#A7C957]/20">
                         <p className="text-[10px] font-black text-[#A7C957] uppercase tracking-[0.2em] mb-2">Boundary Captured</p>
                         <p className="text-xs font-bold text-white/60 uppercase">Vertices: {newFarmCoords.length}</p>
                      </div>
                   )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color, trend }: any) {
  const themes: any = {
    green: "from-green-500/10 to-transparent text-green-600 border-green-500/10",
    orange: "from-orange-500/10 to-transparent text-orange-600 border-orange-500/10",
    blue: "from-blue-500/10 to-transparent text-blue-600 border-blue-500/10",
    emerald: "from-emerald-500/10 to-transparent text-emerald-600 border-emerald-500/10"
  };

  return (
    <motion.div whileHover={{ y: -8 }} className={`bg-white dark:bg-white/5 p-6 rounded-[2rem] border bg-gradient-to-br ${themes[color] || ""} shadow-xl transition-all border-border/40 dark:border-white/5`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm text-foreground">
          {icon && typeof icon === 'object' ? { ...icon, props: { ...icon.props, size: 20 } } : icon}
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${trend.includes('+') || trend === 'Optimal' || trend === 'Optimum' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-2xl font-black text-foreground tracking-tighter">{value}</p>
    </motion.div>
  );
}
