import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { translateHmsCode } from '../utils/hms-dictionary';

interface MessageScreenProps {
  hmsErrors: any[];
}

export function MessageScreen({ hmsErrors }: MessageScreenProps) {
  // Translate Bambu HMS error codes to readable messages or fallback
  const getErrorMessage = (error: any) => {
    // Typical HMS format: code, attr, desc
    const codeStr = error.code !== undefined ? error.code.toString(16).toUpperCase().padStart(8, '0') : 'UNKNOWN';
    const codeFormatted = `0300_${codeStr.substring(0, 4)}_${codeStr.substring(4)}`;
    
    const translation = translateHmsCode(codeFormatted);
    
    return {
      title: translation ? translation.title : (error.msg || 'Cảnh báo hệ thống'),
      code: `HMS_${codeFormatted}`,
      resolution: translation ? translation.resolution : 'Vui lòng kiểm tra ứng dụng Bambu Handy để biết thêm chi tiết.',
      isError: translation ? translation.isError : true,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="w-full h-full bg-[#1e1e1f] text-white overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-normal mb-6 flex items-center gap-3">
          <AlertCircle className="text-[#a0a0a0]" size={28} />
          Thông báo & Lỗi (HMS)
        </h2>

        {hmsErrors && hmsErrors.length > 0 ? (
          <div className="flex flex-col gap-4">
            {hmsErrors.map((err, idx) => {
              const details = getErrorMessage(err);
              return (
                <div key={idx} className={`bg-[#2a2a2b] border ${details.isError ? 'border-[#ff5252]' : 'border-[#ffeb3b]'} rounded-xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 items-start justify-between`}>
                   <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                         {details.isError ? <AlertCircle className="text-[#ff5252]" size={28} /> : <Info className="text-[#ffeb3b]" size={28} />}
                      </div>
                      <div className="flex flex-col flex-1">
                         <span className="text-[#f0f0f0] text-lg font-medium mb-1">{details.title}</span>
                         <span className={`${details.isError ? 'text-[#ff5252]' : 'text-[#ffeb3b]'} text-[13px] font-mono tracking-wide mb-3`}>{details.code}</span>
                         <div className="bg-[#1a1a1a] rounded-lg p-3 text-[#d0d0d0] text-sm leading-relaxed border border-[#333]">
                           <span className="font-medium text-white mb-1 block">Cách xử lý:</span>
                           {details.resolution}
                         </div>
                      </div>
                   </div>
                   <div className="text-[#888] text-[13px] whitespace-nowrap pt-1">
                      {details.time}
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-[#2a2a2b] rounded-2xl border border-[#3a3a3c]">
             <CheckCircle className="text-[#00e676] mb-4" size={48} />
             <p className="text-[#a0a0a0] text-lg">Hệ thống hoạt động bình thường.</p>
             <p className="text-[#666] text-sm mt-1">Máy in không có bất kỳ báo lỗi nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
