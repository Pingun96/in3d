import React, { useState, useEffect } from 'react';

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
    <div 
      className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onDoubleClick={onClose}
    >
      {/* Tapping anywhere will show a hint */}
      <div className="absolute top-4 text-[#333] text-xs font-mono tracking-widest opacity-50">
        DOUBLE TAP TO EXIT
      </div>

      <div className="flex flex-col items-center gap-12 w-full px-8">
        {/* Clock */}
        <div className="text-[#ff3333] text-[120px] sm:text-[180px] font-mono font-bold leading-none tracking-tighter" style={{ textShadow: '0 0 20px rgba(255,51,51,0.3)' }}>
          {timeStr}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl opacity-80">
          <div className="flex flex-col items-center border border-[#ff3333]/20 p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-sm tracking-widest mb-2 uppercase">Nozzle</span>
             <span className="text-[#ff3333] text-4xl sm:text-5xl font-mono">{nozzleTemp}°</span>
          </div>
          <div className="flex flex-col items-center border border-[#ff3333]/20 p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-sm tracking-widest mb-2 uppercase">Bed</span>
             <span className="text-[#ff3333] text-4xl sm:text-5xl font-mono">{bedTemp}°</span>
          </div>
          <div className="flex flex-col items-center border border-[#ff3333]/20 p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-sm tracking-widest mb-2 uppercase">Progress</span>
             <span className="text-[#ff3333] text-4xl sm:text-5xl font-mono">{printProgress}%</span>
          </div>
          <div className="flex flex-col items-center border border-[#ff3333]/20 p-6 rounded-2xl bg-[#110000]">
             <span className="text-[#ff3333]/60 text-sm tracking-widest mb-2 uppercase">Time Left</span>
             <span className="text-[#ff3333] text-4xl sm:text-5xl font-mono">{formatTimeRemaining(printTimeRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {printState === 'RUNNING' && (
          <div className="w-full max-w-4xl h-2 bg-[#220000] rounded-full overflow-hidden mt-8">
            <div 
              className="h-full bg-[#ff3333] shadow-[0_0_10px_#ff3333]" 
              style={{ width: `${printProgress}%` }}
            ></div>
          </div>
        )}
        <div className="text-[#ff3333]/50 text-xl tracking-widest mt-4 uppercase font-bold">
           {printState}
        </div>
      </div>
    </div>
  );
}
