import React, { useState, useEffect, useRef } from 'react';

const haUrl = 'http://600bk.cameraddns.net:8124';
const haToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlOTg0ZTYzM2FiMTM0ZDdkYjYyODQ0ODA1NzY5OTEwNyIsImlhdCI6MTc4MDg5MjI3NCwiZXhwIjoyMDk2MjUyMjc0fQ.iu76GuCzF4WrZKbT3phHFHkXgSctuXToZBmkA0B8tQE';

export function CameraView({ className }: { className?: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ isWatching: boolean; hasSpaghetti: boolean }>({
    isWatching: false,
    hasSpaghetti: false,
  });
  const imgUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchImageAndStatus = async () => {
      if (!isMounted) return;
      try {
        // Fetch AI Status from Home Assistant
        try {
          const statesRes = await fetch(`${haUrl}/api/states`, {
            headers: { 'Authorization': `Bearer ${haToken}` }
          });
          if (statesRes.ok) {
            const states = await statesRes.json();
            // Find Obico entities automatically
            const failureSensor = states.find((s: any) => s.entity_id.includes('obico') && s.entity_id.startsWith('binary_sensor'));
            
            if (failureSensor) {
              setAiStatus({
                isWatching: true,
                hasSpaghetti: failureSensor.state === 'on',
              });
            }
          }
        } catch (e) {
          // AI status fetch fail should not break camera
        }

        // Fetch Camera Image from HASS proxy
        const response = await fetch(`${haUrl}/api/camera_proxy/camera.yi_printer_camera`, {
          headers: {
            'Authorization': `Bearer ${haToken}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          if (isMounted) {
            setImgUrl(prev => {
              if (prev) URL.revokeObjectURL(prev);
              return objectUrl;
            });
            imgUrlRef.current = objectUrl;
            setError(null);
          }
        } else {
          setError(`HTTP Error: ${response.status}`);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Network Error');
      } finally {
        if (isMounted) {
          // Refresh every 1.5s
          timeoutId = setTimeout(fetchImageAndStatus, 1500);
        }
      }
    };

    fetchImageAndStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (imgUrlRef.current) URL.revokeObjectURL(imgUrlRef.current);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden bg-[#111] flex items-center justify-center ${className || ''}`}>
      {error ? (
        <div className="flex flex-col items-center gap-4">
           <svg viewBox="0 0 24 24" width="36" height="36" stroke="#ff5252" strokeWidth="1.5" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
           <div className="text-[#ff5252] font-medium tracking-wide text-sm">CAMERA OFFLINE</div>
           <div className="text-[#888] text-xs text-center px-4 max-h-[40px] overflow-hidden">{error}</div>
        </div>
      ) : imgUrl ? (
        <img 
          src={imgUrl} 
          alt="Bambu Lab Camera Stream" 
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-4 border-[#333] border-t-[#00e676] rounded-full animate-spin"></div>
           <div className="text-[#a0a0a0] font-medium tracking-widest uppercase text-xs">Connecting to HASS...</div>
        </div>
      )}
      
      {/* Live Badge */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 flex items-center gap-2 z-10">
         <div className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></div>
         <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Live View</span>
      </div>

      {/* AI Status Overlay */}
      {aiStatus.isWatching && (
        <div className={`absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-md border flex items-center gap-3 z-10 transition-colors duration-500 ${aiStatus.hasSpaghetti ? 'border-[#ff5252]' : 'border-[#00e676]/30'}`}>
           <svg viewBox="0 0 24 24" width="18" height="18" stroke={aiStatus.hasSpaghetti ? "#ff5252" : "#00e676"} strokeWidth="2" fill="none">
             {aiStatus.hasSpaghetti ? (
               <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
             ) : (
               <>
                 <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                 <path d="M12 12 2.1 7.1"/>
               </>
             )}
           </svg>
           <div className="flex flex-col">
             <span className={`text-[11px] font-bold uppercase tracking-wider ${aiStatus.hasSpaghetti ? 'text-[#ff5252]' : 'text-[#00e676]'}`}>
               {aiStatus.hasSpaghetti ? 'SPAGHETTI DETECTED!' : 'AI Watching...'}
             </span>
             {aiStatus.hasSpaghetti && (
               <span className="text-[10px] text-[#ff5252]/80 font-medium">Auto-stopping printer...</span>
             )}
           </div>
        </div>
      )}
      
      {/* Target Grid overlay for sci-fi look */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 opacity-40">
        <div className="absolute top-1/4 left-0 w-full border-t border-white/5 border-dashed"></div>
        <div className="absolute top-3/4 left-0 w-full border-t border-white/5 border-dashed"></div>
        <div className="absolute top-0 left-1/4 h-full border-l border-white/5 border-dashed"></div>
        <div className="absolute top-0 left-3/4 h-full border-l border-white/5 border-dashed"></div>
        <div className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-[#00e676]/50 rounded-full"></div>
      </div>
    </div>
  );
}

export function CameraScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#1e1e1e] p-4 lg:p-8">
      <CameraView className="w-full h-full rounded-[24px] border border-[#333] shadow-2xl" />
    </div>
  );
}
