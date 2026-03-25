"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, AlertTriangle, CheckCircle2, Clock, Plus, Zap } from "lucide-react";
import { backendApi } from "@/services/api";

export default function ActionRoomPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isInitializing, setIsInitializing] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: "", description: "", priorityLevel: "low" });

  const fetchRooms = async () => {
    try {
      const { data } = await backendApi.get("/action-rooms/all");
      if (data.success) {
        setRooms(data.data);
      }
    } catch (err) {
      console.error("Action Room Sync Failure", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleInitialize = async () => {
    try {
      const { data } = await backendApi.post("/action-rooms/create", newRoom);
      if (data.success) {
        setIsInitializing(false);
        fetchRooms();
      }
    } catch (err) {
      console.error("Failed to initialize room", err);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
            Action <span className="text-[#A7C957]">Rooms</span>
          </h2>
          <p className="text-muted-foreground font-bold text-sm mt-2 tracking-widest uppercase">Strategic Collaboration Command Center</p>
        </div>
        <button 
          onClick={() => setIsInitializing(true)}
          className="bg-[#6A994E] hover:bg-[#A7C957] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-[#6A994E]/20 active:scale-95"
        >
          <Plus size={18} />
          Initialize Protocol
        </button>
      </div>

      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl border border-white/20">
               <h3 className="text-2xl font-black text-foreground tracking-tight mb-8">Initialize Strategic Protocol</h3>
               <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Protocol Title</label>
                    <input 
                       value={newRoom.title} 
                       onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                       className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold text-foreground"
                       placeholder="ex. Southern Cluster Stabilization"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Objectives</label>
                    <textarea 
                       value={newRoom.description} 
                       onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                       className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold text-foreground h-32 resize-none"
                       placeholder="Define the strategic mission parameters..."
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Priority Tier</label>
                    <select 
                       value={newRoom.priorityLevel} 
                       onChange={(e) => setNewRoom({ ...newRoom, priorityLevel: e.target.value })}
                       className="w-full p-4 bg-black/5 dark:bg-white/5 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-black text-foreground"
                    >
                       <option value="low">Standard Phase</option>
                       <option value="high">Elevated Authority</option>
                       <option value="critical">IMMEDIATE ACTION</option>
                    </select>
                 </div>
               </div>
               <div className="flex gap-4 mt-10">
                  <button onClick={() => setIsInitializing(false)} className="flex-1 py-4 text-muted-foreground font-black uppercase tracking-widest text-xs hover:text-foreground">Abort</button>
                  <button onClick={handleInitialize} className="flex-1 py-4 bg-[#6A994E] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#6A994E]/20">Commit Protocol</button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#6A994E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full bg-white/5 border border-white/5 rounded-[40px] p-20 text-center">
             <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-gray-600" size={32} />
             </div>
             <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">No Active Strategic Sessions</h3>
             <p className="text-muted-foreground font-bold text-sm max-w-md mx-auto">Access internal protocols to coordinate farm clusters and market stabilization.</p>
          </div>
        ) : (
          rooms.map((room) => (
            <motion.div 
              key={room._id}
              whileHover={{ y: -10 }}
              className="glass-card p-8 rounded-[40px] group cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl shadow-lg transition-colors
                  ${room.priorityLevel === 'critical' ? 'bg-rose-500/20 text-rose-500' : 
                    room.priorityLevel === 'high' ? 'bg-orange-500/20 text-orange-500' : 'bg-[#6A994E]/20 text-[#6A994E]'}
                `}>
                  {room.priorityLevel === 'critical' ? <AlertTriangle size={24} /> : <Zap size={24} />}
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{room.status}</p>
                   <p className="text-[11px] font-black text-foreground mt-1 opacity-60">ID: {room._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-foreground tracking-tight mb-3 group-hover:text-[#A7C957] transition-colors line-clamp-1 uppercase">{room.title}</h3>
              <p className="text-muted-foreground text-xs font-bold leading-relaxed mb-8 line-clamp-2 uppercase">{room.description}</p>

              <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                <div className="flex -space-x-3">
                   {room.participants.slice(0, 3).map((p: string, idx: number) => (
                      <div key={idx} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-[#6A994E]/20">
                         {p.charAt?.(0) || "U"}
                      </div>
                   ))}
                </div>
                <div className="ml-2">
                   <p className="text-[11px] font-black text-foreground leading-none">{room.participants.length} Active</p>
                   <p className="text-[9px] font-black text-muted-foreground uppercase mt-1">Intelligence Nodes</p>
                </div>
                <button className="ml-auto p-3 rounded-xl bg-white/5 hover:bg-[#6A994E] text-white transition-colors group">
                   <Clock size={16} />
                </button>
              </div>

              {/* Status Glow */}
              <div className={`absolute -bottom-1 -right-1 w-20 h-20 rounded-full blur-[40px] opacity-20 pointer-events-none
                 ${room.priorityLevel === 'critical' ? 'bg-rose-500' : 'bg-[#6A994E]'}
              `} />
            </motion.div>
          ))
        )}
      </div>

      {/* Global Metrics Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10">
         {[
           { label: "Active Rooms", value: rooms.length, icon: Users },
           { label: "Critical Priority", value: rooms.filter((r: any) => r.priorityLevel === 'critical').length, icon: AlertTriangle },
           { label: "Decisions Resolved", value: "24", icon: CheckCircle2 },
           { label: "Avg Resolution", value: "2.4h", icon: Clock },
         ].map((stat: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-5">
               <div className="bg-[#6A994E]/10 p-4 rounded-2xl">
                  <stat.icon className="text-[#A7C957]" size={20} />
               </div>
                <div>
                  <p className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
