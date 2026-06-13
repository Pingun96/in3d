import os

file_path = r'd:\App Theo dõi IN 3D\src\components\ControlScreen.tsx'

content = """import React, { useState } from 'react';
import { Wind, Lightbulb, Thermometer, ChevronRight, Check, X } from 'lucide-react';

interface ControlScreenProps {
  controlAxis: (axis: 'X' | 'Y' | 'Z', distance: number) => void;
  controlTemp: (target: 'nozzle' | 'bed', temp: number) => void;
  fanPart: number;
  fanAux: number;
  fanChamber: number;
  onControlFan: (fanType: string, value: number) => void;
  nozzleTarget: number;
  bedTarget: number;
  chamberLight?: boolean;
  onControlLight?: () => void;
  controlSpeed?: (level: number) => void;
}

export function ControlScreen({
  controlAxis,
  controlTemp,
  fanPart,
  fanAux,
  fanChamber,
  onControlFan,
  nozzleTarget,
  bedTarget,
  chamberLight,
  onControlLight,
  controlSpeed
}: ControlScreenProps) {
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const openModal = (modal: string, currentVal: number | string = '') => {
    setActiveModal(modal);
    setInputValue(currentVal.toString());
  };
  
  const closeModal = () => setActiveModal(null);
  
  const handleSetTemp = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val)) {
      if (activeModal === 'nozzle') controlTemp('nozzle', val);
      if (activeModal === 'bed') controlTemp('bed', val);
    }
    closeModal();
  };

  const renderTempModal = () => (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
       <div className="bg-[#2b2b2d] rounded-xl p-6 w-[80%] max-w-sm relative">
         <X size={24} className="absolute top-4 right-4 text-[#888] cursor-pointer hover:text-white" onClick={closeModal} />
         <h3 className="text-white font-bold text-lg mb-6 text-center">
           Set {activeModal === 'nozzle' ? 'Nozzle' : 'Heatbed'} Temp
         </h3>
         <input 
           type="number" 
           value={inputValue} 
           onChange={e => setInputValue(e.target.value)} 
           className="w-full bg-[#111] text-white p-3 rounded-lg text-center text-2xl mb-6 outline-none border border-[#444] focus:border-[#00e676]" 
           autoFocus
         />
         <button className="w-full bg-[#00e676] hover:bg-[#00c853] text-black font-bold py-3 rounded-lg transition-colors" onClick={handleSetTemp}>
           Confirm
         </button>
       </div>
    </div>
  );

  const renderFanModal = () => (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
       <div className="bg-[#2b2b2d] rounded-xl p-6 w-[80%] max-w-sm relative">
         <X size={24} className="absolute top-4 right-4 text-[#888] cursor-pointer hover:text-white" onClick={closeModal} />
         <h3 className="text-white font-bold text-lg mb-6 text-center">Fan Control</h3>
         
         <div className="flex flex-col gap-6">
           <div>
             <div className="flex justify-between text-sm mb-2"><span className="text-[#a0a0a0] font-medium">Part Cooling</span><span className="text-[#00e676] font-bold">{fanPart}%</span></div>
             <input type="range" min="0" max="100" value={fanPart} onChange={e => onControlFan('part', parseInt(e.target.value))} className="w-full accent-[#00e676]" />
           </div>
           <div>
             <div className="flex justify-between text-sm mb-2"><span className="text-[#a0a0a0] font-medium">Auxiliary</span><span className="text-[#00e676] font-bold">{fanAux}%</span></div>
             <input type="range" min="0" max="100" value={fanAux} onChange={e => onControlFan('aux', parseInt(e.target.value))} className="w-full accent-[#00e676]" />
           </div>
           <div>
             <div className="flex justify-between text-sm mb-2"><span className="text-[#a0a0a0] font-medium">Chamber</span><span className="text-[#00e676] font-bold">{fanChamber}%</span></div>
             <input type="range" min="0" max="100" value={fanChamber} onChange={e => onControlFan('chamber', parseInt(e.target.value))} className="w-full accent-[#00e676]" />
           </div>
         </div>
       </div>
    </div>
  );

  const renderMotionModal = () => (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
       <div className="bg-[#2b2b2d] rounded-xl p-6 w-[80%] max-w-sm relative">
         <X size={24} className="absolute top-4 right-4 text-[#888] cursor-pointer hover:text-white" onClick={closeModal} />
         <h3 className="text-white font-bold text-lg mb-6 text-center">Motion Control</h3>
         <div className="flex gap-8 justify-center">
           <div className="flex flex-col gap-2 items-center">
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-14 h-14 rounded-lg text-white font-bold text-xl flex items-center justify-center" onClick={() => controlAxis('Y', -10)}>↑</button>
             <div className="flex gap-2">
               <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-14 h-14 rounded-lg text-white font-bold text-xl flex items-center justify-center" onClick={() => controlAxis('X', -10)}>←</button>
               <div className="w-14 h-14 flex items-center justify-center text-[#555] font-bold text-xs">X/Y</div>
               <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-14 h-14 rounded-lg text-white font-bold text-xl flex items-center justify-center" onClick={() => controlAxis('X', 10)}>→</button>
             </div>
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-14 h-14 rounded-lg text-white font-bold text-xl flex items-center justify-center" onClick={() => controlAxis('Y', 10)}>↓</button>
           </div>
           <div className="flex flex-col gap-2 items-center justify-center">
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-14 h-14 rounded-lg text-white font-bold text-xl flex items-center justify-center" onClick={() => controlAxis('Z', -10)}>↑</button>
             <div className="w-14 h-14 flex items-center justify-center text-[#555] font-bold text-xs">Z</div>
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-14 h-14 rounded-lg text-white font-bold text-xl flex items-center justify-center" onClick={() => controlAxis('Z', 10)}>↓</button>
           </div>
         </div>
       </div>
    </div>
  );

  const renderSpeedModal = () => (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
       <div className="bg-[#2b2b2d] rounded-xl p-6 w-[80%] max-w-sm relative">
         <X size={24} className="absolute top-4 right-4 text-[#888] cursor-pointer hover:text-white" onClick={closeModal} />
         <h3 className="text-white font-bold text-lg mb-6 text-center">Print Speed</h3>
         <div className="flex flex-col gap-3">
           <button className="w-full bg-[#3a3a3c] hover:bg-[#4a4a4c] text-white font-bold py-3 rounded-lg transition-colors" onClick={() => { controlSpeed?.(1); closeModal(); }}>Silent (50%)</button>
           <button className="w-full bg-[#00e676] hover:bg-[#00c853] text-black font-bold py-3 rounded-lg transition-colors" onClick={() => { controlSpeed?.(2); closeModal(); }}>Standard (100%)</button>
           <button className="w-full bg-[#ffaa00] hover:bg-[#ff9900] text-black font-bold py-3 rounded-lg transition-colors" onClick={() => { controlSpeed?.(3); closeModal(); }}>Sport (124%)</button>
           <button className="w-full bg-[#ff5252] hover:bg-[#ff3b3b] text-white font-bold py-3 rounded-lg transition-colors" onClick={() => { controlSpeed?.(4); closeModal(); }}>Ludicrous (166%)</button>
         </div>
       </div>
    </div>
  );

  return (
    <div className="flex w-full h-full p-4 gap-4 bg-[#0f1011] overflow-hidden relative">
      
      {activeModal === 'nozzle' || activeModal === 'bed' ? renderTempModal() : null}
      {activeModal === 'fan' ? renderFanModal() : null}
      {activeModal === 'motion' ? renderMotionModal() : null}
      {activeModal === 'speed' ? renderSpeedModal() : null}

      {/* Left Column: Temperatures & Air Condition */}
      <div className="w-[30%] flex flex-col gap-3 h-full">
        
        {/* Air Condition */}
        <div onClick={() => openModal('fan')} className="bg-[#2b2b2d] rounded-[16px] p-5 flex justify-between items-center cursor-pointer hover:bg-[#353535] transition-colors h-[20%]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0]">
              <Wind size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[#a0a0a0] text-sm">Air Condition</span>
              <span className="text-white font-medium text-lg mt-0.5">Cooling</span>
            </div>
          </div>
          <ChevronRight size={24} className="text-[#555]" />
        </div>

        {/* Nozzle & Extruder */}
        <div onClick={() => openModal('nozzle', nozzleTarget)} className="bg-[#2b2b2d] rounded-[16px] p-5 flex flex-col justify-center cursor-pointer hover:bg-[#353535] transition-colors h-[30%] relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0]">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 2v6"/><path d="M9 8h6l-1.5 3h-3L9 8z"/><path d="M9 14c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/><path d="M9 18c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/></svg>
            </div>
            <span className="text-[#a0a0a0] text-sm">Nozzle & Extruder</span>
          </div>
          <div className="flex items-center gap-2 mt-2 bg-[#3a3a3c] w-max px-3 py-1.5 rounded-lg border border-[#444]">
            <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <span className="text-white font-medium">22°C / {nozzleTarget}°C</span>
          </div>
          <ChevronRight size={24} className="text-[#555] absolute right-5 top-5" />
        </div>

        {/* Chamber */}
        <div className="bg-[#2b2b2d] rounded-[16px] p-5 flex flex-col justify-center cursor-pointer hover:bg-[#353535] transition-colors h-[25%] relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0]">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            </div>
            <span className="text-[#a0a0a0] text-sm">Chamber</span>
          </div>
          <span className="text-white font-medium text-2xl mt-1 ml-[64px]">27°C</span>
        </div>

        {/* Heatbed */}
        <div onClick={() => openModal('bed', bedTarget)} className="bg-[#2b2b2d] rounded-[16px] p-5 flex flex-col justify-center cursor-pointer hover:bg-[#353535] transition-colors h-[25%] relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0]">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 18h16"/><path d="M6 14h12"/><path d="M8 10h8"/><path d="M12 6v-4"/><path d="M10 2h4"/></svg>
            </div>
            <span className="text-[#a0a0a0] text-sm">Heatbed</span>
          </div>
          <span className="text-white font-medium text-xl mt-1 ml-[64px]">26°C / {bedTarget}°C</span>
          <ChevronRight size={24} className="text-[#555] absolute right-5 top-5" />
        </div>

      </div>

      {/* Right Column: Speed, Motion, Printer Graphic & Light */}
      <div className="w-[70%] flex flex-col gap-3 h-full">
        
        {/* Top Row: Speed and Motion */}
        <div className="flex gap-3 h-[20%]">
          {/* Speed */}
          <div onClick={() => openModal('speed')} className="flex-1 bg-[#2b2b2d] rounded-[16px] p-5 flex justify-between items-center cursor-pointer hover:bg-[#353535] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0]">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[#a0a0a0] text-sm">Speed</span>
                <span className="text-white font-medium text-lg mt-0.5">Standard</span>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#555]" />
          </div>

          {/* Motion */}
          <div onClick={() => openModal('motion')} className="flex-[0.6] bg-[#2b2b2d] rounded-[16px] p-5 flex justify-between items-center cursor-pointer hover:bg-[#353535] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0]">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6L12 2L16 6" />
                  <path d="M8 18L12 22L16 18" />
                  <path d="M6 8L2 12L6 16" />
                  <path d="M18 8L22 12L18 16" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[#a0a0a0] text-sm leading-tight">Motion</span>
                <span className="text-white font-medium text-lg leading-tight mt-1">XYZ</span>
              </div>
            </div>
            <ChevronRight size={24} className="text-[#555]" />
          </div>
        </div>

        {/* Printer Graphic Area */}
        <div className="flex-1 bg-[#1b1b1d] rounded-[16px] relative overflow-hidden flex items-center justify-center">
          <div className="w-[80%] h-[90%] relative">
             <svg viewBox="0 0 200 200" className="w-full h-full opacity-60">
               <rect x="20" y="30" width="160" height="150" fill="none" stroke="#555" strokeWidth="4" rx="10"/>
               <rect x="30" y="40" width="140" height="10" fill="#333" />
               <rect x="30" y="55" width="10" height="110" fill="#333" />
               <rect x="160" y="55" width="10" height="110" fill="#333" />
               <rect x="90" y="60" width="30" height="30" fill="#888" rx="4" />
               <circle cx="105" cy="75" r="8" fill="#111" />
               <path d="M30 160 L170 160 L180 180 L20 180 Z" fill="#444" />
             </svg>
          </div>

          {/* Light Toggle button at bottom right */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
             <span className="text-white font-medium text-lg flex items-center gap-2">
               <Lightbulb size={20} className={chamberLight ? "text-[#00e676]" : "text-[#555]"} />
               Light
             </span>
             <div onClick={onControlLight} className={`w-14 h-8 rounded-full p-1 cursor-pointer relative shadow-lg transition-colors ${chamberLight ? 'bg-[#00e676]' : 'bg-[#3a3a3c]'}`}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm flex items-center justify-center transition-all ${chamberLight ? 'right-1' : 'left-1'}`}>
                  {chamberLight && <Check size={16} className="text-[#00e676]" strokeWidth={3} />}
                </div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
}
"""
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
