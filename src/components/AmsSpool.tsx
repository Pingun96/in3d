import React from 'react';
import { Eye, Edit2 } from 'lucide-react';

interface AmsSpoolProps {
  color: string;
  type: string;
  isActive?: boolean;
  isEmpty?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  idLabel?: string;
  brand?: string;
  remaining?: number;
}

export function AmsSpool({ color, type, isEmpty, onClick, idLabel, remaining = 100 }: AmsSpoolProps) {
  // P2S colors and styling
  const spoolWidth = 64;
  const spoolHeight = 110;
  const activeColor = isEmpty ? '#333333' : color;
  const labelText = isEmpty ? 'EMPTY' : type;

  return (
    <div className="flex flex-col items-center relative group" onClick={onClick}>
      {/* Top Label & Line */}
      <div className="flex flex-col items-center mb-1 w-full relative">
        <span className="text-[#e0e0e0] text-[10px] font-medium tracking-wide">{labelText}</span>
        {/* Horizontal gauge bar */}
        <div className="w-8 h-[3px] bg-[#333] rounded-full mt-1 overflow-hidden">
          {!isEmpty && <div className="h-full bg-white" style={{ width: `${remaining}%` }}></div>}
        </div>
        {/* Dotted vertical line */}
        <div className="w-[1px] h-6 border-l-2 border-dotted border-[#666] mt-1"></div>
      </div>

      {/* Spool 3D Graphic */}
      <div 
        className="relative cursor-pointer transition-transform active:scale-95"
        style={{ width: spoolWidth, height: spoolHeight }}
      >
        <svg viewBox="0 0 64 110" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            {/* Filament Gradient */}
            <linearGradient id={`filGrad-${idLabel}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.8" />
              <stop offset="30%" stopColor={activeColor} />
              <stop offset="70%" stopColor={activeColor} />
              <stop offset="100%" stopColor="#111" stopOpacity="0.9" />
            </linearGradient>
            
            {/* Dark Rim Gradient */}
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#222" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>

          {/* Back rim (right side) */}
          <ellipse cx="44" cy="55" rx="14" ry="52" fill="url(#rimGrad)" />
          
          {/* Filament block (middle) */}
          <path d="M 20 5 L 44 3 L 44 107 L 20 105 Z" fill={`url(#filGrad-${idLabel})`} />
          <ellipse cx="44" cy="55" rx="12" ry="46" fill="#111" opacity="0.5" />
          
          {/* Front rim (left side) */}
          <ellipse cx="20" cy="55" rx="16" ry="55" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
          
          {/* Front Rim Inner hole */}
          <ellipse cx="20" cy="55" rx="4" ry="14" fill="#000" />
          <ellipse cx="21" cy="55" rx="2" ry="12" fill="#111" />
          
          {/* Lower Grey Label Band on front rim */}
          <path d="M 6 80 Q 20 86 34 80 L 32 105 Q 20 110 8 105 Z" fill="#444" opacity="0.8" />
        </svg>

        {/* Text and Icons inside the lower band */}
        <div className="absolute bottom-2 left-0 w-10 h-10 flex flex-col items-center justify-center translate-x-1">
          <span className="text-[#e0e0e0] text-[11px] font-bold z-10">{idLabel}</span>
          <div className="text-[#a0a0a0] z-10 mt-0.5">
            {isEmpty ? (
              <Edit2 size={10} strokeWidth={2.5} />
            ) : (
              <Eye size={12} strokeWidth={2.5} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
