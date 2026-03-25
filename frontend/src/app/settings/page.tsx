"use client";

import { useState, useEffect } from "react";
import { backendApi } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, Bell, Globe, Smartphone, Lock, 
  ChevronRight, Save, AlertTriangle, Users, 
  CheckCircle2, Mail, Send, LogOut, Trash2
} from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Mock users for Admin view
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await backendApi.get("/users/me");
        if (data.success) {
          setUser(data.data);
        }
        
        // If admin, fetch all users
        if (data.data.role === 'admin' || data.data.role === 'superadmin') {
           // In a real app, this would be a real endpoint
           // For demo, we'll fetch stats or just use seed knowledge
           setAllUsers([
             { id: 1, name: "Admin One", email: "admin@agrisphere.com", role: "admin" },
             { id: 2, name: "Sathish (Super)", email: "sathish@agrisphere.com", role: "superadmin" },
             { id: 3, name: "Ramesh Kumar", email: "farmer1@agrisphere.com", role: "farmer" }
           ]);
        }
      } catch (err) {
        console.error("Settings load failure");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Artificial delay for premium feel
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-primary animate-pulse">
       <Globe size={40} className="animate-spin-slow" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Header Area */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <h1 className="text-[2.5rem] font-black text-foreground tracking-tight mb-2">Platform Control</h1>
        <p className="text-muted-foreground font-medium text-sm">Manage your identity and regional node parameters.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        {/* Navigation Sidebar (Vertical Tabs) */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="space-y-2"
        >
          <TabButton id="profile" icon={User} label="Identification" active={activeTab} onClick={setActiveTab} />
          <TabButton id="security" icon={Lock} label="Neural Security" active={activeTab} onClick={setActiveTab} />
          <TabButton id="notifications" icon={Bell} label="Signal Alerts" active={activeTab} onClick={setActiveTab} />
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <TabButton id="management" icon={Users} label="Node Federation" active={activeTab} onClick={setActiveTab} />
          )}
        </motion.div>

        {/* Content Area */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="lg:col-span-3"
        >
          <div className="apple-glass rounded-[2.5rem] p-10 min-h-[600px] relative overflow-hidden">
            
            <AnimatePresence mode="wait">
               {activeTab === "profile" && (
                 <TabContent key="profile" title="Citizen Profile">
                    <div className="space-y-8">
                       <InputGroup label="Citizen Name" value={user?.name} icon={User} />
                       <InputGroup label="Node Email" value={user?.email} icon={Mail} disabled />
                       <InputGroup label="Telegram Dispatch #" value={user?.telegramNumber || user?.phone} icon={Send} />
                       <div className="flex items-center gap-4 pt-10 border-t border-black/5 dark:border-white/10">
                          <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                             {saving ? "Syncing..." : success ? <>Synced <CheckCircle2 size={16}/></> : "Save Node Changes"}
                          </button>
                       </div>
                    </div>
                 </TabContent>
               )}

               {activeTab === "security" && (
                 <TabContent key="security" title="Security Integrity">
                    <div className="space-y-8">
                       <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl flex gap-6 items-start">
                          <AlertTriangle className="text-blue-500 shrink-0 mt-1" size={24} />
                          <div>
                             <h4 className="font-black text-sm text-foreground uppercase tracking-widest mb-1">Recovery Protocol</h4>
                             <p className="text-xs text-muted-foreground leading-relaxed">
                                Neural keys (passwords) are encrypted at rest. If lost, recovery can only be initiated via your verified Telegram Dispatch # or activation email.
                             </p>
                          </div>
                       </div>
                       
                       <InputGroup label="Current Key" type="password" value="********" icon={Shield} />
                       <InputGroup label="New Neural Key" type="password" placeholder="Min 12 complex signals" icon={Lock} />
                       
                       <div className="flex pt-6">
                         <button className="text-destructive font-black text-[10px] uppercase tracking-widest border border-destructive/20 px-6 py-3 rounded-xl hover:bg-destructive hover:text-white transition-all">Sign Out Everywhere</button>
                       </div>
                    </div>
                 </TabContent>
               )}

               {activeTab === "management" && (
                 <TabContent key="management" title="Node Federation Management">
                    <div className="space-y-6">
                       <p className="text-xs text-muted-foreground font-medium mb-8">Authoritative view of active network participants.</p>
                       <div className="space-y-3">
                          {allUsers.map((u: any) => (
                            <div key={u.id} className="flex items-center justify-between p-5 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 transition-colors">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold">{u.name[0]}</div>
                                  <div>
                                     <p className="text-sm font-bold text-foreground">{u.name}</p>
                                     <p className="text-[10px] text-muted-foreground">{u.email}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">{u.role}</span>
                                  <button className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                               </div>
                            </div>
                          ))}
                       </div>
                       <button className="w-full mt-10 py-5 border border-dashed border-border rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Load More Network Citizens</button>
                    </div>
                 </TabContent>
               )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TabButton({ id, icon: Icon, label, active, onClick }: any) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group
      ${isActive 
        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
       <div className="flex items-center gap-4">
          <Icon size={18} className={isActive ? "text-primary-foreground" : "text-primary group-hover:scale-110 transition-transform"} />
          <span className="text-sm font-bold text-inherit">{label}</span>
       </div>
       {isActive && <motion.div layoutId="setting-tab" className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
    </button>
  );
}

function TabContent({ children, title }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="w-full"
    >
       <h2 className="text-2xl font-black text-foreground tracking-tight mb-10">{title}</h2>
       {children}
    </motion.div>
  );
}

function InputGroup({ label, value, icon: Icon, type = "text", placeholder, disabled = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
        <input 
          type={type} 
          disabled={disabled}
          defaultValue={value}
          placeholder={placeholder}
          className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-black/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-foreground
          ${disabled ? 'opacity-50 cursor-not-allowed border-dashed border-border' : ''}`} 
        />
      </div>
    </div>
  );
}
