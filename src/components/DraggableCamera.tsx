import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Maximize2, Minimize2 } from 'lucide-react';

interface DraggableCameraProps {
  onClose: () => void;
  streamUrl?: string;
  isAiActive?: boolean;
}

export function DraggableCamera({ onClose, streamUrl, isAiActive }: DraggableCameraProps) {
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on the header to avoid blocking clicks on the video itself
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Keep within bounds
  useEffect(() => {
    if (!isDragging) {
      let newX = position.x;
      let newY = position.y;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const elW = isExpanded ? 320 : 200;
      const elH = isExpanded ? 240 : 150;
      
      if (newX < 0) newX = 0;
      if (newX + elW > w) newX = w - elW;
      if (newY < 0) newY = 0;
      if (newY + elH > h) newY = h - elH;
      
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isDragging, isExpanded, position]);

  return (
    <div 
      className={`fixed z-[100] bg-[#1e1e1e] border border-[#3a3a3c] rounded-lg shadow-2xl overflow-hidden flex flex-col transition-shadow ${isDragging ? 'opacity-90 shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-grabbing' : 'cursor-grab'}`}
      style={{ 
        left: position.x, 
        top: position.y,
        width: isExpanded ? '320px' : '200px',
        height: isExpanded ? '220px' : '150px'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Header (Drag Handle) */}
      <div className="bg-[#2a2a2b] h-8 flex items-center justify-between px-2 border-b border-[#3a3a3c] select-none">
         <div className="flex items-center gap-1.5 text-[#a0a0a0] text-xs font-medium">
           <Camera size={14} className="text-[#00e676]" />
           {isAiActive ? 'AI Camera' : 'Camera 1'}
         </div>
         <div className="flex gap-2 no-drag">
           <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-[#a0a0a0] hover:text-white">
             {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
           </button>
           <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-[#a0a0a0] hover:text-[#ff5252]">
             <X size={14} />
           </button>
         </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 bg-black relative flex items-center justify-center no-drag">
         {streamUrl ? (
           <img src={streamUrl} alt="Camera Stream" className="w-full h-full object-cover pointer-events-none" />
         ) : (
           <div className="text-[#555] flex flex-col items-center">
              <Camera size={isExpanded ? 40 : 24} className="mb-2" />
              <span className="text-[10px]">No Video Feed</span>
           </div>
         )}
         
         {isAiActive && (
           <div className="absolute inset-0 border-2 border-[#00e676]/30 pointer-events-none rounded"></div>
         )}
      </div>
    </div>
  );
}
