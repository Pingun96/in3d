import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Settings, X, Wrench, ChevronLeft, ChevronDown, Pencil, Plus, Edit2, Trash2, Link as LinkIcon, Unlink } from 'lucide-react';
import { useInventory, type FilamentSpool } from '../context/InventoryContext';

interface FilamentScreenProps {
  amsList: any[];
  activeTrayId: number | null;
  loadAmsFilament: (tray: number) => void;
  handleLoadFilament: () => void;
  handleUnloadFilament: () => void;
  machineStatus: string;
  vtTray?: any;
  editAmsFilament: (amsId: number, trayId: number, type: string, color: string) => void;
}

export function FilamentScreen({
  amsList,
  activeTrayId,
  vtTray,
  loadAmsFilament,
  handleLoadFilament,
  handleUnloadFilament,
  machineStatus,
  editAmsFilament
}: FilamentScreenProps) {
  
  const { spools, addSpool, updateSpool, deleteSpool, assignToAms, getSpoolByAmsSlot } = useInventory();
  
  const [selectedTray, setSelectedTray] = useState<number | null>(null);

  // Safely parse activeTrayId
  const currentActiveTray = activeTrayId !== null && activeTrayId !== undefined ? Number(activeTrayId) : null;

  // Extract trays from amsList
  let trays: any[] = [];
  if (amsList && amsList.length > 0) {
    trays = amsList[0].tray || [];
  }

  const displayTrays = [0, 1, 2, 3].map(i => {
    const existingTray = trays.find(t => parseInt(t.id) === i);
    return existingTray || { id: i.toString(), empty: true };
  });

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const spoolRefs = useRef<(HTMLDivElement | null)[]>([]);
  const extRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({
    a1: 51, a2: 117, a3: 183, a4: 249, ext: 414, intersect: 271
  });

  useEffect(() => {
    // Wait for layout to settle then calculate exact sub-pixel centers
    const calculateCoords = () => {
      if (svgContainerRef.current && extRef.current && spoolRefs.current.length === 4) {
        const svgRect = svgContainerRef.current.getBoundingClientRect();
        
        const getCenter = (el: HTMLElement | null) => {
          if (!el) return 0;
          const rect = el.getBoundingClientRect();
          const scale = svgRect.width / svgContainerRef.current!.offsetWidth;
          return (rect.left + (rect.width / 2) - svgRect.left) / scale;
        };

        const a1 = getCenter(spoolRefs.current[0]);
        const a2 = getCenter(spoolRefs.current[1]);
        const a3 = getCenter(spoolRefs.current[2]);
        const a4 = getCenter(spoolRefs.current[3]);
        const ext = getCenter(extRef.current);
        
        // Place the intersection slightly to the right of A4
        const intersect = a4 + 22;

        setCoords({ a1, a2, a3, a4, ext, intersect });
      }
    };

    calculateCoords();
    window.addEventListener('resize', calculateCoords);
    return () => window.removeEventListener('resize', calculateCoords);
  }, []);

  // Determine active color
  let activeColor = "#ffffff";
  if (currentActiveTray !== null) {
    if (currentActiveTray === 254) {
      if (vtTray && vtTray.tray_color) {
        activeColor = `#${vtTray.tray_color.substring(0,6)}`;
      } else {
        activeColor = "#ffffff";
      }
    } else {
      const activeTrayData = displayTrays.find(t => parseInt(t.id) === currentActiveTray);
      if (activeTrayData && activeTrayData.tray_color) {
         activeColor = `#${activeTrayData.tray_color.substring(0,6)}`;
      }
    }
  }

  const [popupPos, setPopupPos] = useState<{x: number, y: number} | null>(null);

  const openTrayModal = (trayId: number, e: React.MouseEvent) => {
    setSelectedTray(trayId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Save position relative to viewport
    setPopupPos({ x: rect.left, y: rect.bottom });
  };
  
  const closeTrayModal = () => {
    setSelectedTray(null);
    setPopupPos(null);
  };

  const [editingTrayId, setEditingTrayId] = useState<number | null>(null);
  const [editBrand, setEditBrand] = useState("Generic");
  const [editType, setEditType] = useState("PLA Basic");
  const [editColor, setEditColor] = useState("#a67c00");

  const openEditModal = (trayId: number) => {
    setEditingTrayId(trayId);
    
    let trayData = null;
    if (trayId === 254) {
      trayData = vtTray;
    } else {
      trayData = displayTrays.find(t => parseInt(t.id) === trayId);
    }
    
    if (trayData && !trayData.empty) {
      setEditBrand(trayData.tray_sub_brands || "Generic");
      setEditType(trayData.tray_type || "PLA Basic");
      setEditColor(trayData.tray_color ? `#${trayData.tray_color.substring(0,6)}` : "#a67c00");
    } else {
      setEditBrand("Generic");
      setEditType("PLA Basic");
      setEditColor("#a67c00");
    }
    closeTrayModal();
  };
  
  const closeEditModal = () => setEditingTrayId(null);

  const renderTrayModal = () => {
    if (!popupPos || selectedTray === null) return null;
    
    const isAms = selectedTray !== 254;
    const isActive = currentActiveTray === selectedTray;

    // Calculate left position (default to left of spool)
    // The menu is ~140px wide. Spool is 60px wide.
    let leftPos = popupPos.x - 140; 
    if (leftPos < 10) leftPos = popupPos.x + 70; // if too close to left edge, show on right

    return (
      <div className="fixed inset-0 z-50" onClick={closeTrayModal}>
         <div 
           className="absolute bg-[#383838] rounded-xl p-2.5 flex flex-col gap-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#4a4a4a] min-w-[140px]"
           style={{ left: `${leftPos}px`, top: `${popupPos.y - 100}px` }}
           onClick={(e) => e.stopPropagation()}
         >
           <button 
             className="w-full bg-[#555] hover:bg-[#666] active:bg-[#777] text-[#f0f0f0] font-normal py-2.5 px-4 rounded-lg transition-colors text-[18px]" 
             onClick={() => {
               openEditModal(selectedTray);
             }}>
             Edit
           </button>
           
           <button 
             className="w-full bg-[#555] hover:bg-[#666] active:bg-[#777] text-[#f0f0f0] font-normal py-2.5 px-4 rounded-lg transition-colors text-[18px]" 
             onClick={() => {
               if (isActive) {
                 handleUnloadFilament();
               } else {
                 if (isAms) {
                   loadAmsFilament(selectedTray);
                 } else {
                   handleLoadFilament();
                 }
               }
               closeTrayModal();
             }}>
             {isActive ? 'Unload' : 'Load'}
           </button>

           {isAms && (
             <button 
               className="w-full bg-[#555] hover:bg-[#666] active:bg-[#777] text-[#f0f0f0] font-normal py-2.5 px-4 rounded-lg transition-colors text-[18px]" 
               onClick={() => {
                 closeTrayModal();
               }}>
               Re-Read
             </button>
           )}
         </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (editingTrayId === null) return null;
    const isBambuFilament = false; // Always allow editing

    return (
      <div className="absolute inset-0 bg-[#222] z-50 flex flex-col">
         <div className="flex items-center p-4 pb-2">
            <button className="text-[#a0a0a0] hover:text-white mr-4" onClick={closeEditModal}>
               <ChevronLeft size={28} />
            </button>
            <h2 className="text-white text-xl font-normal">Edit Filament</h2>
         </div>

         <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex justify-center">
            <div className="bg-[#2a2a2b] rounded-xl p-3 sm:p-5 w-full max-w-2xl shadow-lg border border-[#3a3a3c] flex flex-col justify-between">
               
               <div>
                 {/* Filament */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-5 gap-2 sm:gap-3">
                    <div className="text-[#e0e0e0] text-sm sm:text-[17px] w-auto sm:w-36">Filament</div>
                    <div className="flex-1 flex flex-col">
                       <div className="flex gap-3 w-full">
                          <div className={`relative flex-1 rounded-lg border ${isBambuFilament ? 'bg-[#333] border-[#444] opacity-80' : 'bg-[#383838] border-[#4a4a4a] hover:bg-[#404040]'}`}>
                             <select 
                               disabled={isBambuFilament}
                               value={editBrand}
                               onChange={(e) => setEditBrand(e.target.value)}
                               className="w-full appearance-none bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-[#e0e0e0] text-xs sm:text-[15px] focus:outline-none disabled:text-[#888] cursor-pointer disabled:cursor-not-allowed"
                             >
                               <option value="Bambu Lab">Bambu Lab</option>
                               <option value="Generic">Generic</option>
                               <option value="Polymaker">Polymaker</option>
                               <option value="eSUN">eSUN</option>
                             </select>
                             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                               <ChevronDown size={18} className={isBambuFilament ? 'text-[#666]' : 'text-[#a0a0a0]'} />
                             </div>
                          </div>
                          <div className={`relative flex-1 rounded-lg border ${isBambuFilament ? 'bg-[#333] border-[#444] opacity-80' : 'bg-[#383838] border-[#4a4a4a] hover:bg-[#404040]'}`}>
                             <select 
                               disabled={isBambuFilament}
                               value={editType}
                               onChange={(e) => setEditType(e.target.value)}
                               className="w-full appearance-none bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-[#e0e0e0] text-xs sm:text-[15px] focus:outline-none disabled:text-[#888] cursor-pointer disabled:cursor-not-allowed"
                             >
                               <option value="PLA Basic">PLA Basic</option>
                               <option value="PLA Matte">PLA Matte</option>
                               <option value="PETG Basic">PETG Basic</option>
                               <option value="ABS">ABS</option>
                               <option value="TPU">TPU</option>
                             </select>
                             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                               {isBambuFilament ? <ChevronDown size={18} className="text-[#666]" /> : <Pencil size={15} className="text-[#a0a0a0]" />}
                             </div>
                          </div>
                       </div>
                       {isBambuFilament && (
                          <span className="text-[#888] text-[11px] mt-1.5 ml-1">Filament SN: 9355383900000100</span>
                       )}
                    </div>
                 </div>

                 {/* Color */}
                 <div className="flex items-center justify-between mb-2 sm:mb-5 mt-2 sm:mt-0">
                    <div className="text-[#e0e0e0] text-sm sm:text-[17px] w-auto sm:w-36">Color</div>
                    <div className="flex-1 flex justify-start">
                       <label className={`flex items-center gap-3 ${!isBambuFilament ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <div className="w-8 h-8 rounded-md shadow-sm border border-[#222]" style={{ backgroundColor: editColor }}></div>
                          {!isBambuFilament && (
                            <>
                              <Pencil size={16} className="text-[#a0a0a0]" />
                              <input type="color" className="hidden" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                            </>
                          )}
                       </label>
                    </div>
                 </div>

                 {/* Nozzle Temp */}
                 <div className="flex items-center justify-between mb-2 sm:mb-5">
                    <div className="text-[#e0e0e0] text-sm sm:text-[17px] w-auto sm:w-36">Nozzle Temperature</div>
                    <div className="flex-1 flex justify-end sm:justify-start gap-4 sm:gap-6 text-[#d0d0d0] text-xs sm:text-[15px]">
                       <div>Min <span className="font-bold text-white">190 °C</span></div>
                       <div>Max <span className="font-bold text-white">{isBambuFilament ? '230' : '240'} °C</span></div>
                    </div>
                 </div>

                 {/* Dynamic Pressure */}
                 <div className="flex items-center justify-between mb-1 sm:mb-3">
                    <div className="text-[#e0e0e0] text-sm sm:text-[17px] w-auto sm:w-36 leading-snug">Dynamic Pressure</div>
                    <div className="flex-1 flex justify-end sm:justify-start">
                       <div className="bg-[#383838] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center justify-between min-w-[100px] sm:min-w-[140px] border border-[#4a4a4a] cursor-pointer hover:bg-[#404040]">
                          <span className="text-[#e0e0e0] text-xs sm:text-[15px]">Default</span>
                          <ChevronDown size={18} className="text-[#a0a0a0]" />
                       </div>
                    </div>
                 </div>
               </div>

               {/* Footer / Info & Buttons */}
               <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-[#333]">
                  {isBambuFilament ? (
                    <div className="text-[#f44336] text-[10px] sm:text-[13px] max-w-[200px] sm:max-w-[260px] leading-snug p-1.5 sm:p-2 bg-[#2a1111] bg-opacity-30 rounded-md">
                       Information about Bambu Filament is stored in RFID and is read-only.
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <div className="flex gap-2 sm:gap-3">
                     <button className="px-4 sm:px-6 py-1.5 sm:py-2.5 bg-[#404040] hover:bg-[#505050] text-[#e0e0e0] rounded-lg font-medium transition-colors text-xs sm:text-[15px]" onClick={closeEditModal}>
                        Cancel
                     </button>
                     <button 
                        className="px-4 sm:px-6 py-1.5 sm:py-2.5 bg-[#a3ff00] hover:bg-[#b0ff22] text-black rounded-lg font-medium transition-colors shadow-lg text-xs sm:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={isBambuFilament}
                        onClick={() => {
                           if (!isBambuFilament && editingTrayId !== null) {
                              const amsId = editingTrayId === 254 ? 255 : 0; // usually 0 for AMS, 255 for VT
                              const trayId = editingTrayId === 254 ? 254 : editingTrayId;
                              editAmsFilament(amsId, trayId, `${editBrand} ${editType}`, editColor);
                           }
                           closeEditModal();
                        }}
                     >
                        Confirm
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  };

  const Spool = React.forwardRef(({ color, label, material, isActive, isEmpty, onClick, lineLength = 20, remaining }: any, ref: any) => (
    <div ref={ref} className="flex flex-col items-center relative cursor-pointer group" onClick={onClick}>
      {/* Dashed line and Material text */}
      <div className="flex flex-col items-center mb-1 w-full">
        <span className="text-[#a0a0a0] text-[11px] font-bold tracking-wider h-4 whitespace-nowrap">{isEmpty ? '' : material}</span>
        {/* Remaining Bar */}
        {remaining !== undefined && !isEmpty && (
          <div className="w-8 h-[3px] bg-[#333] rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${remaining}%` }}></div>
          </div>
        )}
        <div className="h-4 w-px border-l-2 border-dashed border-[#555] my-1"></div>
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
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 z-0" style={{ backgroundColor: color, bottom: `-${lineLength}px`, height: `${lineLength}px` }}></div>
        )}
      </div>
    </div>
  ));

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#111] overflow-y-auto relative">
      
      {renderTrayModal()}
      {renderEditModal()}

      {/* AMS Visualizer Section */}
      <div className="relative flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] scale-[0.85] sm:scale-100 origin-top mt-4 sm:mt-12">
        
        <div className="flex relative z-10">
          
          {/* AMS Container */}
          <div className="relative border border-[#2b2b2b] rounded-[24px] p-[20px] flex bg-gradient-to-b from-[#1b1b1d] to-[#111] shadow-2xl">
             
             {/* 4 Spools */}
             <div className="flex gap-[6px]">
               {displayTrays.map((tray, idx) => {
                 const trayIdNum = parseInt(tray.id);
                 const isActive = currentActiveTray === trayIdNum;
                 const isEmpty = tray.empty || !tray.tray_info_idx;
                 const colorHex = tray.tray_color ? `#${tray.tray_color.substring(0,6)}` : '#ffffff';
                 const material = tray.tray_sub_brands ? tray.tray_sub_brands : (tray.tray_type || 'PLA');
                 
                 const inventorySpool = getSpoolByAmsSlot(trayIdNum);
                 const remainingPercent = inventorySpool ? (inventorySpool.remainingWeight / inventorySpool.totalWeight) * 100 : undefined;
                 
                 return (
                   <Spool 
                     key={idx}
                     ref={(el: HTMLDivElement | null) => { spoolRefs.current[idx] = el; }}
                     label={`A${idx + 1}`}
                     color={colorHex}
                     material={material}
                     isActive={isActive}
                     isEmpty={isEmpty}
                     lineLength={21}
                     remaining={remainingPercent}
                     onClick={(e: React.MouseEvent) => { if (!isEmpty) openTrayModal(trayIdNum, e); }}
                   />
                 );
               })}
             </div>
             
             {/* Humidity Indicator */}
             <div className="w-[36px] bg-[#0a0a0a] rounded-full flex flex-col items-center justify-between py-3 border border-[#222] ml-[16px]">
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
          <div className="ml-[32px] mt-[20px]">
             <Spool 
               ref={extRef}
               label="Ext"
               color={vtTray && vtTray.tray_color ? `#${vtTray.tray_color.substring(0,6)}` : "#ffffff"}
               material={vtTray && vtTray.tray_sub_brands ? vtTray.tray_sub_brands : (vtTray?.tray_type || 'PLA')}
               isActive={currentActiveTray === 254}
               isEmpty={false}
               lineLength={22}
               remaining={getSpoolByAmsSlot(254) ? (getSpoolByAmsSlot(254)!.remainingWeight / getSpoolByAmsSlot(254)!.totalWeight) * 100 : undefined}
               onClick={(e: React.MouseEvent) => openTrayModal(254, e)}
             />
          </div>
          
        </div>

        {/* Connection Lines & Toolhead */}
        <div ref={svgContainerRef} className="relative w-full max-w-[444px] h-[100px] mt-0">
           {/* SVG lines to match the layout perfectly */}
           <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              {/* Common AMS horizontal bus */}
              <path d={`M ${coords.a1} 0 L ${coords.a1} 20 L ${coords.intersect} 20 L ${coords.intersect} 40`} fill="none" stroke="#333" strokeWidth="2.5" strokeLinejoin="round" />
              <path d={`M ${coords.a2} 0 L ${coords.a2} 20`} fill="none" stroke="#333" strokeWidth="2.5" />
              <path d={`M ${coords.a3} 0 L ${coords.a3} 20`} fill="none" stroke="#333" strokeWidth="2.5" />
              <path d={`M ${coords.a4} 0 L ${coords.a4} 20`} fill="none" stroke="#333" strokeWidth="2.5" />
              
              {/* External Spool line going down and left */}
              <path d={`M ${coords.ext} 0 L ${coords.ext} 40 L ${coords.intersect} 40 L ${coords.intersect} 80`} fill="none" stroke={currentActiveTray === 254 ? activeColor : "#333"} strokeWidth="4" strokeLinejoin="round" />
              
              {/* Highlight active AMS line */}
              {currentActiveTray === 0 && <path d={`M ${coords.a1} 0 L ${coords.a1} 20 L ${coords.intersect} 20 L ${coords.intersect} 80`} fill="none" stroke={activeColor} strokeWidth="4" strokeLinejoin="round" />}
              {currentActiveTray === 1 && <path d={`M ${coords.a2} 0 L ${coords.a2} 20 L ${coords.intersect} 20 L ${coords.intersect} 80`} fill="none" stroke={activeColor} strokeWidth="4" strokeLinejoin="round" />}
              {currentActiveTray === 2 && <path d={`M ${coords.a3} 0 L ${coords.a3} 20 L ${coords.intersect} 20 L ${coords.intersect} 80`} fill="none" stroke={activeColor} strokeWidth="4" strokeLinejoin="round" />}
              {currentActiveTray === 3 && <path d={`M ${coords.a4} 0 L ${coords.a4} 20 L ${coords.intersect} 20 L ${coords.intersect} 80`} fill="none" stroke={activeColor} strokeWidth="4" strokeLinejoin="round" />}
           </svg>
           
           {/* Toolhead Icon (Extruder) */}
           <div className="absolute top-[75px] w-[36px] h-[44px] bg-gradient-to-b from-[#b0b0b0] to-[#888] rounded-md shadow-2xl flex flex-col items-center p-1 border border-[#666]" style={{ left: `${coords.intersect - 18}px` }}>
              <div className="w-[10px] h-[4px] bg-[#333] rounded-sm mb-1"></div>
              <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-[#555]" style={{ backgroundColor: currentActiveTray !== null ? activeColor : '#111' }}>
                 <div className="w-[6px] h-[6px] rounded-full bg-black/40"></div>
              </div>
              <div className="w-[8px] h-[6px] bg-[#444] rounded-sm mt-1"></div>
           </div>
        </div>

      </div>

      {/* Inventory Section */}
      <div className="w-full max-w-4xl mx-auto px-4 mt-8 pb-24">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Kho Nhựa Của Bạn</h3>
            <p className="text-[#a0a0a0] text-sm mt-1">Hệ thống sẽ tự động trừ hao khi in xong</p>
          </div>
          <button 
            onClick={() => {
              const name = prompt('Nhập tên cuộn nhựa mới (vd: PLA Đỏ eSun):');
              if (name) {
                const total = prompt('Tổng trọng lượng (g):', '1000');
                if (total) {
                  addSpool({
                    name, brand: 'Generic', type: 'PLA', color: '#ff0000', totalWeight: Number(total), remainingWeight: Number(total), amsAssigned: null
                  });
                }
              }
            }}
            className="bg-[#00c853] hover:bg-[#00e676] text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-[#00c853]/20"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spools.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-[#1a1a1b] rounded-2xl border border-white/5">
              <p className="text-[#666] mb-4">Kho nhựa đang trống</p>
            </div>
          ) : (
            spools.map(spool => (
              <div key={spool.id} className="bg-[#1a1a1b] rounded-2xl p-4 border border-white/5 relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full border-2 border-white/10 shadow-inner flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: spool.color, color: parseInt(spool.color.replace('#', ''), 16) > 0x888888 ? '#000' : '#FFF' }}
                    >
                      {spool.type}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold truncate pr-4 text-sm">{spool.name}</h3>
                      <p className="text-[#888] text-xs">{spool.brand}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if(window.confirm('Xoá cuộn nhựa này?')) deleteSpool(spool.id);
                    }}
                    className="p-1.5 text-[#888] hover:text-[#ff5252] bg-[#2a2a2b] rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-2 flex-1">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#a0a0a0]">Còn lại</span>
                    <span className="text-white font-medium">
                      {Math.round(spool.remainingWeight)}g / {spool.totalWeight}g
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#333] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (spool.remainingWeight / spool.totalWeight) * 100))}%`,
                        backgroundColor: spool.color 
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  {spool.amsAssigned !== null ? (
                    <div className="flex items-center gap-2 text-[#00c853] text-[12px] font-medium">
                      <LinkIcon size={14} />
                      <span>Khay {spool.amsAssigned === 254 ? 'Ext' : spool.amsAssigned + 1}</span>
                      <button onClick={() => assignToAms(spool.id, null)} className="ml-1 text-[#888] hover:text-[#ff5252]">
                        <Unlink size={14} />
                      </button>
                    </div>
                  ) : (
                    <select 
                      className="text-[12px] bg-[#2a2a2b] text-white border border-white/10 rounded px-2 py-1 outline-none focus:border-[#00c853]"
                      onChange={(e) => assignToAms(spool.id, e.target.value ? Number(e.target.value) : null)}
                      value=""
                    >
                      <option value="">Gán vào khay...</option>
                      <option value="0">Khay A1</option>
                      <option value="1">Khay A2</option>
                      <option value="2">Khay A3</option>
                      <option value="3">Khay A4</option>
                      <option value="254">Khay Ext</option>
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
