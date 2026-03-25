"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { backendApi } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, UserCircle, ChevronRight, CheckCircle2, Sprout, Send, Shield, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

const ROLES = [
  { id: "farmer", label: "Professional Farmer", icon: Sprout, desc: "Agri-intelligence & farm management" },
  { id: "trader", label: "Agri-Business Trader", icon: Send, desc: "Market liquidity & crop trading" },
  { id: "bank", label: "Financial Institution", icon: Shield, desc: "Capital nodes & rural banking" },
  { id: "admin", label: "System Administrator", icon: UserCircle, desc: "Regional node management" },
  { id: "superadmin", label: "Super Admin", icon: Lock, desc: "Global infrastructure control" }
];

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    telegramNumber: "",
    role: "farmer"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data } = await backendApi.post("/users/register", formData);
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === formData.role) || ROLES[0];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbfbfd] dark:bg-[#000000] transition-colors duration-1000 relative overflow-hidden py-12 px-4">
      
      <div className="absolute top-10 right-10 z-50">
        <div className="apple-glass p-2 rounded-2xl shadow-2xl border-white/20">
          <ThemeToggle />
        </div>
      </div>

      <div className="absolute inset-0 apple-gradient opacity-100" />
      
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[520px] relative z-10"
      >
        <div className="apple-glass rounded-[3rem] p-10 md:p-14 flex flex-col items-center">
          
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-black/5 dark:border-white/5">
               <Sprout size={32} className="text-primary" />
            </div>
            <h1 className="text-[2rem] font-semibold text-[#1d1d1f] dark:text-white tracking-tight leading-tight mb-2">
              Citizen Onboarding
            </h1>
            <p className="text-[#1d1d1f]/60 dark:text-white/60 font-medium text-sm tracking-wide">
              Secure your node in the global agri-grid.
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl mb-8 text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/30 border border-transparent focus:bg-white dark:focus:bg-black/50 dark:text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm shadow-inner"
                    placeholder="John Doe"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 uppercase tracking-widest px-1">Telegram #</label>
                <div className="relative group">
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.telegramNumber}
                    onChange={(e) => setFormData({...formData, telegramNumber: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/30 border border-transparent focus:bg-white dark:focus:bg-black/50 dark:text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm shadow-inner"
                    placeholder="+91 1234567890"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/30 border border-transparent focus:bg-white dark:focus:bg-black/50 dark:text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm shadow-inner"
                  placeholder="nexus@agrisphere.com"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 uppercase tracking-widest px-1">Neural Key (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/30 border border-transparent focus:bg-white dark:focus:bg-black/50 dark:text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            {/* Apple-Grade Custom Dropdown */}
            <motion.div variants={itemVariants} className="space-y-1 relative">
              <label className="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 uppercase tracking-widest px-1">Operational Role</label>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/30 border border-transparent hover:border-primary/30 dark:text-white transition-all font-medium text-sm flex items-center justify-between cursor-pointer group shadow-inner"
              >
                <div className="flex items-center gap-3">
                   <selectedRole.icon size={18} className="text-primary" />
                   <span>{selectedRole.label}</span>
                </div>
                <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-500 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="custom-dropdown-content"
                  >
                    {ROLES.map((role) => (
                      <div 
                        key={role.id}
                        onClick={() => {
                          setFormData({...formData, role: role.id});
                          setDropdownOpen(false);
                        }}
                        className={`dropdown-item ${formData.role === role.id ? 'bg-primary/5 text-primary' : 'text-[#1d1d1f] dark:text-white'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === role.id ? 'bg-primary/10' : 'bg-black/5 dark:bg-white/5'}`}>
                           <role.icon size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold">{role.label}</span>
                           <span className="text-[10px] text-muted-foreground">{role.desc}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button 
               variants={itemVariants}
               whileHover={{ scale: 1.01 }}
               whileTap={{ scale: 0.99 }}
               type="submit" 
               disabled={loading}
               className="w-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-black/5 dark:shadow-white/5 text-sm mt-8 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Verify & Join <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 w-full flex flex-col items-center gap-6">
            <p className="text-xs text-[#1d1d1f]/60 dark:text-white/60 font-medium">
              Already a citizen? <Link href="/login" className="text-blue-500 hover:underline font-bold">Sign in</Link>
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 border border-black/5 dark:border-white/5 px-4 py-2 rounded-full">
               <CheckCircle2 size={12} className="text-primary" /> End-to-End Encryption Verified
            </div>
          </motion.div>
        </div>

        <motion.p variants={itemVariants} className="text-[10px] text-center text-muted-foreground mt-8 font-medium">
           &copy; {new Date().getFullYear()} AgriSphere Planetary Infrastructure. <br/>
           Built for Sustainable Professional Agribusiness.
        </motion.p>
      </motion.div>
    </div>
  );
}
