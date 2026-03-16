"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/users/login", { email, password });
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        
        // Use window.location instead of router to force a full re-render of layout components
        window.location.href = data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8CF] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-[#A7C957]/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#386641] mb-2">🌱 AgriSphere</h1>
          <p className="text-gray-500">Welcome back! Please login to your account.</p>
        </div>

        {error && (
          <div className="bg-[#BC4749]/10 text-[#BC4749] p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#386641] mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/20 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-[#386641] mb-1">Password</label>
             <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/20 outline-none transition-all"
                placeholder="••••••••"
             />
          </div>

          <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-[#6A994E] hover:bg-[#386641] text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account? <Link href="/register" className="text-[#6A994E] font-medium hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
