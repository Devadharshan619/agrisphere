"use client";

import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";
import { ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, RefreshCw, PlusCircle, History, Send } from "lucide-react";
import dynamic from 'next/dynamic';

const DepositModal = dynamic(() => import('./DepositModal'), { ssr: false });
const WithdrawModal = dynamic(() => import('./WithdrawModal'), { ssr: false });
const TransferModal = dynamic(() => import('./TransferModal'), { ssr: false });

export default function WalletDashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const { data } = await backendApi.get("/wallet/info");
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
        <h1 className="text-[2.5rem] font-black text-foreground tracking-tighter flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl">
            <WalletIcon size={32} className="text-primary" />
          </div>
          My Wallet
        </h1>
        <button 
          onClick={fetchWallet} 
          className="p-2 text-[#6A994E] dark:text-[#A7C957] hover:bg-[#A7C957]/20 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-[#6A994E] to-[#386641] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
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
              className="flex-1 bg-white text-gray-900 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              <PlusCircle size={18} /> Deposit
            </button>
            <button 
               onClick={() => setIsWithdrawOpen(true)}
               className="flex-1 bg-white/10 text-white border border-white/20 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownRight size={18} /> Withdraw
            </button>
            <button 
               onClick={() => setIsTransferOpen(true)}
               className="flex-1 bg-white/10 text-white border border-white/20 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> Transfer
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-white/10 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ArrowUpRight size={80} /></div>
              <div className="w-12 h-12 rounded-2xl bg-[#6A994E]/10 flex items-center justify-center text-[#6A994E] dark:text-[#A7C957] mb-6 shadow-inner">
                 <ArrowUpRight size={24} />
              </div>
              <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Inflow</h3>
              <p className="text-3xl font-black text-foreground tracking-tighter">
                 ₹{history.filter(t => t.type === 'deposit' || t.type === 'received').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-white/10 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ArrowDownRight size={80} /></div>
              <div className="w-12 h-12 rounded-2xl bg-[#BC4749]/10 flex items-center justify-center text-[#BC4749] mb-6 shadow-inner">
                 <ArrowDownRight size={24} />
              </div>
              <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Outflow</h3>
              <p className="text-3xl font-black text-foreground tracking-tighter">
                ₹{history.filter(t => t.type === 'withdrawal' || t.type === 'payment').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}
              </p>
            </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-black/[0.01] dark:bg-white/[0.01]">
           <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary rounded-full" />
             Transaction Protocol History
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
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-6 font-black">Timeline</th>
                  <th className="p-6 font-black">Designation</th>
                  <th className="p-6 font-black">Classification</th>
                  <th className="p-6 font-black text-right">Value</th>
                  <th className="p-6 font-black text-center">Protocol Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {history.map((tx) => (
                  <tr key={tx._id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="p-6 text-sm text-muted-foreground font-bold">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-sm font-black text-foreground tracking-tight">
                      {tx.description || "Wallet Transaction"}
                    </td>
                    <td className="p-6">
                      {tx.type === 'deposit' || tx.type === 'received' ? (
                         <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#6A994E] dark:text-[#A7C957] bg-[#6A994E]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#6A994E]/10">
                           <ArrowUpRight size={12} /> {tx.type}
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#BC4749] bg-[#BC4749]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#BC4749]/10">
                           <ArrowDownRight size={12} /> {tx.type}
                         </span>
                      )}
                    </td>
                    <td className="p-6 text-right font-black tabular-nums">
                      <span className={tx.type === 'deposit' || tx.type === 'received' ? "text-[#6A994E] dark:text-[#A7C957]" : "text-[#BC4749]"}>
                        {tx.type === 'deposit' || tx.type === 'received' ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                       <span className={`inline-block px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${
                         tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10' :
                         tx.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10' :
                         'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10'
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

      <WithdrawModal 
        isOpen={isWithdrawOpen} 
        onClose={() => setIsWithdrawOpen(false)} 
        onSuccess={handleDepositSuccess}
      />

      <TransferModal 
        isOpen={isTransferOpen} 
        onClose={() => setIsTransferOpen(false)} 
        onSuccess={handleDepositSuccess}
      />
    </div>
  );
}
