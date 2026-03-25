"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, FeatureGroup, LayersControl } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { Pen, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

// Fix missing marker icons
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

interface FarmMapProps {
  farms: any[];
  onPolygonCreated?: (coords: [number, number][], area: number) => void;
  readOnly?: boolean;
}

export default function FarmMap({ farms, onPolygonCreated, readOnly = false }: FarmMapProps) {
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full min-h-[600px] w-full bg-gray-900/5 animate-pulse rounded-[3rem]" />;

  const extractLatLng = (loc: any): [number, number] => {
    if (!loc) return [20.5937, 78.9629];
    if (loc.type === 'Point' && Array.isArray(loc.coordinates)) {
      return [loc.coordinates[1], loc.coordinates[0]];
    }
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      return [loc.lat, loc.lng];
    }
    return [20.5937, 78.9629];
  };

  const extractPolygon = (boundaries: any): [number, number][] => {
    if (!boundaries) return [];
    if (boundaries.type === 'Polygon' && Array.isArray(boundaries.coordinates)) {
      // GeoJSON Polygon is [[[lng, lat], ...]]
      return boundaries.coordinates[0].map((coord: any) => [coord[1], coord[0]]);
    }
    if (Array.isArray(boundaries)) {
      return boundaries.map((coord: any) => [coord[1], coord[0]]);
    }
    return [];
  };

  const center: [number, number] = farms.length > 0 ? extractLatLng(farms[0].location) : [20.5937, 78.9629];

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const latlngs = layer.getLatLngs()[0];
      const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
      
      if (onPolygonCreated) {
        onPolygonCreated(coords, 0); 
      }
    }
  };

  return (
    <div className="h-full w-full min-h-[600px] rounded-[3rem] overflow-hidden z-0 border-4 border-white shadow-2xl relative">
      <MapContainer 
        center={center} 
        zoom={farms.length > 0 ? 14 : 5} 
        style={{ height: "100%", width: "100%", minHeight: "600px" }}
        ref={mapRef}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite (True Color)">
            <TileLayer
              attribution='&copy; ESRI'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="NDVI Analytics (Infrared)">
            <TileLayer
              attribution='&copy; AgriSphere Sentinel'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              opacity={0.8}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <FeatureGroup>
          {!readOnly && (
            <EditControl
              position="topleft"
              onCreated={_onCreated}
              draw={{
                rectangle: false,
                circle: false,
                polyline: false,
                circlemarker: false,
                marker: false,
                polygon: {
                  allowIntersection: false,
                  drawError: { color: "#e1e100", message: "<strong>No intersections allowed<strong>" },
                  shapeOptions: { color: "#A7C957" }
                }
              }}
            />
          )}
          
          {farms.map((farm) => {
            const position = extractLatLng(farm.location);
            const polygonCoords = extractPolygon(farm.boundaries);

            return (
              <div key={farm._id}>
                <Marker position={position} icon={customIcon}>
                  <Popup>
                    <div className="p-2 font-black text-gray-900 uppercase tracking-tighter">
                      {farm.farmName} <br/>
                      <span className="text-[#6A994E] text-[10px]">{farm.cropType}</span>
                    </div>
                  </Popup>
                </Marker>
                {polygonCoords.length > 2 && (
                  <Polygon 
                    positions={polygonCoords} 
                    pathOptions={{ 
                      color: farm.healthScore > 0.7 ? '#A7C957' : farm.healthScore > 0.4 ? '#F4A261' : '#BC4749', 
                      fillColor: farm.healthScore > 0.7 ? '#6A994E' : farm.healthScore > 0.4 ? '#E76F51' : '#6B161B', 
                      fillOpacity: 0.5, 
                      weight: 3,
                      dashArray: '5, 10'
                    }} 
                  >
                    <Popup>
                       <div className="p-4 bg-gray-900 text-white rounded-xl space-y-2">
                          <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Health Index</p>
                          <p className="text-xl font-black">{Math.round((farm.healthScore || 0.85) * 100)}% NDVI</p>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-[#A7C957]" style={{ width: `${(farm.healthScore || 0.85) * 100}%` }} />
                          </div>
                       </div>
                    </Popup>
                  </Polygon>
                )}
              </div>
            );
          })}
        </FeatureGroup>
      </MapContainer>

      {/* Custom Drawing Toolbar */}
      {!readOnly && (
        <div className="absolute bottom-10 left-10 z-[500] flex flex-col gap-3">
           <button 
             onClick={() => {
                const drawControl = document.querySelector('.leaflet-draw-draw-polygon') as HTMLElement;
                if (drawControl) drawControl.click();
             }}
             className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-5 rounded-[2rem] shadow-2xl border border-white/20 hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group"
           >
              <div className="p-2 bg-[#6A994E] rounded-xl text-white group-hover:bg-[#A7C957] transition-colors">
                 <Pen size={20} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest pr-2">Map Terrain</span>
           </button>
           <button 
             onClick={() => {
                const cancelBtn = document.querySelector('.leaflet-draw-actions a[title="Cancel drawing"]') as HTMLElement;
                if (cancelBtn) cancelBtn.click();
             }}
             className="bg-white dark:bg-gray-900 text-rose-500 p-5 rounded-[2rem] shadow-2xl border border-white/20 hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group"
           >
              <div className="p-2 bg-rose-500/10 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                 <X size={20} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest pr-2">Abort Session</span>
           </button>
        </div>
      )}

      <div className="absolute top-8 right-24 z-[400] bg-black/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 text-white shadow-2xl transition-all hover:scale-105">
        <div className="flex -space-x-2">
           {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#A7C957] animate-pulse" style={{ animationDelay: `${i*300}ms` }} />)}
        </div>
        <div>
           <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Data Uplink</p>
           <p className="text-[10px] font-black tracking-widest">SENTINEL-2 LIVE</p>
        </div>
      </div>
    </div>
  );
}
