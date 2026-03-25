"use client";

import { useState } from "react";
import { backendApi } from "@/services/api";
import { CreditCard, X } from "lucide-react";

export default function DepositModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (balance: number) => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data } = await backendApi.post("/wallet/deposit", {
        amount: Number(amount),
        paymentMethod: "AgriSphere Credits"
      });

      if (data.success) {
        onSuccess(data.balance);
        onClose();
        setAmount("");
      } else {
        setError(data.message || "Failed to process deposit");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during simulated deposit.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F2E8CF] dark:bg-[#0a0a0a] w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-[#A7C957] dark:border-white/10">
        {/* Header */}
        <div className="bg-[#6A994E] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard size={20} /> Deposit Funds
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-[#386641]">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-sm font-medium text-[#386641] dark:text-[#A7C957] mb-2">
            Amount (INR)
          </label>
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">₹</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="w-full pl-8 pr-4 py-3 bg-white dark:bg-white/5 border border-[#A7C957] dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:outline-none dark:text-gray-100"
            />
          </div>

          {error && (
             <div className="text-sm text-[#BC4749] bg-[#BC4749]/10 border border-[#BC4749]/20 rounded-md p-3 mb-4">
               {error}
             </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#386641] bg-transparent border border-[#386641] rounded-lg hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-[#6A994E] rounded-lg shadow hover:bg-[#386641] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Processing..." : "Confirm Deposit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
