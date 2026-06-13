import * as fs from 'fs';

const content = fs.readFileSync('src/components/ControlScreen.tsx', 'utf-8');
const startStr = "{/* Left Column: Temperatures & Air Condition */}";
const startIdx = content.indexOf(startStr);

const newTail = `      {/* Left Column: Temperatures & Air Condition */}
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
          <span className="text-[#555]">LIVE VIEW</span>

          {/* Light Toggle button at bottom right */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
             <span className="text-white font-medium text-sm xl:text-base flex items-center gap-1.5">
               <Lightbulb size={16} className={chamberLight ? "text-[#00e676] xl:w-5 xl:h-5" : "text-[#555] xl:w-5 xl:h-5"} />
               Light
             </span>
             <div onClick={onControlLight} className={\`w-10 h-6 xl:w-12 xl:h-7 rounded-full p-1 cursor-pointer relative shadow-lg transition-colors \${chamberLight ? 'bg-[#00e676]' : 'bg-[#3a3a3c]'}\`}>
                <div className={\`w-4 h-4 xl:w-5 xl:h-5 bg-white rounded-full absolute top-1 shadow-sm flex items-center justify-center transition-all \${chamberLight ? 'right-1' : 'left-1'}\`}>
                  {chamberLight && <Check size={12} className="text-[#00e676]" strokeWidth={3} />}
                </div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
}
`;

const finalContent = content.substring(0, startIdx) + newTail;
fs.writeFileSync('src/components/ControlScreen.tsx', finalContent);
