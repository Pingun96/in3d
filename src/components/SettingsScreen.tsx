import React, { useState, useEffect } from 'react';

interface SettingsScreenProps {
  printerName: string;
  ip: string;
  deviceInfo: any;
  onLogout?: () => void;
  autoOffEnabled?: boolean;
  setAutoOffEnabled?: (val: boolean) => void;
}

export function SettingsScreen({ printerName, ip, deviceInfo, onLogout, autoOffEnabled, setAutoOffEnabled }: SettingsScreenProps) {
  const [appVersion, setAppVersion] = useState('');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    setAppVersion(localStorage.getItem('app_version') || 'v1.0.0 (Gốc)');
  }, []);

  const handleCheckUpdate = async () => {
    if (isCheckingUpdate) return;
    setIsCheckingUpdate(true);
    setUpdateMsg('Đang kiểm tra...');
    try {
      const res = await fetch('https://api.github.com/repos/Pingun96/in3d/releases/latest');
      if (!res.ok) {
        setUpdateMsg('Lỗi kết nối Github.');
        setIsCheckingUpdate(false);
        return;
      }
      const data = await res.json();
      const latestTag = data.tag_name;
      const currentTag = localStorage.getItem('app_version') || 'v0.0.0';
      
      if (latestTag && latestTag !== currentTag && latestTag !== 'v0.0.0') {
        const asset = data.assets?.find((a: any) => a.name === 'update.zip');
        if (asset) {
          setUpdateMsg(`Đang tải ${latestTag}... Không thoát app!`);
          const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
          const version = await CapacitorUpdater.download({
            url: asset.browser_download_url,
            version: latestTag
          });
          localStorage.setItem('app_version', latestTag);
          setUpdateMsg('Đang nạp lại giao diện...');
          setTimeout(async () => {
             await CapacitorUpdater.set(version);
          }, 1000);
          return; // Don't set isCheckingUpdate to false because app will reload
        } else {
          setUpdateMsg('Không tìm thấy file cập nhật.');
        }
      } else {
        setUpdateMsg('Bạn đang ở phiên bản mới nhất!');
      }
    } catch (e) {
      setUpdateMsg('Kiểm tra cập nhật thất bại.');
    }
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateMsg('');
    }, 3000);
  };
  // Format SD card string
  let sdcardString = '0GB / 0GB';
  if (deviceInfo?.sdcard) {
    const freeMb = deviceInfo.sdcard.free || 0;
    const capacityMb = deviceInfo.sdcard.capacity || deviceInfo.sdcard.total || 0;
    if (capacityMb > 0) {
       sdcardString = `${(freeMb / 1024).toFixed(1)}GB / ${(capacityMb / 1024).toFixed(1)}GB`;
    }
  }

  // Format Wifi string
  let wifiSignalStr = 'Disconnected';
  if (deviceInfo?.wifi_signal) {
    wifiSignalStr = `${deviceInfo.wifi_signal}`; // Could be -50dBm
  }

  // Format Firmware string
  let firmwareStr = deviceInfo?.module_version || 'Unknown';
  let hasFirmwareUpdate = false;
  let newFirmwareVersion = '';

  if (deviceInfo?.ota && deviceInfo.ota.ota_new_version_number) {
    if (deviceInfo.ota.ota_new_version_number !== firmwareStr) {
      hasFirmwareUpdate = true;
      newFirmwareVersion = deviceInfo.ota.ota_new_version_number;
    }
  }

  return (
    <div className="flex w-full h-full bg-[#1e1e1e] p-6 gap-4">
       {/* Left: Account Box */}
       <div className="flex-[0.8] bg-[#2b2b2d] rounded-[16px] p-6 flex flex-col items-center justify-center relative shadow-lg">
         <div className="absolute top-6 left-6 text-[#d0d0d0] font-medium text-sm">Account</div>
         <button className="bg-[#3a3a3c] border border-[#555] rounded-[12px] px-10 py-2.5 text-[#e0e0e0] font-medium mb-6 hover:bg-[#444] transition-colors">
           Log In
         </button>
         <div className="text-[#a0a0a0] text-sm flex flex-col items-center gap-1">
            <div>Printer: <span className="text-[#e0e0e0] font-medium">{printerName}</span></div>
            {ip && <div className="text-xs text-[#666]">IP: {ip}</div>}
         </div>
       </div>

       {/* Right: List & Bottom Row */}
       <div className="flex-[1.2] flex flex-col gap-4">
         
         {/* Top List */}
         <div className="flex-1 flex flex-col gap-2 relative">
            <div className="flex-1 bg-[#2b2b2d] rounded-[12px] px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-[#353535] shadow-sm">
               <span className="text-[#e0e0e0] font-medium">Wi-Fi</span>
               <div className="flex items-center gap-3">
                 <span className="text-[#a0a0a0] text-sm">{wifiSignalStr}</span>
                 <svg viewBox="0 0 24 24" width="20" height="20" stroke="#888" strokeWidth="1.5" fill="none"><path d="M9 18l6-6-6-6"/></svg>
               </div>
            </div>
            
            <div className="flex-1 bg-[#2b2b2d] rounded-[12px] px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-[#353535] shadow-sm">
               <span className="text-[#e0e0e0] font-medium">USB Storage</span>
               <div className="flex items-center gap-3">
                 <span className="text-[#a0a0a0] text-sm">{sdcardString}</span>
                 <svg viewBox="0 0 24 24" width="20" height="20" stroke="#888" strokeWidth="1.5" fill="none"><path d="M9 18l6-6-6-6"/></svg>
               </div>
            </div>

            <div className="flex-1 bg-[#2b2b2d] rounded-[12px] px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-[#353535] shadow-sm">
               <span className="text-[#e0e0e0] font-medium">Firmware</span>
               <div className="flex items-center gap-3">
                 {hasFirmwareUpdate && (
                   <span className="text-[#00e676] text-xs border border-[#00e676]/30 bg-[#00e676]/10 px-2 py-0.5 rounded-full font-bold">
                     Cập nhật: {newFirmwareVersion}
                   </span>
                 )}
                 <span className="text-[#a0a0a0] text-sm">{firmwareStr}</span>
                 <svg viewBox="0 0 24 24" width="20" height="20" stroke="#888" strokeWidth="1.5" fill="none"><path d="M9 18l6-6-6-6"/></svg>
               </div>
            </div>

            <div className="flex-1 bg-[#2b2b2d] rounded-[12px] px-6 py-4 flex flex-col justify-center cursor-pointer hover:bg-[#353535] shadow-sm" onClick={handleCheckUpdate}>
               <div className="flex justify-between items-center">
                 <span className="text-[#e0e0e0] font-medium">App Version (OTA)</span>
                 <div className="flex items-center gap-3">
                   <span className="text-[#00e676] text-sm">{appVersion}</span>
                   {isCheckingUpdate ? (
                     <svg viewBox="0 0 24 24" width="20" height="20" stroke="#00e676" strokeWidth="2" fill="none" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                   ) : (
                     <svg viewBox="0 0 24 24" width="20" height="20" stroke="#00e676" strokeWidth="1.5" fill="none"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.1-5.9L3 8"/><path d="M3 2v6h6"/><path d="M21 12a9 9 0 1 0-2.1 5.9L21 16"/></svg>
                   )}
                 </div>
               </div>
               {updateMsg && <div className="text-[#00e676] text-xs mt-2 text-right">{updateMsg}</div>}
            </div>

            {/* Automation: Auto Turn Off */}
            <div className="flex-1 bg-[#2b2b2d] rounded-[12px] px-6 py-4 flex justify-between items-center shadow-sm">
               <div className="flex flex-col">
                 <span className="text-[#e0e0e0] font-medium">Tự động tắt máy (HA)</span>
                 <span className="text-[#888] text-xs mt-0.5">Sau khi in xong và nhiệt độ &lt; 70°C</span>
               </div>
               <div 
                 className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${autoOffEnabled ? 'bg-[#00e676]' : 'bg-[#444]'}`}
                 onClick={() => {
                   if (setAutoOffEnabled) {
                     const newVal = !autoOffEnabled;
                     setAutoOffEnabled(newVal);
                     localStorage.setItem('bambu_auto_off', newVal.toString());
                   }
                 }}
               >
                 <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${autoOffEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
            </div>
         </div>

         {/* Bottom Row */}
         <div className="flex gap-4 h-[35%]">
            <div className="flex-[1] bg-[#2b2b2d] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#353535] shadow-sm">
               <svg viewBox="0 0 24 24" width="32" height="32" stroke="#d0d0d0" strokeWidth="1.5" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
               <span className="text-[#d0d0d0] text-sm font-medium">Calibration</span>
            </div>
             <div className="flex-[1] bg-[#2b2b2d] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#353535] shadow-sm">
               <svg viewBox="0 0 24 24" width="32" height="32" stroke="#d0d0d0" strokeWidth="1.5" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
               <span className="text-[#d0d0d0] text-sm font-medium">Toolbox</span>
            </div>
            <div 
              className="flex-[1] bg-[#2b2b2d] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#353535] shadow-sm"
              onClick={() => {
                const isLight = document.body.classList.toggle('theme-light');
                localStorage.setItem('bambu_theme', isLight ? 'light' : 'dark');
              }}
            >
               <svg viewBox="0 0 24 24" width="32" height="32" stroke="#00e676" strokeWidth="1.5" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
               <span className="text-[#00e676] text-sm font-medium">Theme</span>
            </div>
            <div className="flex-[1.2] bg-[#2b2b2d] rounded-[16px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#353535] shadow-sm relative">
               <svg viewBox="0 0 24 24" width="32" height="32" stroke="#d0d0d0" strokeWidth="1.5" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
               <span className="text-[#d0d0d0] text-sm font-medium">Settings</span>
               {onLogout && (
                 <div className="absolute bottom-3 right-5 text-[#666] text-sm hover:text-[#ff5252] cursor-pointer font-medium" onClick={onLogout}>Logout</div>
               )}
            </div>
         </div>
       </div>
    </div>
  );
}
