"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, RefreshCw, PlusCircle, History } from "lucide-react";
import dynamic from 'next/dynamic';

const DepositModal = dynamic(() => import('./DepositModal'), { ssr: false });

export default function WalletDashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/wallet/info");
      if (data.success) {
        setBalance(data.balance);
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch wallet info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleDepositSuccess = (newBalance: number) => {
    setBalance(newBalance);
    fetchWallet(); // Refresh history
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#386641] flex items-center gap-3">
          <WalletIcon size={32} /> My Wallet
        </h1>
        <button 
          onClick={fetchWallet} 
          className="p-2 text-[#6A994E] hover:bg-[#A7C957]/20 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-[#6A994E] to-[#386641] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <WalletIcon size={150} />
          </div>
          <h2 className="text-white/80 font-medium mb-1">Available Balance</h2>
          <div className="text-4xl font-bold mb-6">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDepositOpen(true)}
              className="flex-1 bg-white text-[#386641] py-2 px-4 rounded-lg font-medium hover:bg-[#F2E8CF] transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> Deposit
            </button>
            <button 
               className="flex-1 bg-[#A7C957]/20 text-white border border-[#A7C957]/50 py-2 px-4 rounded-lg font-medium hover:bg-[#A7C957]/40 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownRight size={18} /> Withdraw
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full bg-[#6A994E]/10 flex items-center justify-center text-[#6A994E] mb-3">
                 <ArrowUpRight size={20} />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Total Received</h3>
              <p className="text-2xl font-semibold text-gray-800">
                 ₹{history.filter(t => t.type === 'deposit' || t.type === 'received').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}
              </p>
           </div>
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full bg-[#BC4749]/10 flex items-center justify-center text-[#BC4749] mb-3">
                 <ArrowDownRight size={20} />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Total Spent</h3>
              <p className="text-2xl font-semibold text-gray-800">
                ₹{history.filter(t => t.type === 'withdrawal' || t.type === 'payment').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}
              </p>
           </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
             <History size={20} className="text-[#6A994E]" /> Recent Transactions
           </h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading transactions...</div>
          ) : history.length === 0 ? (
             <div className="p-8 text-center text-gray-500">No transactions found</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-800">
                      {tx.description || "Wallet Transaction"}
                    </td>
                    <td className="p-4">
                      {tx.type === 'deposit' || tx.type === 'received' ? (
                         <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6A994E] bg-[#6A994E]/10 px-2 py-1 rounded-md">
                           <ArrowUpRight size={12} /> {tx.type}
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1 text-xs font-medium text-[#BC4749] bg-[#BC4749]/10 px-2 py-1 rounded-md">
                           <ArrowDownRight size={12} /> {tx.type}
                         </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-medium">
                      <span className={tx.type === 'deposit' || tx.type === 'received' ? "text-[#6A994E]" : "text-[#BC4749]"}>
                        {tx.type === 'deposit' || tx.type === 'received' ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                       <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                         tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                         tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-red-100 text-red-700'
                       }`}>
                         {tx.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
        onSuccess={handleDepositSuccess}
      />
    </div>
  );
}
