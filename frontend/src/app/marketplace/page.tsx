"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, ShoppingBag, Plus, Tag, CheckCircle2 } from "lucide-react";

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]); // For the farmer adding a listing
  const [userRole, setUserRole] = useState("farmer");
  
  const [newListing, setNewListing] = useState({
     farmId: "", cropName: "", quantity: 0, qualityGrade: "A", pricePerUnit: 0, harvestDate: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const resMe = await axios.get("http://localhost:5000/api/users/me", {
         headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(resMe.data.data.role);

      const resListings = await axios.get("http://localhost:5000/api/marketplace/listings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(resListings.data.data);

      if(resMe.data.data.role === 'farmer') {
         const resFarms = await axios.get("http://localhost:5000/api/farms", {
           headers: { Authorization: `Bearer ${token}` }
         });
         setFarms(resFarms.data.data);
         if(resFarms.data.data.length > 0) {
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
       await axios.post("http://localhost:5000/api/marketplace/listings", newListing, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       setIsAddOpen(false);
       fetchData();
     } catch (e) {
       console.error("Failed to add listing", e);
     }
  };

  const handleBuy = async (listingId: string, quantityToBuy: number) => {
     try {
        const { data } = await axios.post("http://localhost:5000/api/marketplace/buy", {
            listingId,
            quantityToBuy
        }, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if(data.success) {
            alert(`Purchase successful! Your new balance is ₹${data.remainingBalance}`);
            fetchData();
        }
     } catch(e: any) {
        alert(e.response?.data?.message || "Failed to buy crop");
     }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#386641] flex items-center gap-2">
            <ShoppingBag className="text-[#6A994E]" /> Digital Marketplace
          </h1>
          <p className="text-gray-500 text-sm mt-1">Direct peer-to-peer agricultural commodity trading</p>
        </div>
        
        {userRole === 'farmer' && (
            <button 
               onClick={() => setIsAddOpen(!isAddOpen)}
               className="bg-[#6A994E] text-white px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-[#386641] transition-colors shadow-md shadow-[#6A994E]/20"
            >
              <Plus size={20} /> List Crop for Sale
            </button>
        )}
      </div>

      {/* Add Listing Form */}
      {isAddOpen && (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A7C957]/50 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Crop Listing</h2>
            
            {farms.length === 0 ? (
                <div className="text-center p-4 bg-orange-50 text-orange-600 rounded-lg">
                    You need to register a farm first before listing a crop.
                </div>
            ) : (
                <form onSubmit={handleAddListing} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label className="text-sm font-medium text-gray-700">Select Farm</label>
                    <select required value={newListing.farmId} onChange={(e)=>setNewListing({...newListing, farmId: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E] bg-white">
                        {farms.map(f => (<option key={f._id} value={f._id}>{f.farmName} ({f.cropType})</option>))}
                    </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700">Crop Name</label>
                    <input required value={newListing.cropName} onChange={(e)=>setNewListing({...newListing, cropName: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" placeholder="ex. Premium Wheat"/></div>
                <div><label className="text-sm font-medium text-gray-700">Quantity (Tons)</label>
                    <input type="number" required value={newListing.quantity} onChange={(e)=>setNewListing({...newListing, quantity: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
                <div><label className="text-sm font-medium text-gray-700">Quality Grade</label>
                    <select value={newListing.qualityGrade} onChange={(e)=>setNewListing({...newListing, qualityGrade: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E] bg-white">
                        <option value="A">Grade A (Premium)</option><option value="B">Grade B (Standard)</option><option value="C">Grade C (Processing)</option>
                    </select></div>
                <div><label className="text-sm font-medium text-gray-700">Price per Ton (₹)</label>
                    <input type="number" required value={newListing.pricePerUnit} onChange={(e)=>setNewListing({...newListing, pricePerUnit: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
                <div><label className="text-sm font-medium text-gray-700">Expected Harvest Date</label>
                    <input type="date" value={newListing.harvestDate} onChange={(e)=>setNewListing({...newListing, harvestDate: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" /></div>
                
                <div className="lg:col-span-3 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={()=>setIsAddOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-[#6A994E] rounded-lg text-white hover:bg-[#386641]">Publish Listing</button>
                </div>
                </form>
            )}
         </div>
      )}

      {/* Filter/Search Bar */}
      <div className="flex gap-4">
          <div className="flex-1 relative">
             <Search className="absolute left-3 top-3 text-gray-400" size={20} />
             <input type="text" placeholder="Search crops..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#6A994E] shadow-sm bg-white" />
          </div>
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
             <Filter size={18} /> Filters
          </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading marketplace...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <Tag size={64} className="text-[#A7C957] mb-4 opacity-50"/>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Marketplace is empty</h3>
            <p className="text-gray-500 max-w-sm mb-6">No crops are currently listed for sale. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
                <div key={listing._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{listing.cropName}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><CheckCircle2 size={14} className="text-[#6A994E]"/> Verified Farmer</p>
                            </div>
                            <span className="bg-[#F2E8CF] text-[#386641] text-xs font-bold px-2 py-1 rounded-md border border-[#A7C957]">Grade {listing.qualityGrade}</span>
                        </div>
                        
                        <div className="space-y-3 mt-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Available Quantity</span>
                                <span className="font-semibold text-gray-800">{listing.quantity} Tons</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Price per Ton</span>
                                <span className="font-bold text-[#6A994E]">₹{listing.pricePerUnit.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Listed By</span>
                                <span className="font-medium text-gray-700">{listing.farmerId?.name || "Unknown"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                             Total Value: <span className="font-bold text-gray-800">₹{(listing.quantity * listing.pricePerUnit).toLocaleString('en-IN')}</span>
                        </div>
                        {(userRole === 'trader' || userRole === 'admin') ? (
                            <button 
                                onClick={() => handleBuy(listing._id, listing.quantity)}
                                className="bg-[#386641] hover:bg-[#A7C957] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Buy All
                            </button>
                        ) : (
                            <span className="text-xs text-gray-400 font-medium px-2">Traders Only</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
