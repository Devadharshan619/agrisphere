"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Activity, ThermometerSun, Droplets, CloudRain, ShieldCheck, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

const FarmMap = dynamic(() => import("../../components/maps/FarmMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

export default function MonitoringDashboard() {
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/farms", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if(data.success && data.data.length > 0) {
          setFarms(data.data);
          setSelectedFarm(data.data[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  useEffect(() => {
    if (selectedFarm) {
      analyzeFarm(selectedFarm);
    }
  }, [selectedFarm]);

  const analyzeFarm = async (farm: any) => {
    setAnalyzing(true);
    try {
      // Simulate fetching NDVI data points from satellite for this farm
      const dummyNDVI = Array.from({length: 10}, () => Math.random() * 0.4 + 0.4); // 0.4 to 0.8 range
      
      const healthRes = await axios.post("http://localhost:8000/crop-health-analysis", {
        ndvi_values: dummyNDVI
      });

      const yieldRes = await axios.post("http://localhost:8000/predict-yield", {
        crop_type: farm.cropType || "Unknown",
        farm_area: farm.area || 10,
        soil_type: farm.soilType || "Loam",
        rainfall_mm: 600, // mock weather data
        temperature_c: 25 // mock
      });

      setAiData({
        health: healthRes.data,
        yieldPrediction: yieldRes.data
      });
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading monitoring dashboard...</div>;

  if (farms.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
         <h2 className="text-xl font-medium text-gray-800 mb-2">No Farms Found</h2>
         <p className="text-gray-500">Please register a farm first to access satellite monitoring.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Farm Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#386641] flex items-center gap-2">
            <Activity className="text-[#6A994E]" /> AI Crop Monitoring
          </h1>
          <p className="text-gray-500 text-sm mt-1">Satellite-based crop health and predictive yield analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Farm:</label>
          <select 
            className="w-48 p-2 border border-gray-300 rounded-lg outline-none focus:border-[#6A994E] bg-white cursor-pointer"
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Farm Map Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] relative">
            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-700">
               Live NDVI Imagery Overlay (Simulated)
            </div>
            {selectedFarm && <FarmMap farms={[selectedFarm]} />}
        </div>

        {/* AI Analytics Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Actionable Health Alert */}
          <div className={`p-6 rounded-2xl shadow-sm border border-opacity-50 ${aiData?.health?.health_status === 'Healthy' ? 'bg-[#6A994E]/10 border-[#6A994E]' : 'bg-[#BC4749]/10 border-[#BC4749]'}`}>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-gray-900">
              {analyzing ? "Analyzing..." : (
                aiData?.health?.health_status === 'Healthy' 
                ? <><ShieldCheck className="text-[#6A994E]" /> Optimal Health</>
                : <><AlertTriangle className="text-[#BC4749]" /> Attention Needed</>
              )}
            </h3>
            <p className="text-sm text-gray-700">
              {analyzing ? "Fetching satellite multi-spectral bands..." : aiData?.health?.recommendation || "Maintain current schedule"}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-gray-500 mb-2"><ThermometerSun size={18} /> Temp</div>
              <div className="text-2xl font-bold text-gray-800">28°C</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-gray-500 mb-2"><CloudRain size={18} /> Rain</div>
              <div className="text-2xl font-bold text-gray-800">12mm</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-gray-500 mb-2"><Droplets size={18} /> Moisture</div>
              <div className="text-2xl font-bold text-[#6A994E]">45%</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-center bg-gradient-to-br from-[#A7C957]/10 to-transparent">
              <div className="flex items-center gap-2 text-[#386641] font-semibold mb-2">NDVI Index</div>
              <div className="text-2xl font-bold text-gray-800">
                {analyzing ? "..." : (aiData?.health?.average_ndvi || "N/A")}
              </div>
            </div>
          </div>

          {/* Yield Prediction */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-gray-800 font-semibold mb-4">AI Yield Prediction</h3>
             
             {analyzing ? (
               <div className="h-16 flex items-center justify-center animate-pulse text-gray-400">Computing Random Forest Model...</div>
             ) : (
               <>
                 <div className="flex items-end gap-3 mb-2">
                   <span className="text-4xl font-bold text-[#386641]">{aiData?.yieldPrediction?.predicted_yield_tons || 0}</span>
                   <span className="text-gray-500 mb-1">Tons Expected</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4">
                    <div className="bg-[#6A994E] h-2.5 rounded-full" style={{ width: `${(aiData?.yieldPrediction?.confidence || 0) * 100}%` }}></div>
                 </div>
                 <p className="text-xs text-gray-500 mt-2 text-right">Confidence: {(aiData?.yieldPrediction?.confidence * 100).toFixed(1) || 0}%</p>
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
