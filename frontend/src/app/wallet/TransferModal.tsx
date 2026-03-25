"use client";

import { useState } from "react";
import { backendApi } from "@/services/api";
import { Send, X } from "lucide-react";

export default function TransferModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (balance: number) => void;
}) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!email || !amount || Number(amount) <= 0) {
      setError("Please provide valid receiver email and amount.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data } = await backendApi.post("/wallet/transfer", {
        receiverEmail: email,
        amount: Number(amount),
        note
      });

      if (data.success) {
        onSuccess(data.balance);
        onClose();
        setEmail("");
        setAmount("");
        setNote("");
      } else {
        setError(data.message || "Transfer failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during transfer.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F2E8CF] dark:bg-[#0a0a0a] w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-[#A7C957] dark:border-white/10">
        <div className="bg-[#386641] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Send size={20} /> P2P Transfer
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-black/20">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#386641] dark:text-[#A7C957] mb-1">Receiver Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-[#A7C957] dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#386641] focus:outline-none dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#386641] dark:text-[#A7C957] mb-1">Amount (INR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-[#A7C957] dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#386641] focus:outline-none dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#386641] dark:text-[#A7C957] mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Payment for seeds"
              className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-[#A7C957] dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#386641] focus:outline-none dark:text-gray-100"
            />
          </div>

          {error && (
             <div className="text-sm text-[#BC4749] bg-[#BC4749]/10 border border-[#BC4749]/20 rounded-md p-3">
               {error}
             </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#386641] border border-[#386641] rounded-lg hover:bg-black/5 transition-colors">Cancel</button>
            <button
              onClick={handleTransfer}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-[#386641] rounded-lg shadow hover:bg-[#6A994E] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Processing..." : "Send Funds"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
