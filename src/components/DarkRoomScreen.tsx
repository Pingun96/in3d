import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DarkRoomScreenProps {
  nozzleTemp: number;
  bedTemp: number;
  printTimeRemaining: number;
  printState: string;
  printProgress: number;
  onClose: () => void;
}

export function DarkRoomScreen({ nozzleTemp, bedTemp, printTimeRemaining, printState, printProgress, onClose }: DarkRoomScreenProps) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const intv = setInterval(updateTime, 1000);
    return () => clearInterval(intv);
  }, []);

  const formatTimeRemaining = (minutes: number) => {
    if (minutes <= 0) return '0h 0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center select-none overflow-hidden">
      
      {/* Exit Button - Subtle but clickable */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-transparent border border-[#ff3333]/20 rounded-full text-[#ff3333]/50 hover:bg-[#ff3333]/10 hover:text-[#ff3333] transition-colors z-10"
      >
        <X size={28} />
      </button>

      {/* Screen Saver Hint */}
      <div className="absolute top-6 text-[#ff3333]/30 text-[10px] sm:text-xs font-mono tracking-widest pointer-events-none">
        STANDBY MODE
      </div>

      <div className="flex flex-col items-center justify-center gap-6 sm:gap-12 w-full px-4 h-full overflow-y-auto pt-16 pb-6">
        {/* Clock */}
        <div className="text-[#ff3333] text-[70px] sm:text-[120px] lg:text-[180px] font-mono font-bold leading-none tracking-tighter" style={{ textShadow: '0 0 20px rgba(255,51,51,0.3)' }}>
          {timeStr}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 w-full max-w-4xl opacity-80">
          <div className="flex flex-col items-center justify-center border border-[#ff3333]/20 p-3 sm:p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-[10px] sm:text-sm tracking-widest mb-1 sm:mb-2 uppercase">Nozzle</span>
             <span className="text-[#ff3333] text-3xl sm:text-4xl lg:text-5xl font-mono">{nozzleTemp}°</span>
          </div>
          <div className="flex flex-col items-center justify-center border border-[#ff3333]/20 p-3 sm:p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-[10px] sm:text-sm tracking-widest mb-1 sm:mb-2 uppercase">Bed</span>
             <span className="text-[#ff3333] text-3xl sm:text-4xl lg:text-5xl font-mono">{bedTemp}°</span>
          </div>
          <div className="flex flex-col items-center justify-center border border-[#ff3333]/20 p-3 sm:p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-[10px] sm:text-sm tracking-widest mb-1 sm:mb-2 uppercase">Progress</span>
             <span className="text-[#ff3333] text-3xl sm:text-4xl lg:text-5xl font-mono">{printProgress}%</span>
          </div>
          <div className="flex flex-col items-center justify-center border border-[#ff3333]/20 p-3 sm:p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-[10px] sm:text-sm tracking-widest mb-1 sm:mb-2 uppercase">Time Left</span>
             <span className="text-[#ff3333] text-2xl sm:text-4xl lg:text-5xl font-mono mt-1 sm:mt-0">{formatTimeRemaining(printTimeRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar & State */}
        <div className="w-full max-w-4xl flex flex-col items-center mt-4 sm:mt-8">
          {printState === 'RUNNING' && (
            <div className="w-full h-1.5 sm:h-2 bg-[#220000] rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-[#ff3333] shadow-[0_0_10px_#ff3333]" 
                style={{ width: `${printProgress}%` }}
              ></div>
            </div>
          )}
          <div className="text-[#ff3333]/50 text-sm sm:text-xl tracking-widest uppercase font-bold text-center">
             {printState === 'RUNNING' ? 'PRINTING IN PROGRESS' : printState}
          </div>
        </div>
      </div>
    </div>
  );
}
