"use client";

import { useState } from "react";
import { backendApi } from "@/services/api";
import { ArrowDownRight, X } from "lucide-react";

export default function WithdrawModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (balance: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    if (!bankAccount || !amount || Number(amount) <= 0) {
      setError("Please provide valid account details and amount.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data } = await backendApi.post("/wallet/withdraw", {
        amount: Number(amount),
        bankAccount
      });

      if (data.success) {
        onSuccess(data.balance);
        onClose();
        setBankAccount("");
        setAmount("");
      } else {
        setError(data.message || "Withdrawal failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F2E8CF] dark:bg-[#0a0a0a] w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-[#BC4749] dark:border-white/10">
        <div className="bg-[#BC4749] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ArrowDownRight size={20} /> Withdrawal
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-black/20">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#BC4749] mb-1">Bank Account / UPI ID</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="SBI-XXXXXXXX123"
              className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-[#BC4749] dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#BC4749] focus:outline-none dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#BC4749] mb-1">Amount (INR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-[#BC4749] dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#BC4749] focus:outline-none dark:text-gray-100"
            />
          </div>

          {error && (
             <div className="text-sm text-[#BC4749] bg-[#BC4749]/10 border border-[#BC4749]/20 rounded-md p-3">
               {error}
             </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#BC4749] border border-[#BC4749] rounded-lg hover:bg-black/5 transition-colors">Cancel</button>
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-[#BC4749] rounded-lg shadow hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
