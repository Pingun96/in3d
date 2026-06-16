import React, { useState, useEffect } from 'react';
import { BambuCloudApi } from '../services/BambuCloudApi';
import { Printer, Clock, File, RefreshCw } from 'lucide-react';

interface PrintScreenProps {
  cloudToken: string;
}

export function PrintScreen({ cloudToken }: PrintScreenProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    if (!cloudToken) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const res = await BambuCloudApi.getTasks(cloudToken);
    setTasks(res || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [cloudToken]);

  return (
    <div className="w-full h-full bg-[#1e1e1f] text-white overflow-y-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-normal flex items-center gap-3">
            <Printer className="text-[#a0a0a0]" size={28} />
            Cloud Print History
          </h2>
          <button 
            onClick={fetchTasks}
            className="p-2 bg-[#2a2a2b] hover:bg-[#353535] rounded-lg transition-colors border border-[#3a3a3c]"
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-[#00e676]" : "text-[#a0a0a0]"} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e676]"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-[#2a2a2b] rounded-xl overflow-hidden border border-[#3a3a3c] shadow-lg flex flex-col group hover:border-[#555] transition-colors">
                <div className="h-40 w-full relative bg-black/50">
                  {task.cover ? (
                    <img src={task.cover} alt={task.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <File className="text-[#555]" size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs border border-white/10 flex items-center gap-1">
                     <Clock size={12} />
                     <span>{Math.floor((task.costTime || 0) / 60)} min</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-medium text-[15px] text-[#f0f0f0] line-clamp-2 mb-1">{task.title || 'Unknown Model'}</h3>
                  <div className="text-xs text-[#a0a0a0] mb-3 mt-auto flex justify-between">
                     <span>{new Date(task.startTime).toLocaleDateString()}</span>
                     <span className={task.status === 4 ? "text-[#00e676]" : "text-[#ff9800]"}>
                        {task.status === 4 ? 'Success' : 'Failed'}
                     </span>
                  </div>
                  <button className="w-full bg-[#00e676]/10 hover:bg-[#00e676]/20 text-[#00e676] py-2 rounded-lg text-sm font-medium transition-colors border border-[#00e676]/20">
                    Print Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-[#2a2a2b] rounded-2xl border border-[#3a3a3c]">
            <File className="text-[#555] mb-4" size={48} />
            <p className="text-[#a0a0a0] text-lg">No print history found.</p>
            <p className="text-[#666] text-sm mt-1">Make sure you are logged in to Bambu Cloud.</p>
          </div>
        )}
      </div>
    </div>
  );
}
