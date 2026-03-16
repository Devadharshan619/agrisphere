"use client";

import { useState } from "react";
import axios from "axios";
import useRazorpay from "react-razorpay";
import { CreditCard } from "lucide-react";

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
  
  // Cast useRazorpay to any to bypass the lack of call signature type issues in older versions
  const useRazorpayHooks = useRazorpay as any;
  const [Razorpay] = useRazorpayHooks(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockkey");

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Create order on backend
      const { data } = await axios.post("http://localhost:5000/api/wallet/deposit/order", {
        amount: Number(amount),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockkey",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "AgriSphere Wallet",
        description: "Wallet Deposit",
        order_id: data.order.id, // The order ID from backend
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await axios.post("http://localhost:5000/api/wallet/deposit/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transactionId: data.transactionId,
            });

            if (verifyRes.data.success) {
              onSuccess(verifyRes.data.balance);
              onClose();
              setAmount("");
            } else {
              setError("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setError("Payment verified failed or server error.");
          }
        },
        prefill: {
          name: "John Doe", // Should ideally be fetched from user profile in a real app
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#6A994E", // Our primary theme color
        },
      };

      const razorpayInstance = new Razorpay(options);
      
      razorpayInstance.on("payment.failed", function (response: any) {
          setError(`Payment failed: ${response.error.description}`);
      });
      
      razorpayInstance.open();

    } catch (err) {
      console.error(err);
      setError("An error occurred during deposit initialization.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F2E8CF] w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-[#A7C957]">
        {/* Header */}
        <div className="bg-[#6A994E] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard size={20} /> Deposit Funds
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white pb-2 hover:bg-[#386641] transition-colors rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-sm font-medium text-[#386641] mb-2">
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
              className="w-full pl-8 pr-4 py-3 bg-white border border-[#A7C957] rounded-lg focus:ring-2 focus:ring-[#6A994E] focus:outline-none"
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
              {loading ? "Processing..." : "Pay with Razorpay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
