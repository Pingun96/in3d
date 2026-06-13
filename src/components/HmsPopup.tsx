import React, { useState, useEffect } from 'react';
import { AlertTriangle, Play, Square, X } from 'lucide-react';
import { bambuBridge } from '../services/BambuBridge';

interface HmsPopupProps {
  hmsErrors: any[];
  serial: string;
}

export function HmsPopup({ hmsErrors, serial }: HmsPopupProps) {
  const [dismissedCodes, setDismissedCodes] = useState<Set<string>>(new Set());
  
  // Find the first error that hasn't been dismissed
  const activeError = hmsErrors.find(err => {
    const codeStr = err.code ? err.code.toString() : '';
    return codeStr && !dismissedCodes.has(codeStr);
  });

  if (!activeError) return null;

  const handleDismiss = () => {
    if (activeError.code) {
      setDismissedCodes(prev => {
        const next = new Set(prev);
        next.add(activeError.code.toString());
        return next;
      });
    }
  };

  const handleResume = () => {
    if (serial) {
      bambuBridge.resumePrint(serial);
    }
    handleDismiss();
  };

  const handleStop = () => {
    if (serial) {
      bambuBridge.stopPrint(serial);
    }
    handleDismiss();
  };

  const codeStr = activeError.code !== undefined ? activeError.code.toString(16).toUpperCase().padStart(8, '0') : 'UNKNOWN';
  const displayCode = `HMS_0300_${codeStr.substring(0, 4)}_${codeStr.substring(4)}`;
  const displayMsg = activeError.msg || 'Máy in báo lỗi (HMS Error). Vui lòng kiểm tra lại thiết bị.';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#2a2a2b] border border-[#ff5252] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#ff5252]/10 p-5 flex items-start gap-4 border-b border-[#ff5252]/20">
          <div className="bg-[#ff5252]/20 p-2 rounded-full mt-1">
            <AlertTriangle className="text-[#ff5252]" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-white text-lg font-medium mb-1 leading-snug">Cảnh Báo Lỗi</h3>
            <p className="text-[#ff5252] font-mono text-xs tracking-wider">{displayCode}</p>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 rounded-md text-[#888] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-[#d0d0d0] text-sm leading-relaxed mb-8">
            {displayMsg}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleResume}
              className="w-full flex items-center justify-center gap-2 bg-[#00e676] hover:bg-[#00c853] text-black font-medium py-3.5 rounded-xl transition-colors"
            >
              <Play size={20} fill="currentColor" />
              Tiếp tục in (Resume)
            </button>
            <button 
              onClick={handleStop}
              className="w-full flex items-center justify-center gap-2 bg-[#ff5252] hover:bg-[#e53935] text-white font-medium py-3.5 rounded-xl transition-colors"
            >
              <Square size={20} fill="currentColor" />
              Hủy in (Stop)
            </button>
            <button 
              onClick={handleDismiss}
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#555] hover:bg-[#333] text-[#aaa] font-medium py-3 rounded-xl transition-colors mt-1"
            >
              Đóng (Bỏ qua)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
