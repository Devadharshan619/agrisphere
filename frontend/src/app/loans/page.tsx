"use client";

import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";
import { Landmark, FileText, CheckCircle, XCircle, Clock, Plus, ShieldCheck, Wallet, ChevronRight, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoanManagement() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("farmer");
  
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [newLoan, setNewLoan] = useState({
     farmId: "", 
     requestedAmount: 0, 
     purpose: "Seeds and Fertilizer Inputs",
     annualIncome: 25000,
     farmSizeAcres: 5,
     previousDefaults: 0,
     avgYieldValue: 18000
  });

  const [aiInsight, setAiInsight] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const resMe = await backendApi.get("/users/me");
      const role = resMe.data.data.role;
      setUserRole(role);

      const resLoans = await backendApi.get("/loans/my-loans");
      setLoans(resLoans.data.data || []);

      if (role === 'farmer') {
          const resFarms = await backendApi.get("/farms");
          setFarms(resFarms.data.data || []);
          if(resFarms.data.data && resFarms.data.data.length > 0) {
             setNewLoan(prev => ({...prev, farmId: resFarms.data.data[0]._id, farmSizeAcres: resFarms.data.data[0].area || 5}));
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

  const handleApply = async (e: React.FormEvent) => {
     e.preventDefault();
     setSubmitting(true);
     try {
       const res = await backendApi.post("/loans/apply", newLoan);
       
       if (res.data.success) {
         setAiInsight(res.data.ai_insights);
         // Keep modal open briefly to show AI insight or just refetch
         setTimeout(() => {
            setIsApplyOpen(false);
            setAiInsight(null);
            fetchData();
         }, 3000);
       }
     } catch (e) {
       console.error("Failed to apply for loan", e);
       alert("AI Service Error: Please ensure the AI Microservice is running.");
     } finally {
       setSubmitting(false);
     }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('approved')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10';
    if (s.includes('reject')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10';
    if (s.includes('pending') || s.includes('review')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10';
    return 'bg-black/5 dark:bg-white/5 text-muted-foreground border-border/40';
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-10 space-y-10">
      
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] shadow-xl border border-white/50 dark:border-white/10 gap-8"
      >
        <div className="flex items-center gap-6">
          <div className="bg-primary p-5 rounded-[2rem] shadow-2xl shadow-primary/20 text-white">
            <Landmark size={32} />
          </div>
          <div>
            <h1 className="text-[2.5rem] font-black text-foreground tracking-tighter uppercase leading-none">Agricultural Capital</h1>
            <p className="text-muted-foreground font-black text-[10px] mt-2 flex items-center gap-2 uppercase tracking-[0.2em] italic">
              <ShieldCheck size={14} className="text-primary" /> AI-Assisted Credit Evaluation Engine
            </p>
          </div>
        </div>
        
        {userRole === 'farmer' && (
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsApplyOpen(!isApplyOpen)}
               className="bg-gray-900 text-white px-8 py-4 flex items-center gap-3 rounded-2xl font-black hover:bg-black transition-all shadow-2xl shadow-gray-300"
            >
              <Plus size={20} /> New Application
            </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {isApplyOpen && userRole === 'farmer' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-white/5 p-10 rounded-[3rem] shadow-2xl border-4 border-[#6A994E]/10 dark:border-white/10 relative group bg-gradient-to-br from-white to-gray-50/50 dark:from-white/5 dark:to-transparent">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#6A994E]/5 rounded-bl-[10rem] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
               
               {aiInsight ? (
                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-10 space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                       <ShieldCheck className="text-emerald-600" size={40} />
                    </div>
                     <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">AI Scoring Successful!</h3>
                     <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-inner">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Credit Score</p>
                           <p className="text-4xl font-black text-primary">{aiInsight.credit_score}</p>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-inner">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Risk Category</p>
                           <p className="text-2xl font-black text-foreground uppercase tracking-tighter">{aiInsight.risk_category}</p>
                        </div>
                     </div>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status: <span className="text-foreground tracking-normal">{aiInsight.loan_eligibility}</span></p>
                 </motion.div>
               ) : (
                 <form onSubmit={handleApply} className="relative z-10 space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                       <FileText className="text-[#6A994E]" size={28} />
                       <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight text-center lg:text-left">Apply for Agricultural Credit</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-2">
                           <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Collateral Farm Plot</label>
                          <select required value={newLoan.farmId} onChange={(e)=>setNewLoan({...newLoan, farmId: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6A994E]/10 font-bold text-gray-800 dark:text-gray-100 shadow-inner">
                             {farms.map(f => (<option key={f._id} value={f._id} className="dark:bg-[#0a0a0a]">{f.farmName}</option>))}
                          </select>
                       </div>
                       <div className="space-y-2">
                           <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Capital Required (₹)</label>
                          <input type="number" required value={newLoan.requestedAmount} onChange={(e)=>setNewLoan({...newLoan, requestedAmount: Number(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6A994E]/10 font-black text-gray-800 dark:text-gray-100 shadow-inner" placeholder="0.00" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Avg Annual Income (₹)</label>
                          <input type="number" required value={newLoan.annualIncome} onChange={(e)=>setNewLoan({...newLoan, annualIncome: Number(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6A994E]/10 font-black text-gray-800 dark:text-gray-100 shadow-inner" />
                       </div>

                       <div className="space-y-2 md:col-span-2">
                           <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Purpose & Usage Plan</label>
                          <input required value={newLoan.purpose} onChange={(e)=>setNewLoan({...newLoan, purpose: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6A994E]/10 font-bold text-gray-800 dark:text-gray-100 shadow-inner" placeholder="e.g. Irrigation expansion for Monsoon 2024" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Prev. Defaults</label>
                          <input type="number" required value={newLoan.previousDefaults} onChange={(e)=>setNewLoan({...newLoan, previousDefaults: Number(e.target.value)})} className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-[#6A994E]/10 font-black text-gray-800 dark:text-gray-100 shadow-inner" />
                       </div>
                    </div>

                    <div className="flex justify-center sm:justify-end gap-4 pt-6">
                        <button type="button" onClick={()=>setIsApplyOpen(false)} className="px-8 py-4 text-muted-foreground font-bold hover:text-foreground transition-colors uppercase tracking-widest text-xs">Discard</button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit" 
                          disabled={submitting}
                          className="px-12 py-4 bg-[#6A994E] text-white rounded-2xl font-black shadow-2xl shadow-[#6A994E]/30 disabled:opacity-50"
                        >
                           {submitting ? "AI UNDERWRITING IN PROGRESS..." : "ANALYZE & SUBMIT"}
                        </motion.button>
                    </div>
                 </form>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Loan History Grid */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3 ml-4">
              <Clock className="text-[#6A994E]" size={20} /> Application History
           </h3>

           {loading ? (
             <div className="grid grid-cols-1 gap-6">
                {[1,2].map(n => (
                  <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />
                ))}
             </div>
           ) : loans.length === 0 ? (
             <div className="bg-white/50 backdrop-blur rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <AlertCircle className="text-gray-300" size={40} />
                </div>
                 <h4 className="text-xl font-bold text-muted-foreground">No active applications</h4>
                 <p className="text-sm text-muted-foreground mt-2">Historical financial records will appear here.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {loans.map((loan, idx) => (
                   <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={loan._id} 
                    className="group bg-white dark:bg-white/5 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all flex flex-col sm:flex-row justify-between items-center gap-6"
                   >
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className={`p-4 rounded-2xl flex items-center justify-center ${getStatusStyle(loan.status)}`}>
                           {loan.status.toLowerCase().includes('approve') ? <CheckCircle size={24} /> : (loan.status.toLowerCase().includes('pending') ? <Clock size={24} /> : <XCircle size={24} />)}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                             <h4 className="font-black text-gray-900 dark:text-gray-100 text-lg tracking-tight">{loan.purpose}</h4>
                             <span className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">ID: ...{loan._id.slice(-4)}</span>
                           </div>
                           <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-0.5">{loan.farmId?.farmName || "Primary Asset"} • {new Date(loan.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                       <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-6 sm:pt-0 sm:pl-10 sm:border-l border-border/40">
                          <div className="text-right">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-1">Capital</p>
                             <p className="text-2xl font-black text-primary tabular-nums">₹{loan.amountRequested?.toLocaleString('en-IN')}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(loan.status)}`}>
                             {loan.status}
                          </div>
                       </div>
                   </motion.div>
                ))}
             </div>
           )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           
           <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#6A994E]/10 rounded-full group-hover:scale-125 transition-transform duration-1000" />
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/10 rounded-2xl">
                   <Landmark className="text-[#A7C957]" size={24} />
                </div>
                <h3 className="text-lg font-black tracking-tight">Financial Health</h3>
              </div>

              <div className="space-y-8">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Credit</span>
                    <span className="text-xl font-black">₹ 0.00</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Global Limit</span>
                    <span className="text-xl font-black text-[#6A994E]">₹ 5,00,000</span>
                 </div>
                 
                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 text-center">AI Market Sentiment</p>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                           <TrendingUp size={16} />
                        </div>
                        <p className="text-xs font-bold leading-relaxed">System predicts a 12% rise in crop value for the upcoming season. Credit score boost active.</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-[#6A994E]/5 border border-[#6A994E]/20 p-8 rounded-[2.5rem] flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-3xl shadow-xl flex items-center justify-center mb-6">
                 <ShieldCheck className="text-[#6A994E] dark:text-[#A7C957]" size={32} />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Verified Collateral</h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Your land plots are verified via satellite markers. High-resolution boundaries improve your loan eligibility by up to 15%.</p>
              <button className="text-[#386641] dark:text-[#A7C957] font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all flex items-center gap-2">
                 Audit Plots <ChevronRight size={14} />
              </button>
           </div>

        </div>

      </div>
    </div>
  );
}
