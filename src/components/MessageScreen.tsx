import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface MessageScreenProps {
  hmsErrors: any[];
}

export function MessageScreen({ hmsErrors }: MessageScreenProps) {
  // Translate Bambu HMS error codes to readable messages or fallback
  const getErrorMessage = (error: any) => {
    // Typical HMS format: code, attr, desc
    // Example: { code: 10001, attr: 0, msg: "String desc" } 
    // Bambu's JSON actually sometimes returns `code` (e.g. integer) and we format it into hex.
    const code = error.code !== undefined ? error.code.toString(16).toUpperCase().padStart(8, '0') : 'UNKNOWN';
    return {
      title: error.msg || 'System Message',
      code: `HMS_0300_${code.substring(0, 4)}_${code.substring(4)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // since we don't have exact time from MQTT usually, use now
    };
  };

  return (
    <div className="w-full h-full bg-[#1e1e1f] text-white overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-normal mb-6 flex items-center gap-3">
          <AlertCircle className="text-[#a0a0a0]" size={28} />
          Notifications & Errors
        </h2>

        {hmsErrors && hmsErrors.length > 0 ? (
          <div className="flex flex-col gap-4">
            {hmsErrors.map((err, idx) => {
              const details = getErrorMessage(err);
              return (
                <div key={idx} className="bg-[#2a2a2b] border border-[#ff5252] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                         <AlertCircle className="text-[#ff5252]" size={24} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[#f0f0f0] text-[16px] font-medium mb-1">{details.title}</span>
                         <span className="text-[#ff5252] text-[13px] font-mono tracking-wide">{details.code}</span>
                      </div>
                   </div>
                   <div className="text-[#888] text-[13px] whitespace-nowrap">
                      {details.time}
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-[#2a2a2b] rounded-2xl border border-[#3a3a3c]">
             <CheckCircle className="text-[#00c853] mb-4" size={48} />
             <p className="text-[#a0a0a0] text-lg">No errors or notifications.</p>
             <p className="text-[#666] text-sm mt-1">Your printer is running smoothly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
