import React, { useState, useEffect } from 'react';
import { BambuCloudApi } from '../services/BambuCloudApi';
import { Printer, Clock, File, RefreshCw, PlayCircle, BarChart3, Weight, CheckCircle2, Box } from 'lucide-react';
import { GCodeViewer } from './GCodeViewer';
import { useNotification } from '../context/NotificationContext';

interface PrintScreenProps {
  cloudToken: string;
  onPrintAgain: (task: any) => void;
}

export function PrintScreen({ cloudToken, onPrintAgain }: PrintScreenProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeGCodeUrl, setActiveGCodeUrl] = useState<string | null>(null);
  const { showDialog } = useNotification();

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

  // Tính toán Statistics
  const totalPrints = tasks.length;
  const successPrints = tasks.filter(t => t.status === 4).length;
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.costTime || 0), 0) / 60;
  const totalWeight = tasks.reduce((acc, t) => acc + (t.weight || 0), 0);

  return (
    <div className="w-full h-full bg-[#1e1e1f] text-white overflow-y-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Statistics Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#2a2a2b] border border-[#3a3a3c] rounded-xl p-4 flex flex-col justify-center shadow-lg">
             <div className="flex items-center gap-2 text-[#a0a0a0] mb-2">
                <Printer size={16} />
                <span className="text-sm font-medium uppercase tracking-wider">Tổng Mẫu</span>
             </div>
             <div className="text-3xl font-bold text-white">{totalPrints}</div>
          </div>
          <div className="bg-[#2a2a2b] border border-[#3a3a3c] rounded-xl p-4 flex flex-col justify-center shadow-lg">
             <div className="flex items-center gap-2 text-[#a0a0a0] mb-2">
                <Clock size={16} />
                <span className="text-sm font-medium uppercase tracking-wider">Thời gian in</span>
             </div>
             <div className="text-3xl font-bold text-white">{(totalMinutes / 60).toFixed(1)} <span className="text-lg text-[#a0a0a0] font-normal">giờ</span></div>
          </div>
          <div className="bg-[#2a2a2b] border border-[#3a3a3c] rounded-xl p-4 flex flex-col justify-center shadow-lg">
             <div className="flex items-center gap-2 text-[#a0a0a0] mb-2">
                <Weight size={16} />
                <span className="text-sm font-medium uppercase tracking-wider">Nhựa tiêu thụ</span>
             </div>
             <div className="text-3xl font-bold text-[#00e676]">{totalWeight > 0 ? totalWeight.toFixed(0) : '---'} <span className="text-lg text-[#a0a0a0] font-normal">g</span></div>
          </div>
          <div className="bg-[#2a2a2b] border border-[#3a3a3c] rounded-xl p-4 flex flex-col justify-center shadow-lg">
             <div className="flex items-center gap-2 text-[#a0a0a0] mb-2">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium uppercase tracking-wider">Tỷ lệ thành công</span>
             </div>
             <div className="text-3xl font-bold text-white">{totalPrints > 0 ? Math.round((successPrints / totalPrints) * 100) : 0}%</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-normal flex items-center gap-3">
            <BarChart3 className="text-[#a0a0a0]" size={28} />
            Cloud Print History
          </h2>
          <div className="flex gap-3">
             <label className="cursor-pointer p-2 bg-[#00e676]/10 hover:bg-[#00e676]/20 text-[#00e676] rounded-lg transition-colors border border-[#00e676]/20 flex items-center gap-2">
                <File size={20} />
                <span className="hidden sm:inline font-medium text-sm">In File Của Bạn</span>
                <input 
                  type="file" 
                  accept=".gcode,.3mf"
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    showDialog({
                      title: 'Thông báo',
                      message: `Đã chọn file: ${file.name}\nTính năng Upload FTPS đang được phát triển. Bạn sẽ sớm có thể in trực tiếp từ điện thoại!`,
                      hideCancel: true
                    });
                    
                    // Reset value so we can select same file again if needed
                    e.target.value = '';
                  }}
                />
             </label>
             <button 
               onClick={fetchTasks}
               className="p-2 bg-[#2a2a2b] hover:bg-[#353535] rounded-lg transition-colors border border-[#3a3a3c]"
             >
               <RefreshCw size={20} className={loading ? "animate-spin text-[#00e676]" : "text-[#a0a0a0]"} />
             </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e676]"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 pb-20">
            {tasks.map((task) => (
              <div key={task.id} className="bg-[#2a2a2b] rounded-xl overflow-hidden border border-[#3a3a3c] shadow-lg flex flex-col group hover:border-[#555] transition-colors relative">
                <div className="h-24 sm:h-32 w-full relative bg-black/50">
                  {task.cover ? (
                    <img src={task.cover} alt={task.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <File className="text-[#555]" size={32} />
                    </div>
                  )}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 sm:gap-2">
                    <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-xs border border-white/10 flex items-center gap-1">
                       <Clock size={10} />
                       <span>{Math.floor((task.costTime || 0) / 60)} min</span>
                    </div>
                  </div>
                  
                  {/* Nút Xem Timelapse ảo */}
                  <div 
                    className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer gap-2 sm:gap-4"
                  >
                     <div 
                       className="bg-[#00e676] text-black p-1.5 sm:p-3 rounded-full shadow-[0_0_15px_rgba(0,230,118,0.5)] transform scale-90 group-hover:scale-100 transition-transform hover:scale-110"
                       onClick={(e) => { e.stopPropagation(); setActiveVideoUrl(task.videoUrl || 'demo_video'); }}
                     >
                        <PlayCircle size={18} className="sm:w-[28px] sm:h-[28px]" />
                     </div>
                     <div 
                       className="bg-[#2a2a2b] border border-[#555] text-white p-1.5 sm:p-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] transform scale-90 group-hover:scale-100 transition-transform hover:scale-110"
                       onClick={(e) => { e.stopPropagation(); setActiveGCodeUrl(task.url || ''); }}
                     >
                        <Box size={18} className="sm:w-[28px] sm:h-[28px]" />
                     </div>
                  </div>
                </div>
                <div className="p-2 sm:p-4 flex flex-col flex-1 z-10 bg-[#2a2a2b]">
                  <h3 className="font-medium text-[11px] sm:text-[15px] text-[#f0f0f0] line-clamp-2 mb-1 leading-snug">{task.title || 'Unknown Model'}</h3>
                  <div className="text-[9px] sm:text-xs text-[#a0a0a0] mb-2 sm:mb-3 mt-auto flex justify-between">
                     <span>{new Date(task.startTime).toLocaleDateString()}</span>
                     <span className={task.status === 4 ? "text-[#00e676]" : "text-[#ff9800]"}>
                        {task.status === 4 ? 'Hoàn thành' : 'Đã hủy/Lỗi'}
                     </span>
                  </div>
                  <button 
                    onClick={() => onPrintAgain(task)}
                    className="w-full bg-[#00e676]/10 hover:bg-[#00e676]/20 text-[#00e676] py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-colors border border-[#00e676]/20"
                  >
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

      {/* Video Modal */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-4xl bg-black rounded-xl border border-[#333] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <button 
                onClick={() => setActiveVideoUrl(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 transition-colors"
              >
                 <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div className="aspect-video w-full bg-[#111] flex flex-col items-center justify-center relative">
                 {/* Fake Video Player Effect */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="animate-spin text-[#00e676] w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/></svg>
                 </div>
                 <div className="text-[#888] font-mono text-sm mt-20">Loading Timelapse Stream...</div>
                 <div className="text-[#555] text-xs mt-2">(Tính năng đang chờ hỗ trợ API Video gốc từ Bambu Cloud)</div>
              </div>
           </div>
        </div>
      )}

      {/* 3D GCode Viewer Modal */}
      {activeGCodeUrl !== null && (
        <GCodeViewer url={activeGCodeUrl} onClose={() => setActiveGCodeUrl(null)} />
      )}
    </div>
  );
}
