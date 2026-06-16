import React, { useEffect, useRef, useState } from 'react';
import * as GCodePreview from 'gcode-preview';

interface GCodeViewerProps {
  url?: string;
  onClose: () => void;
}

export function GCodeViewer({ url, onClose }: GCodeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canvasRef.current) return;

    let preview: any = null;

    const init = async () => {
      try {
        preview = GCodePreview.init({
          canvas: canvasRef.current!,
          lineWidth: 0.5,
          buildVolume: { x: 256, y: 256, z: 256 },
          initialCameraPosition: [100, 100, 100],
          allowDragNDrop: false,
          renderExtrusion: true,
          renderTravel: false,
          extrusionColor: '#00e676',
        });

        // Use a tiny demo cube gcode if url is not provided or fails to load
        const demoGCode = `
G28 ; Home
G1 Z5 F3000
G1 X100 Y100 F3000
G1 Z0.2
G1 E1 ; Prime
G1 X120 Y100 E2 F1500
G1 X120 Y120 E3
G1 X100 Y120 E4
G1 X100 Y100 E5
G1 Z0.4
G1 X120 Y100 E6
G1 X120 Y120 E7
G1 X100 Y120 E8
G1 X100 Y100 E9
G1 Z0.6
G1 X120 Y100 E10
G1 X120 Y120 E11
G1 X100 Y120 E12
G1 X100 Y100 E13
        `;

        if (url) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const text = await response.text();
              preview.processGCode(text);
            } else {
              throw new Error('G-code URL could not be fetched');
            }
          } catch (e) {
            // Fallback to demo
            console.log('Using demo GCode because URL failed');
            preview.processGCode(demoGCode);
          }
        } else {
          // Fallback to demo
          preview.processGCode(demoGCode);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('GCodePreview Error:', err);
        setError('Không thể khởi tạo trình xem 3D');
        setLoading(false);
      }
    };

    init();

    return () => {
      // Cleanup
      if (canvasRef.current) {
         // Some cleanup if library supports it, or just remove references
      }
    };
  }, [url]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-[#2a2a2b] p-4 border-b border-[#3a3a3c]">
           <h3 className="text-white font-medium flex items-center gap-2">
             <svg viewBox="0 0 24 24" width="20" height="20" stroke="#00e676" strokeWidth="2" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
             G-Code 3D Viewer
           </h3>
           <button 
             onClick={onClose}
             className="bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/20 transition-colors"
           >
             <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>
        </div>

        {/* Canvas Container */}
        <div className="aspect-square sm:aspect-video w-full bg-[#111] relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <svg className="animate-spin text-[#00e676] w-10 h-10 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/></svg>
              <div className="text-[#a0a0a0] text-sm">Rendering 3D Toolpath...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="text-[#ff5252] text-sm">{error}</div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="w-full h-full object-contain cursor-grab active:cursor-grabbing" />
          
          <div className="absolute bottom-4 left-4 text-xs text-[#666] bg-black/50 px-2 py-1 rounded border border-[#333]">
            Sử dụng 1 ngón để xoay, 2 ngón để phóng to
          </div>
        </div>
      </div>
    </div>
  );
}
