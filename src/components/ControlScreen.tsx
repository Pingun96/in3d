import React, { useState } from 'react';
import { Wind, Lightbulb, Thermometer, ChevronRight, Check, X, ChevronLeft } from 'lucide-react';
import { CameraView } from './CameraScreen';

interface ControlScreenProps {
  controlAxis: (axis: 'X' | 'Y' | 'Z', distance: number) => void;
  controlTemp: (target: 'nozzle' | 'bed', temp: number) => void;
  fanPart: number;
  fanAux: number;
  fanChamber: number;
  onControlFan: (fanType: string, value: number) => void;
  nozzleTemp: number;
  nozzleTarget: number;
  bedTemp: number;
  bedTarget: number;
  chamberTemp: number;
  chamberLight?: boolean;
  onControlLight?: () => void;
  controlSpeed?: (level: number) => void;
  speedLvl?: number;
}

export function ControlScreen({
  controlAxis,
  controlTemp,
  fanPart,
  fanAux,
  fanChamber,
  onControlFan,
  nozzleTemp,
  nozzleTarget,
  bedTemp,
  bedTarget,
  chamberTemp,
  chamberLight,
  onControlLight,
  controlSpeed,
  speedLvl
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

  const handleKeypadPress = (val: string) => {
    if (val === 'back') {
      setInputValue(prev => prev.slice(0, -1));
    } else {
      setInputValue(prev => {
        // Remove leading zero if typing a new number
        if (prev === '0') return val;
        const newValue = prev + val;
        if (newValue.length > 3) return prev;
        return newValue;
      });
    }
  };

  const renderTempModal = () => (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
       <div className="bg-[#2a2a2b] rounded-2xl p-6 w-[90%] max-w-xl relative flex flex-row gap-8 shadow-2xl border border-[#3a3a3c]">
         <X size={26} className="absolute top-4 right-4 text-[#888] cursor-pointer hover:text-white transition-colors" onClick={closeModal} />
         
         {/* Left Side: Input and Confirm */}
         <div className="flex-1 flex flex-col justify-center pt-2">
           <h3 className="text-white font-normal text-xl mb-8 text-center tracking-wide">
             Set {activeModal === 'nozzle' ? 'Nozzle' : 'Heatbed'} Temp
           </h3>
           <div className="w-full bg-[#111] text-white p-2 sm:p-4 rounded-xl text-center text-3xl sm:text-4xl mb-4 sm:mb-8 border border-[#444] h-12 sm:h-20 flex items-center justify-center font-light tracking-wider shadow-inner">
             {inputValue || '0'} <span className="text-xl sm:text-2xl text-[#888] ml-1 mt-1">°C</span>
           </div>
           <button className="w-full bg-[#00e676] hover:bg-[#00c853] text-black font-medium py-3 sm:py-4 rounded-xl transition-colors text-base sm:text-lg shadow-[0_0_15px_rgba(0,230,118,0.3)]" onClick={handleSetTemp}>
             Confirm
           </button>
         </div>

         {/* Right Side: Numpad */}
         <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3 pt-4 sm:pt-6 pb-2 pr-2">
           {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((key, i) => (
             <div 
               key={i} 
               onClick={() => key !== '' && handleKeypadPress(key)}
               className={`h-10 sm:h-16 flex items-center justify-center rounded-xl text-xl sm:text-2xl font-normal transition-colors select-none ${key === '' ? 'pointer-events-none' : 'bg-[#38383a] hover:bg-[#4a4a4c] cursor-pointer text-[#f0f0f0] border border-[#444] shadow-sm active:bg-[#555]'}`}
             >
               {key === 'back' ? (
                 <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] sm:w-[28px] sm:h-[28px]" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
               ) : key}
             </div>
           ))}
         </div>
       </div>
    </div>
  );

  const renderFanModal = () => (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
       <div className="bg-[#2b2b2d] rounded-xl p-6 w-[80%] max-w-sm relative">
         <X size={24} className="absolute top-4 right-4 text-[#888] cursor-pointer hover:text-white" onClick={closeModal} />
         <h3 className="text-white font-bold text-lg mb-6 text-center">Fan Control</h3>
         
         <div className="flex flex-col gap-3 sm:gap-6">
           <div>
             <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2"><span className="text-[#a0a0a0] font-medium">Part Cooling</span><span className="text-[#00e676] font-bold">{fanPart}%</span></div>
             <input type="range" min="0" max="100" value={fanPart} onChange={e => onControlFan('part', parseInt(e.target.value))} className="w-full accent-[#00e676]" />
           </div>
           <div>
             <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2"><span className="text-[#a0a0a0] font-medium">Auxiliary</span><span className="text-[#00e676] font-bold">{fanAux}%</span></div>
             <input type="range" min="0" max="100" value={fanAux} onChange={e => onControlFan('aux', parseInt(e.target.value))} className="w-full accent-[#00e676]" />
           </div>
           <div>
             <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2"><span className="text-[#a0a0a0] font-medium">Chamber</span><span className="text-[#00e676] font-bold">{fanChamber}%</span></div>
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
         <div className="flex gap-4 sm:gap-8 justify-center">
           <div className="flex flex-col gap-1 sm:gap-2 items-center">
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-10 h-10 sm:w-14 sm:h-14 rounded-lg text-white font-bold text-lg sm:text-xl flex items-center justify-center" onClick={() => controlAxis('Y', -10)}>↑</button>
             <div className="flex gap-1 sm:gap-2">
               <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-10 h-10 sm:w-14 sm:h-14 rounded-lg text-white font-bold text-lg sm:text-xl flex items-center justify-center" onClick={() => controlAxis('X', -10)}>←</button>
               <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-[#555] font-bold text-[10px] sm:text-xs">X/Y</div>
               <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-10 h-10 sm:w-14 sm:h-14 rounded-lg text-white font-bold text-lg sm:text-xl flex items-center justify-center" onClick={() => controlAxis('X', 10)}>→</button>
             </div>
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-10 h-10 sm:w-14 sm:h-14 rounded-lg text-white font-bold text-lg sm:text-xl flex items-center justify-center" onClick={() => controlAxis('Y', 10)}>↓</button>
           </div>
           <div className="flex flex-col gap-1 sm:gap-2 items-center justify-center">
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-10 h-10 sm:w-14 sm:h-14 rounded-lg text-white font-bold text-lg sm:text-xl flex items-center justify-center" onClick={() => controlAxis('Z', -10)}>↑</button>
             <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-[#555] font-bold text-[10px] sm:text-xs">Z</div>
             <button className="bg-[#3a3a3c] hover:bg-[#4a4a4c] w-10 h-10 sm:w-14 sm:h-14 rounded-lg text-white font-bold text-lg sm:text-xl flex items-center justify-center" onClick={() => controlAxis('Z', 10)}>↓</button>
           </div>
         </div>
       </div>
    </div>
  );

  const renderSpeedModal = () => (
    <div className="absolute inset-0 bg-[#2b2b2d] z-50 flex flex-col">
       <div className="flex items-center p-6 pb-2">
          <button className="text-[#a0a0a0] hover:text-white mr-4" onClick={closeModal}>
             <ChevronLeft size={28} />
          </button>
          <h2 className="text-white text-2xl font-normal">Speed</h2>
          <div className="flex-1 flex flex-row items-center justify-center p-2 sm:p-6 gap-2 sm:gap-8 overflow-y-auto">
           <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-[100px] h-[100px] sm:w-[192px] sm:h-[192px] mb-2 sm:mb-8 flex items-center justify-center opacity-90 relative">
                 <img src="/toolhead.png" alt="Toolhead" className="absolute inset-0 w-full h-full object-contain z-10" onError={(e) => {
                   e.currentTarget.style.display = 'none';
                 }} />
                 {/* Fallback CSS Toolhead Graphic */}
                 <div className="w-[80px] h-[100px] sm:w-40 sm:h-48 bg-gradient-to-b from-[#888] to-[#666] rounded-t-2xl rounded-b-md shadow-2xl border border-[#999] relative flex flex-col items-center">
                    <div className="w-full h-4 sm:h-10 bg-[#444] rounded-t-2xl opacity-80 flex justify-center gap-1 sm:gap-3 pt-1 sm:pt-3">
                       <div className="w-1 sm:w-2 h-2 sm:h-5 bg-[#222] rounded-sm"></div>
                       <div className="w-1 sm:w-2 h-2 sm:h-5 bg-[#222] rounded-sm"></div>
                       <div className="w-1 sm:w-2 h-2 sm:h-5 bg-[#222] rounded-sm"></div>
                       <div className="w-1 sm:w-2 h-2 sm:h-5 bg-[#222] rounded-sm"></div>
                    </div>
                    <div className="text-[#333] font-bold text-[6px] sm:text-[10px] mt-1 sm:mt-2 opacity-60 tracking-widest">Bambu Lab</div>
                    <div className="w-8 h-8 sm:w-20 sm:h-20 bg-[#222] rounded-full border-2 sm:border-4 border-[#555] mt-1 sm:mt-4 flex items-center justify-center shadow-inner">
                       <div className="w-4 h-4 sm:w-12 sm:h-12 bg-[#111] rounded-full"></div>
                    </div>
                    <div className="absolute bottom-0 w-full h-4 sm:h-8 bg-[#333] flex justify-center items-end pb-0.5 sm:pb-1 rounded-b-md">
                       <div className="w-0 h-0 border-l-[4px] sm:border-l-[8px] border-l-transparent border-r-[4px] sm:border-r-[8px] border-r-transparent border-t-[6px] sm:border-t-[10px] border-t-white"></div>
                    </div>
                 </div>
              </div>
           </div>
             
             <p className="text-[#a0a0a0] text-sm text-center leading-relaxed">
               It is recommended to use Standard Mode.<br/>
               Sport Mode and Ludicrous Mode can increase<br/>
               the print speed but may affect quality.
             </p>
                <div className="flex-1 flex flex-col justify-center gap-2 sm:gap-4 px-2 sm:px-8 max-w-[340px]">
             <button 
                className={`w-full py-2 sm:py-4 rounded-xl font-normal text-sm sm:text-lg transition-colors ${speedLvl === 4 ? 'bg-[#a3ff00] text-black shadow-[0_0_15px_rgba(163,255,0,0.2)]' : 'bg-[#404040] text-[#e0e0e0] hover:bg-[#505050]'}`}
                onClick={() => { controlSpeed?.(4); closeModal(); }}
             >
                Ludicrous (166%)
             </button>
             <button 
                className={`w-full py-2 sm:py-4 rounded-xl font-normal text-sm sm:text-lg transition-colors ${speedLvl === 3 ? 'bg-[#a3ff00] text-black shadow-[0_0_15px_rgba(163,255,0,0.2)]' : 'bg-[#404040] text-[#e0e0e0] hover:bg-[#505050]'}`}
                onClick={() => { controlSpeed?.(3); closeModal(); }}
             >
                Sport (124%)
             </button>
             <button 
                className={`w-full py-2 sm:py-4 rounded-xl font-normal text-sm sm:text-lg transition-colors ${speedLvl === 2 || !speedLvl ? 'bg-[#a3ff00] text-black shadow-[0_0_15px_rgba(163,255,0,0.2)]' : 'bg-[#404040] text-[#e0e0e0] hover:bg-[#505050]'}`}
                onClick={() => { controlSpeed?.(2); closeModal(); }}
             >
                Standard (100%)
             </button>
             <button 
                className={`w-full py-2 sm:py-4 rounded-xl font-normal text-sm sm:text-lg transition-colors ${speedLvl === 1 ? 'bg-[#a3ff00] text-black shadow-[0_0_15px_rgba(163,255,0,0.2)]' : 'bg-[#404040] text-[#e0e0e0] hover:bg-[#505050]'}`}
                onClick={() => { controlSpeed?.(1); closeModal(); }}
             >
                Silent (50%)
             </button>
           </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex w-full h-full p-3 gap-3 bg-[#0f1011] overflow-hidden relative">
      
      {activeModal === 'nozzle' || activeModal === 'bed' ? renderTempModal() : null}
      {activeModal === 'fan' ? renderFanModal() : null}
      {activeModal === 'motion' ? renderMotionModal() : null}
      {activeModal === 'speed' ? renderSpeedModal() : null}

            {/* Left Column: Temperatures & Air Condition */}
      <div className="w-[32%] flex flex-col gap-2 h-full">
        
        {/* Air Condition */}
        <div onClick={() => openModal('fan')} className="flex-[1] min-h-0 bg-[#2b2b2d] rounded-[12px] px-3 py-1.5 flex justify-between items-center cursor-pointer hover:bg-[#353535] transition-colors relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0] shrink-0">
              <Wind size={16} className="xl:w-5 xl:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#a0a0a0] text-[10px] xl:text-xs">Air Condition</span>
              <span className="text-white font-medium text-sm xl:text-base leading-tight mt-0.5">Cooling</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#555] xl:w-5 xl:h-5 shrink-0" />
        </div>

        {/* Nozzle & Extruder */}
        <div onClick={() => openModal('nozzle', nozzleTarget)} className="flex-[1.2] min-h-0 bg-[#2b2b2d] rounded-[12px] px-3 py-1.5 flex flex-col justify-center cursor-pointer hover:bg-[#353535] transition-colors relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0] shrink-0">
              <svg viewBox="0 0 24 24" width="16" height="16" className="xl:w-5 xl:h-5" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 2v6"/><path d="M9 8h6l-1.5 3h-3L9 8z"/><path d="M9 14c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/><path d="M9 18c0 1.5.5 2 1.5 2s2-.5 3-2" strokeDasharray="2 2"/></svg>
            </div>
            <span className="text-[#a0a0a0] text-[10px] xl:text-xs">Nozzle & Extruder</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 bg-[#3a3a3c] w-max px-2 py-1 rounded-lg border border-[#444]">
            <div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full border border-gray-400 flex items-center justify-center shrink-0">
              <div className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-white"></div>
            </div>
            <span className="text-white font-medium text-xs xl:text-sm">{nozzleTemp}°C / {nozzleTarget}°C</span>
          </div>
          <ChevronRight size={16} className="text-[#555] xl:w-5 xl:h-5 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Chamber */}
        <div className="flex-[1] min-h-0 bg-[#2b2b2d] rounded-[12px] px-3 py-1.5 flex flex-col justify-center cursor-pointer hover:bg-[#353535] transition-colors relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0] shrink-0">
              <svg viewBox="0 0 24 24" width="16" height="16" className="xl:w-5 xl:h-5" stroke="currentColor" strokeWidth="2" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            </div>
            <span className="text-[#a0a0a0] text-[10px] xl:text-xs">Chamber</span>
          </div>
          <span className="text-white font-medium text-lg xl:text-xl mt-0.5 ml-[40px] xl:ml-[48px] leading-none">{chamberTemp}°C</span>
        </div>

        {/* Heatbed */}
        <div onClick={() => openModal('bed', bedTarget)} className="flex-[1] min-h-0 bg-[#2b2b2d] rounded-[12px] px-3 py-1.5 flex flex-col justify-center cursor-pointer hover:bg-[#353535] transition-colors relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0] shrink-0">
              <svg viewBox="0 0 24 24" width="16" height="16" className="xl:w-5 xl:h-5" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 18h16"/><path d="M6 14h12"/><path d="M8 10h8"/><path d="M12 6v-4"/><path d="M10 2h4"/></svg>
            </div>
            <span className="text-[#a0a0a0] text-[10px] xl:text-xs">Heatbed</span>
          </div>
          <span className="text-white font-medium text-sm xl:text-base mt-0.5 ml-[40px] xl:ml-[48px] leading-none">{bedTemp}°C / {bedTarget}°C</span>
          <ChevronRight size={16} className="text-[#555] xl:w-5 xl:h-5 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

      </div>

      {/* Right Column: Speed, Motion, Printer Graphic & Light */}
      <div className="w-[68%] flex flex-col gap-2 h-full">
        
        {/* Top Row: Speed and Motion */}
        <div className="flex gap-2 h-[22%] shrink-0">
          {/* Speed */}
          <div onClick={() => openModal('speed')} className="flex-1 min-h-0 bg-[#2b2b2d] rounded-[12px] px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-[#353535] transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0] shrink-0">
                <svg viewBox="0 0 24 24" width="16" height="16" className="xl:w-5 xl:h-5" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[#a0a0a0] text-[10px] xl:text-xs">Speed</span>
                <span className="text-white font-medium text-sm xl:text-base leading-tight mt-0.5">
                  {speedLvl === 1 ? 'Silent' : speedLvl === 3 ? 'Sport' : speedLvl === 4 ? 'Ludicrous' : 'Standard'}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#555] xl:w-5 xl:h-5 shrink-0" />
          </div>

          {/* Motion */}
          <div onClick={() => openModal('motion')} className="flex-1 min-h-0 bg-[#2b2b2d] rounded-[12px] px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-[#353535] transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[#d0d0d0] shrink-0">
                <svg viewBox="0 0 24 24" width="16" height="16" className="xl:w-5 xl:h-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6L12 2L16 6" />
                  <path d="M8 18L12 22L16 18" />
                  <path d="M6 8L2 12L6 16" />
                  <path d="M18 8L22 12L18 16" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[#a0a0a0] text-[10px] xl:text-xs leading-tight">Motion</span>
                <span className="text-white font-medium text-sm xl:text-base leading-tight mt-0.5">XYZ</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#555] xl:w-5 xl:h-5 shrink-0" />
          </div>
        </div>

        {/* Camera Area */}
        <div className="flex-[1] min-h-0 bg-[#1b1b1d] rounded-[12px] relative overflow-hidden flex items-center justify-center">
          <CameraView className="absolute inset-0 w-full h-full" />

          {/* Light Toggle button at bottom right */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
             <span className="text-white font-medium text-sm xl:text-base flex items-center gap-1.5">
               <Lightbulb size={16} className={chamberLight ? "text-[#00e676] xl:w-5 xl:h-5" : "text-[#555] xl:w-5 xl:h-5"} />
               Light
             </span>
             <div onClick={onControlLight} className={`w-10 h-6 xl:w-12 xl:h-7 rounded-full p-1 cursor-pointer relative shadow-lg transition-colors ${chamberLight ? 'bg-[#00e676]' : 'bg-[#3a3a3c]'}`}>
                <div className={`w-4 h-4 xl:w-5 xl:h-5 bg-white rounded-full absolute top-1 shadow-sm flex items-center justify-center transition-all ${chamberLight ? 'right-1' : 'left-1'}`}>
                  {chamberLight && <Check size={12} className="text-[#00e676]" strokeWidth={3} />}
                </div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
}
