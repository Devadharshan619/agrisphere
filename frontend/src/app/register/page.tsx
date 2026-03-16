"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "farmer"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/users/register", formData);
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        window.location.href = data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8CF] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-[#A7C957]/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#386641] mb-2">🌱 AgriSphere</h1>
          <p className="text-gray-500">Join the digital agriculture ecosystem.</p>
        </div>

        {error && (
          <div className="bg-[#BC4749]/10 text-[#BC4749] p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#386641] mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/20 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#386641] mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/20 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-[#386641] mb-1">Password</label>
             <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/20 outline-none transition-all"
                placeholder="••••••••"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-[#386641] mb-1">Account Role</label>
             <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/20 outline-none transition-all bg-white"
             >
                <option value="farmer">Farmer</option>
                <option value="trader">Trader / Buyer</option>
                <option value="bank">Bank / Financial Institution</option>
             </select>
          </div>

          <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-[#6A994E] hover:bg-[#386641] text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center mt-6"
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-[#6A994E] font-medium hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
