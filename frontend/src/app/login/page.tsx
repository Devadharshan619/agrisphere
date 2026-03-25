"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { backendApi } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ChevronRight, CheckCircle2, Sprout, AlertCircle, X } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotAlert, setShowForgotAlert] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data } = await backendApi.post("/users/login", { email, password });
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbfbfd] dark:bg-[#000000] transition-colors duration-1000 relative overflow-hidden px-4">
      
      <div className="absolute top-10 right-10 z-50">
        <div className="apple-glass p-2 rounded-2xl shadow-2xl border-white/20">
          <ThemeToggle />
        </div>
      </div>

      <div className="absolute inset-0 apple-gradient opacity-100" />
      
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="apple-glass rounded-[3rem] p-10 md:p-14 flex flex-col items-center">
          
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-black/5 dark:border-white/5">
               <Sprout size={32} className="text-primary" />
            </div>
            <h1 className="text-[2.5rem] font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-tight mb-2">
              AgriSphere
            </h1>
            <p className="text-[#1d1d1f]/60 dark:text-white/60 font-semibold text-sm tracking-wide mb-4">
              Intelligence in every harvest.
            </p>
            <p className="text-[#1d1d1f]/50 dark:text-white/40 text-xs leading-relaxed max-w-[300px] mx-auto font-medium">
              A comprehensive agricultural intelligence platform designed to empower farmers, traders, and financial institutions with real-time data and secure tools.
            </p>
          </motion.div>

          <AnimatePresence>
            {showForgotAlert && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-5 rounded-2xl mb-8 relative"
              >
                <div className="flex gap-4">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold leading-relaxed">
                      To reset your Neural Key, please contact our **Telegram Support Bot** (@AgriSphereSupport_Bot) or reply to your node activation email.
                    </p>
                    <button 
                      onClick={() => setShowForgotAlert(false)}
                      className="text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      Understood
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setShowForgotAlert(false)}
                  className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl mb-6 text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 uppercase tracking-widest px-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/30 border border-transparent focus:bg-white dark:focus:bg-black/50 dark:text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm shadow-inner"
                  placeholder="name@example.com"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 uppercase tracking-widest">Password</label>
                 <button 
                  type="button"
                  onClick={() => setShowForgotAlert(true)}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                 >
                  Forgot?
                 </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f]/30 border border-transparent focus:bg-white dark:focus:bg-black/50 dark:text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm shadow-inner"
                  placeholder="••••••••"
                />
              </div>
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
                  Continue <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 w-full flex flex-col items-center gap-6">
            <p className="text-xs text-[#1d1d1f]/60 dark:text-white/60 font-medium">
              New to AgriSphere? <Link href="/register" className="text-blue-500 hover:underline font-bold">Create account</Link>
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/40 border border-black/5 dark:border-white/5 px-4 py-2 rounded-full">
               <CheckCircle2 size={12} className="text-primary" /> Identity Protection Active
            </div>
          </motion.div>
        </div>

        <motion.p variants={itemVariants} className="text-[10px] text-center text-muted-foreground mt-8 font-medium">
           &copy; {new Date().getFullYear()} AgriSphere Systems. <br/>
           Privacy Policy &bull; Terms of Service
        </motion.p>
      </motion.div>
    </div>
  );
}
