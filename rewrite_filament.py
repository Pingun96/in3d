import os

file_path = r'd:\App Theo dõi IN 3D\src\components\FilamentScreen.tsx'

content = """import React, { useState } from 'react';
import { BookOpen, Settings, X, Wrench } from 'lucide-react';

interface FilamentScreenProps {
  amsList: any[];
  activeTrayId: number | null;
  loadAmsFilament: (tray: number) => void;
  handleLoadFilament: () => void;
  handleUnloadFilament: () => void;
  machineStatus: string;
}

export function FilamentScreen({
  amsList,
  activeTrayId,
  loadAmsFilament,
  handleLoadFilament,
  handleUnloadFilament,
  machineStatus
}: FilamentScreenProps) {
  
  const [selectedTray, setSelectedTray] = useState<number | null>(null);

  // Extract trays from amsList
  let trays: any[] = [];
  if (amsList && amsList.length > 0) {
    trays = amsList[0].tray || [];
  }

  const displayTrays = [0, 1, 2, 3].map(i => {
    const existingTray = trays.find(t => parseInt(t.id) === i);
    return existingTray || { id: i.toString(), empty: true };
  });

  const openTrayModal = (trayId: number) => {
    setSelectedTray(trayId);
  };
  
  const closeTrayModal = () => setSelectedTray(null);

  const renderTrayModal = () => (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
       <div className="bg-[#2b2b2d] rounded-xl p-6 w-[80%] max-w-sm relative">
         <X size={24} className="absolute top-4 right-4 text-[#888] cursor-pointer hover:text-white" onClick={closeTrayModal} />
         <h3 className="text-white font-bold text-lg mb-6 text-center">Filament Control</h3>
         
         <div className="flex flex-col gap-3">
           <button 
             className="w-full bg-[#3a3a3c] hover:bg-[#4a4a4c] text-white font-bold py-3 rounded-lg transition-colors" 
             onClick={() => {
               if (selectedTray !== null) loadAmsFilament(selectedTray);
               closeTrayModal();
             }}>
             Feed Filament
           </button>
           <button 
             className="w-full bg-[#00e676] hover:bg-[#00c853] text-black font-bold py-3 rounded-lg transition-colors" 
             onClick={() => {
               handleLoadFilament();
               closeTrayModal();
             }}>
             Load (Nozzle)
           </button>
           <button 
             className="w-full bg-[#ff5252] hover:bg-[#ff3b3b] text-white font-bold py-3 rounded-lg transition-colors" 
             onClick={() => {
               handleUnloadFilament();
               closeTrayModal();
             }}>
             Unload (Nozzle)
           </button>
         </div>
       </div>
    </div>
  );

  const Spool = ({ color, label, material, isActive, isEmpty, onClick }: any) => (
    <div className="flex flex-col items-center relative cursor-pointer group" onClick={onClick}>
      {/* Dashed line and Material text */}
      <div className="flex flex-col items-center mb-1">
        <span className="text-[#a0a0a0] text-[11px] font-bold tracking-wider h-4">{isEmpty ? '' : material}</span>
        <div className="h-6 w-px border-l-2 border-dashed border-[#555] my-1"></div>
      </div>
      
      {/* Spool Body */}
      <div className={`relative w-[60px] h-[90px] flex transition-transform ${!isEmpty ? 'group-hover:scale-105' : ''}`}>
        {/* Left Cheek */}
        <div className="w-[12px] h-full bg-gradient-to-r from-[#1a1a1c] to-[#3a3a3c] rounded-[40%] z-20 border border-[#111] shadow-[2px_0_4px_rgba(0,0,0,0.5)]"></div>
        
        {/* Filament Center */}
        <div 
          className="flex-1 h-[88%] my-auto z-10 relative -mx-[4px] border-y border-[#111]" 
          style={{ backgroundColor: isEmpty ? 'transparent' : color }}
        >
           {!isEmpty && <div className="w-full h-full bg-gradient-to-b from-black/50 via-white/10 to-black/80"></div>}
        </div>
        
        {/* Right Cheek */}
        <div className="w-[12px] h-full bg-gradient-to-r from-[#3a3a3c] to-[#1a1a1c] rounded-[40%] z-20 border border-[#111] shadow-[-2px_0_4px_rgba(0,0,0,0.5)]"></div>
        
        {/* Overlay Label (A1/Ext) */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-sm px-1.5 py-0.5 flex items-center gap-1 z-30 border border-white/5 backdrop-blur-sm">
          <span className="text-[#e0e0e0] text-[10px] font-bold">{label}</span>
          {!isEmpty && <svg viewBox="0 0 24 24" width="8" height="8" stroke="#a0a0a0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
        </div>

        {/* Active Line indicator (goes down from spool) */}
        {isActive && (
          <div className="absolute -bottom-[20px] left-1/2 transform -translate-x-1/2 w-0.5 h-[20px] bg-white z-0"></div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex w-full h-full bg-[#111] overflow-hidden relative items-center justify-center">
      
      {selectedTray !== null && renderTrayModal()}

      <div className="relative flex flex-col items-center mt-[-80px]">
        
        <div className="flex relative z-10">
          
          {/* AMS Container */}
          <div className="relative border border-[#2b2b2b] rounded-[24px] p-5 flex bg-gradient-to-b from-[#1b1b1d] to-[#111] shadow-2xl">
             
             {/* 4 Spools */}
             <div className="flex gap-[6px]">
               {displayTrays.map((tray, idx) => {
                 const trayIdNum = parseInt(tray.id);
                 const isActive = activeTrayId === trayIdNum;
                 const isEmpty = tray.empty || !tray.tray_info_idx;
                 const colorHex = tray.tray_color ? `#${tray.tray_color.substring(0,6)}` : '#ffffff';
                 const material = tray.tray_sub_brands ? tray.tray_sub_brands : (tray.tray_type || 'PLA');
                 
                 return (
                   <Spool 
                     key={idx}
                     label={`A${idx + 1}`}
                     color={colorHex}
                     material={material}
                     isActive={isActive}
                     isEmpty={isEmpty}
                     onClick={() => { if (!isEmpty) openTrayModal(trayIdNum); }}
                   />
                 );
               })}
             </div>
             
             {/* Humidity Indicator */}
             <div className="w-[36px] bg-[#0a0a0a] rounded-full flex flex-col items-center justify-between py-3 border border-[#222] ml-4">
                <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
                   <svg viewBox="0 0 24 24" width="16" height="16" fill="#2196F3"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                </div>
                <span className="text-[#d0d0d0] text-[10px] font-bold mt-1">51%</span>
                <div className="mt-2">
                   <svg viewBox="0 0 24 24" width="14" height="14" stroke="#888" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                </div>
             </div>
          </div>

          {/* External Spool */}
          <div className="ml-8 mt-[1px]">
             <Spool 
               label="Ext"
               color="#ffffff"
               material="PLA"
               isActive={activeTrayId === 254}
               isEmpty={false}
               onClick={() => openTrayModal(254)}
             />
          </div>
          
        </div>

        {/* Connection Lines & Toolhead */}
        <div className="relative w-[480px] h-[100px] mt-2">
           {/* Hardcoded SVG lines to match the layout perfectly */}
           <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              {/* Common AMS horizontal bus */}
              <path d="M 60 0 L 60 20 L 280 20 L 280 40" fill="none" stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 126 0 L 126 20" fill="none" stroke="#333" strokeWidth="2.5" />
              <path d="M 192 0 L 192 20" fill="none" stroke="#333" strokeWidth="2.5" />
              <path d="M 258 0 L 258 20" fill="none" stroke="#333" strokeWidth="2.5" />
              
              {/* External Spool line going down and left */}
              <path d="M 425 0 L 425 40 L 280 40 L 280 80" fill="none" stroke={activeTrayId === 254 ? "#ffffff" : "#333"} strokeWidth="2.5" strokeLinejoin="round" />
              
              {/* Highlight active AMS line */}
              {activeTrayId === 0 && <path d="M 60 0 L 60 20 L 280 20 L 280 80" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />}
              {activeTrayId === 1 && <path d="M 126 0 L 126 20 L 280 20 L 280 80" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />}
              {activeTrayId === 2 && <path d="M 192 0 L 192 20 L 280 20 L 280 80" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />}
              {activeTrayId === 3 && <path d="M 258 0 L 258 20 L 280 20 L 280 80" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />}
           </svg>
           
           {/* Toolhead Icon (Extruder) */}
           <div className="absolute top-[75px] left-[262px] w-[36px] h-[44px] bg-gradient-to-b from-[#b0b0b0] to-[#888] rounded-md shadow-2xl flex flex-col items-center p-1 border border-[#666]">
              <div className="w-[10px] h-[4px] bg-[#333] rounded-sm mb-1"></div>
              <div className="w-[20px] h-[20px] rounded-full bg-[#111] flex items-center justify-center border-2 border-[#555]">
                 <div className="w-[6px] h-[6px] rounded-full bg-[#00e676]"></div>
              </div>
              <div className="w-[8px] h-[6px] bg-[#444] rounded-sm mt-1"></div>
           </div>
        </div>

      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-3">
         <div className="w-10 h-10 bg-[#2b2b2d] rounded-[8px] border border-[#3a3a3c] flex items-center justify-center cursor-pointer hover:bg-[#353535] transition-colors">
           <Wrench size={18} className="text-[#a0a0a0]" />
         </div>
         <div className="bg-[#2b2b2d] rounded-[8px] border border-[#3a3a3c] px-6 h-10 flex items-center gap-2 cursor-pointer hover:bg-[#353535] transition-colors">
           <span className="text-[#d0d0d0] font-medium text-sm tracking-wide">Guide</span>
         </div>
      </div>
      
    </div>
  );
}
"""
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
