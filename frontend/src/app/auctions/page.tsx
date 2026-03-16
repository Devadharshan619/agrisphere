"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Gavel, Clock, Plus, TrendingUp, AlertCircle } from "lucide-react";

let socket: any;

export default function Auctions() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("farmer");
  const [userId, setUserId] = useState("");
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: number }>({});
  
  // Add Auction State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [newAuction, setNewAuction] = useState({
     farmId: "", cropName: "", quantity: 0, startingBid: 0, startTime: "", endTime: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const resMe = await axios.get("http://localhost:5000/api/users/me", {
         headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(resMe.data.data.role);
      setUserId(resMe.data.data._id);

      const resAuctions = await axios.get("http://localhost:5000/api/auctions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctions(resAuctions.data.data);

      if(resMe.data.data.role === 'farmer') {
         const resFarms = await axios.get("http://localhost:5000/api/farms", {
           headers: { Authorization: `Bearer ${token}` }
         });
         setFarms(resFarms.data.data);
         if(resFarms.data.data.length > 0) {
            setNewAuction(prev => ({...prev, farmId: resFarms.data.data[0]._id}));
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

    // Initialize Socket.io
    socket = io("http://localhost:5000");

    socket.on("newBid", (data: any) => {
        // Update the auction list in real-time
        setAuctions((prevList) => prevList.map(auc => {
            if(auc._id === data.auctionId) {
                return { ...auc, currentHighestBid: data.currentHighestBid };
            }
            return auc;
        }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join rooms for all active auctions
  useEffect(() => {
      if(auctions.length > 0 && socket) {
          auctions.forEach((auc) => {
              if(auc.status === "active") {
                 socket.emit("joinAuction", auc._id);
              }
          });
      }
  }, [auctions]);

  const handleCreateAuction = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       await axios.post("http://localhost:5000/api/auctions", newAuction, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       setIsAddOpen(false);
       fetchData();
     } catch (e) {
       console.error("Failed to create auction", e);
     }
  };

  const handlePlaceBid = async (auctionId: string) => {
      const bidAmount = bidAmounts[auctionId];
      if(!bidAmount) return;

      try {
         await axios.post(`http://localhost:5000/api/auctions/${auctionId}/bid`, { bidAmount }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
         });
         setBidAmounts(prev => ({...prev, [auctionId]: 0})); // Reset
      } catch(e: any) {
         alert(e.response?.data?.message || "Failed to place bid. Check wallet balance or make sure bid is higher.");
      }
  };

  // Helper: check if active
  const isActive = (auction: any) => {
      return new Date(auction.startTime) <= new Date() && new Date(auction.endTime) >= new Date();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#386641] flex items-center gap-2">
            <Gavel className="text-[#6A994E]" /> Live Auctions
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time competitive bidding for premium crops</p>
        </div>
        
        {userRole === 'farmer' && (
            <button 
               onClick={() => setIsAddOpen(!isAddOpen)}
               className="bg-[#6A994E] text-white px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-[#386641] transition-colors shadow-md shadow-[#6A994E]/20"
            >
              <Plus size={20} /> Schedule Auction
            </button>
        )}
      </div>

      {/* Add Auction Form... */}
      {isAddOpen && (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A7C957]/50 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Gavel size={150} /></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 relative z-10">Schedule Live Auction</h2>
            
            {farms.length === 0 ? (
                <div className="text-center p-4 bg-orange-50 text-orange-600 rounded-lg relative z-10">
                    You need to register a farm first before auctioning a crop.
                </div>
            ) : (
                <form onSubmit={handleCreateAuction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                <div><label className="text-sm font-medium text-gray-700">Select Farm</label>
                    <select required value={newAuction.farmId} onChange={(e)=>setNewAuction({...newAuction, farmId: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E] bg-white">
                        {farms.map(f => (<option key={f._id} value={f._id}>{f.farmName} ({f.cropType})</option>))}
                    </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700">Crop Name</label>
                    <input required value={newAuction.cropName} onChange={(e)=>setNewAuction({...newAuction, cropName: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" placeholder="ex. Premium Wheat"/></div>
                <div><label className="text-sm font-medium text-gray-700">Quantity (Tons)</label>
                    <input type="number" required value={newAuction.quantity} onChange={(e)=>setNewAuction({...newAuction, quantity: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
                <div><label className="text-sm font-medium text-gray-700">Starting Bid (₹)</label>
                    <input type="number" required value={newAuction.startingBid} onChange={(e)=>setNewAuction({...newAuction, startingBid: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
                <div><label className="text-sm font-medium text-gray-700">Start Time</label>
                    <input type="datetime-local" required value={newAuction.startTime} onChange={(e)=>setNewAuction({...newAuction, startTime: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
                <div><label className="text-sm font-medium text-gray-700">End Time</label>
                    <input type="datetime-local" required value={newAuction.endTime} onChange={(e)=>setNewAuction({...newAuction, endTime: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
                
                <div className="lg:col-span-3 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={()=>setIsAddOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-[#6A994E] rounded-lg text-white hover:bg-[#386641]">Schedule Auction</button>
                </div>
                </form>
            )}
         </div>
      )}

      {/* Grid of Auctions */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading auctions...</div>
      ) : auctions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <Gavel size={64} className="text-[#A7C957] mb-4 opacity-50"/>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No active auctions</h3>
            <p className="text-gray-500 max-w-sm mb-6">There are currently no live or scheduled auctions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map(auc => {
                const active = isActive(auc);
                const isUpcoming = new Date(auc.startTime) > new Date();

                // Small hack for the UI. Realistically the backend should update status periodically.
                if(new Date(auc.endTime) < new Date()) return null; 

                return (
                 <div key={auc._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all duration-300 ${active ? 'border-[#BC4749]/50 shadow-[0_4px_20px_-4px_rgba(188,71,73,0.15)] ring-1 ring-[#BC4749]/20' : 'border-gray-100'}`}>
                    <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{auc.cropName}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Clock size={14} className={active ? "text-[#BC4749]" : "text-gray-400"}/> 
                                    {active ? "Ends at " : "Starts at "} 
                                    {new Date(active ? auc.endTime : auc.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                            {active ? (
                                <span className="bg-[#BC4749] text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> LIVE</span>
                            ) : (
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">SCHEDULED</span>
                            )}
                        </div>
                        
                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Lot Quantity</span>
                                <span className="font-semibold text-gray-800">{auc.quantity} Tons</span>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                                <div className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">Current Highest Bid</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-bold ${active ? 'text-[#386641]' : 'text-gray-600'}`}>
                                        ₹{auc.currentHighestBid?.toLocaleString('en-IN') || auc.startingBid.toLocaleString('en-IN')}
                                    </span>
                                    {active && <TrendingUp size={18} className="text-[#A7C957]"/>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex gap-2">
                        {(userRole === 'trader' || userRole === 'admin') ? (
                            active ? (
                                <>
                                    <input 
                                        type="number" 
                                        placeholder="Enter amount"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#386641] min-w-0"
                                        value={bidAmounts[auc._id] || ""}
                                        onChange={(e) => setBidAmounts({...bidAmounts, [auc._id]: Number(e.target.value)})}
                                    />
                                    <button 
                                        onClick={() => handlePlaceBid(auc._id)}
                                        className="bg-[#386641] hover:bg-[#A7C957] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        Place Bid
                                    </button>
                                </>
                            ) : (
                                <div className="w-full text-center py-2 text-sm text-gray-500 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center gap-2 font-medium">
                                   <Clock size={16}/> Bidding not started
                                </div>
                            )
                        ) : (
                            <div className="w-full text-center py-2 text-sm text-gray-400 font-medium">Traders only</div>
                        )}
                    </div>
                </div>
                );
            })}
        </div>
      )}
    </div>
  );
}
