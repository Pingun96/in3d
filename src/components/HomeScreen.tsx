import React from 'react';
import { Wifi, Box, FolderOpen, ChevronRight, Moon } from 'lucide-react';

interface HomeScreenProps {
  printerName: string;
  printState: string;
  printProgress: number;
  printTimeRemaining: number;
  printSubtask?: string;
  coverImage?: string;
  nozzleTemp: number;
  nozzleTarget: number;
  bedTemp: number;
  bedTarget: number;
  chamberTemp: number;
  chamberLight: boolean;
  onControlLight: () => void;
  onControlPrint: (action: string) => void;
  machineStatus: string;

  amsList?: any[];
  setActiveTab?: (tab: string) => void;
  speedLvl?: number;
  deviceInfo?: any;
  onOpenDarkRoom?: () => void;
}

export function HomeScreen({
  printerName,
  printState,
  printProgress,
  printTimeRemaining,
  printSubtask,
  coverImage,
  nozzleTemp,
  nozzleTarget,
  chamberTemp,
  machineStatus,
  onControlPrint,
  amsList,
  setActiveTab,
  speedLvl,
  deviceInfo,
  onOpenDarkRoom
}: HomeScreenProps) {


  // Compute WiFi color
  let wifiColor = '#00e676'; // Default green
  if (deviceInfo && deviceInfo.wifi_signal) {
    const signalStr = String(deviceInfo.wifi_signal);
    const signalMatch = signalStr.match(/([-+]?\d+)/);
    if (signalMatch) {
      const signalValue = parseInt(signalMatch[1], 10);
      if (signalValue > -60) {
        wifiColor = '#00e676'; // Strong: Green
      } else if (signalValue > -75) {
        wifiColor = '#ffeb3b'; // Acceptable: Yellow
      } else {
        wifiColor = '#f44336'; // Weak: Red
      }
    }
  }

  // Get AMS data
  let amsA = { humidity: '51%', slots: [] as string[] };
  if (amsList && amsList.length > 0 && amsList[0].tray) {
    amsA.slots = Array.from({ length: 4 }).map((_, i) => {
      const tray = amsList[0].tray.find((t: any) => parseInt(t.id) === i || (t.id === undefined && i < amsList[0].tray.length));
      return tray && tray.tray_color ? `#${tray.tray_color.substring(0, 6)}` : 'transparent';
    });
  } else {
    amsA.slots = ['#2196F3', '#E91E63', '#795548', '#4CAF50']; // Simulated colors for the exact screenshot look
  }

  // To perfectly match the screenshot, we use a 1px solid green border
  const boxClass = "bg-[#1f1f1f] rounded-[4px] cursor-pointer hover:bg-[#2b2b2d] transition-colors relative flex items-center justify-center";

  // Format the estimated end time
  const estimatedEndTime = React.useMemo(() => {
    if (!printTimeRemaining) return '--:--';
    const now = new Date();
    now.setMinutes(now.getMinutes() + printTimeRemaining);
    return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }, [printTimeRemaining]);


  const isPrinting = printState === 'RUNNING' || printState === 'PAUSE' || printState === 'PRINTING';

  return (
    <div className="flex flex-col w-full h-full bg-[#111] overflow-hidden relative">
      
      {/* Dark Room Button */}
      {onOpenDarkRoom && (
        <button 
          onClick={onOpenDarkRoom}
          className="absolute top-4 right-4 z-50 p-2 bg-[#2a2a2b] border border-[#3a3a3c] rounded-full text-[#a0a0a0] hover:text-white hover:bg-[#353535] transition-colors"
          title="Chế độ Dark Room (Canh đêm)"
        >
          <Moon size={20} />
        </button>
      )}

      {/* Top Area: Printer Image and Welcome Text OR Print Progress */}
      <div className="w-full flex-1 flex items-center px-4 sm:px-8 md:px-16 mt-2 sm:mt-4">
        {isPrinting ? (
          <div className="w-full flex h-full items-center">
             <div className="w-[35%] sm:w-[30%] flex items-center justify-center">
               {/* Progress Circle */}
               <div className="relative w-[30vh] h-[30vh] max-w-[160px] max-h-[160px] flex items-center justify-center drop-shadow-lg">
                 <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#00e676" strokeWidth="8" 
                            strokeDasharray={`${2 * Math.PI * 45}`} 
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (printProgress || 0) / 100)}`} 
                            strokeLinecap="round"
                             className="transition-all duration-1000 ease-out" />
                 </svg>
                 <div className="absolute w-[22vh] h-[22vh] max-w-[120px] max-h-[120px] rounded-full overflow-hidden flex flex-col items-center justify-center bg-[#1a1a1a]">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-[60%] h-[60%] flex items-center justify-center opacity-40">
                         <Box size={56} className="text-white" />
                      </div>
                    )}
                 </div>
                  <div className="absolute -bottom-2 bg-[#111] px-2 py-0.5 rounded-full border border-[#333]">
                    <span className="text-xs sm:text-sm font-bold text-[#00e676]">{printProgress || 0}%</span>
                 </div>
               </div>
             </div>
             <div className="w-[65%] sm:w-[70%] pl-4 sm:pl-10 flex flex-col gap-2 sm:gap-5">
                <div className="text-lg sm:text-2xl text-white font-medium truncate w-full" title={printSubtask}>
                  {printSubtask || "Không xác định"}
                </div>

                <div className="flex gap-4 sm:gap-16 mt-1 sm:mt-2">
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <span className="text-[#888] text-[10px] sm:text-sm uppercase tracking-wider">Trạng thái</span>
                    <span className="text-white text-sm sm:text-xl font-medium">
                      {{
                        'IDLE': 'Sẵn sàng',
                        'PREPARE': 'Đang chuẩn bị',
                        'RUNNING': 'Đang in',
                        'PAUSE': 'Tạm dừng',
                        'FINISH': 'Hoàn thành',
                        'FAILED': 'Lỗi',
                        'OFFLINE': 'Ngoại tuyến'
                      }[machineStatus] || machineStatus}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <span className="text-[#888] text-[10px] sm:text-sm uppercase tracking-wider">Còn lại</span>
                    <span className="text-[#00e676] text-sm sm:text-xl font-medium">{printTimeRemaining || 0} phút</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <span className="text-[#888] text-[10px] sm:text-sm uppercase tracking-wider">Dự kiến xong lúc</span>
                    <span className="text-white text-sm sm:text-xl font-medium">{estimatedEndTime}</span>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="w-[40%] h-full flex items-center justify-center relative">
              <svg viewBox="0 0 200 200" className="w-[80%] h-[80%] opacity-40">
                 <rect x="20" y="30" width="160" height="150" rx="10" fill="#333" />
                 <rect x="30" y="45" width="140" height="120" fill="#111" />
                 <path d="M 30 160 L 170 160 L 180 180 L 20 180 Z" fill="#222" />
              </svg>
            </div>
            <div className="w-[60%] pl-4 sm:pl-10">
              <div className="border-l-[3px] border-[#00e676] pl-4 sm:pl-6 h-auto sm:h-[50px] flex flex-col justify-center gap-1">
                <div className="text-[#e0e0e0] font-medium text-lg sm:text-[24px] leading-tight">
                  Máy in đã sẵn sàng!
                </div>
                <div className="text-[#888] text-xs sm:text-sm">Hãy chọn một mẫu in để bắt đầu.</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Area: 5 Blocks Row */}
      <div className="w-full h-[26vh] max-h-[140px] flex gap-2 md:gap-[10px] px-4 sm:px-8 pb-4 sm:pb-6 md:pb-10">
        
        {/* 1. Print Files (Wide Block) */}
        <div 
          className={`${boxClass} flex-1 justify-center items-center gap-1 sm:gap-3 px-2 sm:px-4 relative overflow-hidden group`}
          onClick={() => setActiveTab?.('print')}
        >
          <img src="/benchy_transparent.png" alt="Benchy" className="h-[30px] sm:h-[45px] object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300" />
          <span className="text-[#e0e0e0] text-[10px] sm:text-sm font-medium z-10">Print Files</span>
        </div>

        {/* 2. Nozzle/Bed Temp */}
        <div 
          className={`${boxClass} flex-[0.7] flex-col gap-0.5 sm:gap-1.5`}
          onClick={() => setActiveTab?.('control')}
        >
           <svg viewBox="0 0 24 24" className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px]" stroke="#888" strokeWidth="1.5" fill="none">
             <path d="M12 2v6"/><path d="M9 8h6l-1.5 3h-3L9 8z"/><path d="M9 14c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/><path d="M9 18c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/>
           </svg>
           <span className="text-[#e0e0e0] font-medium text-xs sm:text-sm">{nozzleTemp} °C</span>
        </div>

        {/* 3. AMS */}
        <div 
          className={`${boxClass} flex-[0.7] flex-col gap-1 sm:gap-2`}
          onClick={() => setActiveTab?.('filament')}
        >
           <span className="text-[#888] text-[10px] sm:text-[13px]">AMS-A</span>
           <div className="flex gap-1 sm:gap-1.5">
             {amsA.slots.map((color, idx) => (
               <div 
                 key={idx} 
                 className="w-[6px] sm:w-[10px] h-[14px] sm:h-[22px] rounded-full" 
                 style={{ backgroundColor: color !== 'transparent' ? color : '#3a3a3c' }}
               ></div>
             ))}
           </div>
        </div>

        {/* 4. Wi-Fi */}
        <div 
          className={`${boxClass} flex-[0.7] flex-col gap-1 sm:gap-2`}
          onClick={() => setActiveTab?.('settings')}
        >
           <Wifi className="w-[18px] sm:w-[26px] h-[18px] sm:h-[26px]" color={wifiColor} strokeWidth={2.5} />
           <span className="text-[#888] text-[10px] sm:text-[13px]">Wi-Fi</span>
        </div>

        {/* 5. HMS / Robot OK */}
        <div 
          className={`${boxClass} flex-[0.7]`}
        >
           <svg viewBox="0 0 24 24" className="w-[24px] sm:w-[34px] h-[24px] sm:h-[34px]" stroke="#e0e0e0" strokeWidth="1.2" fill="none">
              <rect x="3" y="7" width="18" height="12" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              {/* Eyes */}
              <circle cx="8.5" cy="12" r="1" fill="#00e676" stroke="none" />
              <circle cx="15.5" cy="12" r="1" fill="#00e676" stroke="none" />
              {/* Smile */}
              <path d="M10 16 Q12 18 14 16" stroke="#00e676" strokeWidth="1.5" fill="none" />
           </svg>
        </div>

      </div>
    </div>
  );
}
