"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Landmark, FileText, CheckCircle, XCircle, Clock, Plus, ShieldCheck } from "lucide-react";

export default function LoanManagement() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("farmer");
  
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [newLoan, setNewLoan] = useState({
     farmId: "", amountRequested: 0, purpose: "Seeds and Fertilizer Inputs"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const resMe = await axios.get("http://localhost:5000/api/users/me", {
         headers: { Authorization: `Bearer ${token}` }
      });
      const role = resMe.data.data.role;
      setUserRole(role);

      if (role === 'farmer') {
          const resLoans = await axios.get("http://localhost:5000/api/loans/my-loans", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLoans(resLoans.data.data);

          const resFarms = await axios.get("http://localhost:5000/api/farms", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFarms(resFarms.data.data);
          if(resFarms.data.data.length > 0) {
             setNewLoan(prev => ({...prev, farmId: resFarms.data.data[0]._id}));
          }
      } else {
          const resLoans = await axios.get("http://localhost:5000/api/loans", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLoans(resLoans.data.data);
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
     try {
       // Optional: Fetch AI credit score here before submitting, or backend does it
       const aiRes = await axios.post("http://localhost:8000/credit-score", {
           farm_area: farms.find(f => f._id === newLoan.farmId)?.area || 10,
           historical_yields: [3.5, 4.0, 3.8],
           loan_history_score: 0.8,
           weather_risk_factor: 0.2
       });

       const creditScoreAtApplication = aiRes.data.credit_score || 500;

       await axios.post("http://localhost:5000/api/loans/apply", {
           ...newLoan,
           creditScoreAtApplication
       }, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
       });
       setIsApplyOpen(false);
       fetchData();
     } catch (e) {
       console.error("Failed to apply for loan", e);
     }
  };

  const handleUpdateStatus = async (loanId: string, status: string) => {
      try {
         await axios.put(`http://localhost:5000/api/loans/${loanId}/status`, { status, bankNotes: "Evaluated by AI and Bank Official" }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
         });
         fetchData();
      } catch(e: any) {
         console.error("Failed to update status", e);
      }
  };

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'pending': return <Clock className="text-orange-500" size={18} />;
          case 'approved': return <CheckCircle className="text-[#6A994E]" size={18} />;
          case 'rejected': return <XCircle className="text-[#BC4749]" size={18} />;
          default: return <Clock size={18} />;
      }
  }
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'approved': return 'bg-[#A7C957]/20 text-[#386641] border-[#6A994E]/30';
        case 'rejected': return 'bg-[#BC4749]/10 text-[#BC4749] border-[#BC4749]/30';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
}

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#386641] flex items-center gap-2">
            <Landmark className="text-[#6A994E]" /> Agricultural Credit & Loans
          </h1>
          <p className="text-gray-500 text-sm mt-1">Data-driven financial support for your next harvest season</p>
        </div>
        
        {userRole === 'farmer' && (
            <button 
               onClick={() => setIsApplyOpen(!isApplyOpen)}
               className="bg-[#6A994E] text-white px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-[#386641] transition-colors shadow-md shadow-[#6A994E]/20"
            >
              <FileText size={20} /> Apply for Credit
            </button>
        )}
      </div>

      {/* Apply Form */}
      {isApplyOpen && userRole === 'farmer' && (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#A7C957]/50 mb-6 bg-gradient-to-br from-white to-[#F2E8CF]/30 relative overflow-hidden">
            <ShieldCheck className="absolute -right-8 -top-8 text-[#A7C957]/20" size={200} />
            <div className="relative z-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="text-[#6A994E]" /> New Loan Application
                </h2>
                
                {farms.length === 0 ? (
                    <div className="text-center p-4 bg-orange-50 text-orange-600 rounded-lg">
                        You need to register a farm first to attach your land collateral.
                    </div>
                ) : (
                    <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Collateral Farm Plot</label>
                            <select required value={newLoan.farmId} onChange={(e)=>setNewLoan({...newLoan, farmId: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E] bg-white">
                                {farms.map(f => (<option key={f._id} value={f._id}>{f.farmName}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Requested Amount (₹)</label>
                            <input type="number" required value={newLoan.amountRequested} onChange={(e)=>setNewLoan({...newLoan, amountRequested: Number(e.target.value)})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E]" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Purpose of Loan</label>
                            <textarea required value={newLoan.purpose} onChange={(e)=>setNewLoan({...newLoan, purpose: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md outline-none focus:border-[#6A994E] min-h-[80px]" />
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={()=>setIsApplyOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-[#386641] rounded-lg text-white hover:bg-[#6A994E] shadow-md transition-colors">Submit to Bank</button>
                        </div>
                    </form>
                )}
            </div>
         </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading financial records...</div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <Landmark size={64} className="text-[#A7C957] mb-4 opacity-50"/>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No active loans found</h3>
            <p className="text-gray-500 max-w-sm mb-6">{userRole === 'farmer' ? "Apply for credit to finance your next harvest." : "There are currently no farmer applications to review."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Details</th>
                            {(userRole === 'bank' || userRole === 'admin') && <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>}
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">AI Credit Score</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            {(userRole === 'bank' || userRole === 'admin') && <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loans.map(loan => (
                            <tr key={loan._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-semibold text-gray-800">{loan.purpose || "General Agricultural Use"}</div>
                                    <div className="text-sm text-gray-500 mt-1">Collateral: {loan.farmId?.farmName || "Standard Plot"}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{new Date(loan.createdAt).toLocaleDateString()}</div>
                                </td>
                                {(userRole === 'bank' || userRole === 'admin') && (
                                    <td className="p-4 font-medium text-gray-700">{loan.farmerId?.name || "John Doe"}</td>
                                )}
                                <td className="p-4">
                                    <div className="font-bold text-[#386641] text-lg">₹{loan.amountRequested.toLocaleString('en-IN')}</div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center justify-center p-2 rounded-lg bg-[#F2E8CF] border border-[#A7C957]/50 min-w-[60px]">
                                        <span className="font-bold text-[#386641]">{loan.creditScoreAtApplication || "N/A"}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-max ${getStatusColor(loan.status)}`}>
                                        {getStatusIcon(loan.status)}
                                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                    </span>
                                </td>
                                {(userRole === 'bank' || userRole === 'admin') && (
                                    <td className="p-4 text-right">
                                        {loan.status === 'pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={()=>handleUpdateStatus(loan._id, 'approved')} className="p-1.5 bg-[#6A994E]/10 text-[#6A994E] hover:bg-[#6A994E] hover:text-white rounded transition-colors" title="Approve">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button onClick={()=>handleUpdateStatus(loan._id, 'rejected')} className="p-1.5 bg-[#BC4749]/10 text-[#BC4749] hover:bg-[#BC4749] hover:text-white rounded transition-colors" title="Reject">
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Processed</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}
