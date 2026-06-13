import os

file_path = r'd:\App Theo dõi IN 3D\src\components\HomeScreen.tsx'

content = """import React from 'react';
import { Wifi } from 'lucide-react';

interface HomeScreenProps {
  printerName: string;
  printState: string;
  printProgress: number;
  printTimeRemaining: number;
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
}

export function HomeScreen({
  printerName,
  nozzleTemp,
  nozzleTarget,
  chamberTemp,
  onControlPrint,
  amsList,
  setActiveTab
}: HomeScreenProps) {

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
  const boxClass = "bg-[#1f1f1f] border border-[#00e676] rounded-[4px] cursor-pointer hover:bg-[#2b2b2d] transition-colors relative flex items-center justify-center";

  return (
    <div className="flex flex-col w-full h-full bg-[#111] overflow-hidden relative">
      
      {/* Top Area: Printer Image and Welcome Text */}
      <div className="w-full flex-1 flex items-center px-16 mt-4">
        <div className="w-[40%] h-full flex items-center justify-center relative">
          <svg viewBox="0 0 200 200" className="w-[80%] h-[80%] opacity-40">
             <rect x="20" y="30" width="160" height="150" rx="10" fill="#333" />
             <rect x="30" y="45" width="140" height="120" fill="#111" />
             <path d="M 30 160 L 170 160 L 180 180 L 20 180 Z" fill="#222" />
          </svg>
        </div>
        <div className="w-[60%] pl-10">
          <div className="border-l-[3px] border-[#a0a0a0] pl-6 h-[40px] flex items-center">
            <div className="text-[#d0d0d0] font-medium text-[22px] leading-tight">
              You can call me Mr. Prints-A-<br/>Lot.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: 5 Blocks Row */}
      <div className="w-full h-[140px] flex gap-[10px] px-8 pb-10">
        
        {/* 1. Print Files (Wide Block) */}
        <div 
          className={`${boxClass} flex-[1.6] justify-center gap-6`}
          onClick={() => onControlPrint('print')}
        >
          <img src="/benchy.png" alt="Print Files" className="w-[100px] h-[100px] object-contain drop-shadow-xl" />
          <span className="text-[#e0e0e0] text-sm">Print Files</span>
        </div>

        {/* 2. Nozzle/Bed Temp */}
        <div 
          className={`${boxClass} flex-[0.7] flex-col gap-1.5`}
          onClick={() => setActiveTab?.('control')}
        >
           <svg viewBox="0 0 24 24" width="22" height="22" stroke="#888" strokeWidth="1.5" fill="none">
             <path d="M12 2v6"/><path d="M9 8h6l-1.5 3h-3L9 8z"/><path d="M9 14c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/><path d="M9 18c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/>
           </svg>
           <span className="text-[#e0e0e0] font-medium text-sm">{nozzleTemp} °C</span>
        </div>

        {/* 3. AMS */}
        <div 
          className={`${boxClass} flex-[0.7] flex-col gap-2`}
          onClick={() => setActiveTab?.('filament')}
        >
           <span className="text-[#888] text-[13px]">AMS-A</span>
           <div className="flex gap-1.5">
             {amsA.slots.map((color, idx) => (
               <div 
                 key={idx} 
                 className="w-[10px] h-[22px] rounded-full" 
                 style={{ backgroundColor: color !== 'transparent' ? color : '#3a3a3c' }}
               ></div>
             ))}
           </div>
        </div>

        {/* 4. Wi-Fi */}
        <div 
          className={`${boxClass} flex-[0.7] flex-col gap-2`}
          onClick={() => setActiveTab?.('settings')}
        >
           <Wifi size={26} className="text-[#00e676]" strokeWidth={2.5} />
           <span className="text-[#888] text-[13px]">Wi-Fi</span>
        </div>

        {/* 5. HMS / Robot OK */}
        <div 
          className={`${boxClass} flex-[0.7]`}
        >
           <svg viewBox="0 0 24 24" width="34" height="34" stroke="#e0e0e0" strokeWidth="1.2" fill="none">
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
"""
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
