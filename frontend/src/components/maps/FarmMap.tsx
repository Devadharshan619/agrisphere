"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons due to Next.js/Webpack issues with Leaflet
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

export default function FarmMap({ farms }: { farms: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full min-h-[500px] w-full bg-gray-100 animate-pulse rounded-2xl" />;

  const center: [number, number] = farms.length > 0 && farms[0].location
    ? [farms[0].location.lat, farms[0].location.lng]
    : [20.5937, 78.9629]; // Default India Center

  return (
    <div className="h-full w-full min-h-[500px] rounded-2xl overflow-hidden z-0">
      <MapContainer 
        center={center} 
        zoom={farms.length > 0 ? 10 : 4} 
        style={{ height: "100%", width: "100%", minHeight: "500px" }}
      >
        {/* Satellite Map Layer via Google or ESRI (using ESRI World Imagery for agriculture) */}
        <TileLayer
          attribution='&copy; ESRI & contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {/* Farm Markers & Polygons */}
        {farms.map((farm) => {
          if (!farm.location || typeof farm.location.lat !== 'number') return null;
          
          const position: [number, number] = [farm.location.lat, farm.location.lng];
          
          let polygonCoords: [number, number][] = [];
          if (farm.boundaries && farm.boundaries.length > 0) {
            // Convert [lng, lat] from DB to [lat, lng] for Leaflet
            polygonCoords = farm.boundaries.map((coord: number[]) => [coord[1], coord[0]]);
          }

          return (
            <div key={farm._id}>
                <Marker position={position} icon={customIcon}>
                <Popup className="rounded-xl overflow-hidden shadow-xl border-none p-0">
                    <div className="p-1 min-w-[150px]">
                        <h4 className="font-bold text-[#386641] text-lg mb-1">{farm.farmName}</h4>
                        <p className="text-sm text-gray-600 mb-0.5"><span className="font-semibold">Crop:</span> {farm.cropType}</p>
                        <p className="text-sm text-gray-600"><span className="font-semibold">Area:</span> {farm.area} Ha</p>
                    </div>
                </Popup>
                </Marker>

                {polygonCoords.length > 2 && (
                    <Polygon 
                        positions={polygonCoords} 
                        pathOptions={{ color: '#A7C957', fillColor: '#6A994E', fillOpacity: 0.4, weight: 3 }} 
                    />
                )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
