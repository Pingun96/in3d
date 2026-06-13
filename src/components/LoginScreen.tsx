import React from 'react';
import { RefreshCw, AlertTriangle, Cloud, MonitorSmartphone, Info, ChevronRight } from 'lucide-react';
import type { BambuDevice } from '../services/BambuCloudApi';

interface LoginScreenProps {
  loginMode: 'cloud' | 'local';
  setLoginMode: (mode: 'cloud' | 'local') => void;
  cloudEmail: string;
  setCloudEmail: (v: string) => void;
  cloudPassword: string;
  setCloudPassword: (v: string) => void;
  cloudDevices: BambuDevice[];
  setCloudDevices: (v: BambuDevice[]) => void;
  isLoggingIn: boolean;
  isConnecting: boolean;
  connectionError: string;
  handleCloudLogin: (e: React.FormEvent) => void;
  handleConnectCloudDevice: (device: BambuDevice) => void;
  ip: string;
  setIp: (v: string) => void;
  accessCode: string;
  setAccessCode: (v: string) => void;
  serial: string;
  setSerial: (v: string) => void;
  handleConnectLocal: (e?: React.FormEvent) => void;
  isRequire2FA?: boolean;
  verifyCode?: string;
  setVerifyCode?: (v: string) => void;
  handleSendVerifyCode?: () => void;
  cloudAccount?: string;
}

export function LoginScreen(props: LoginScreenProps) {
  return (
    <div className="h-full w-full flex items-center justify-center p-6 bg-[#0f1011] relative overflow-hidden">
      
      {/* Decorative Background circles for premium feel */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#00e676] opacity-5 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-[#00b0ff] opacity-5 blur-[120px]"></div>

      {/* Login Panel */}
      <div className="w-full max-w-md x1c-panel p-8 z-10 shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-wide">Bambu Connect</h2>
          <p className="text-[#a0a0a0] mt-1 text-sm tracking-wider uppercase">Printer Connection</p>
        </div>
        
        {/* Connection Mode Toggle */}
        <div className="flex bg-[#111111] p-1 rounded-xl mb-8 border border-[#2c2e33]">
          <button 
            onClick={() => props.setLoginMode('cloud')}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${props.loginMode === 'cloud' ? 'bg-[#2c2e33] text-white shadow-md' : 'text-[#a0a0a0] hover:text-[#e0e0e0]'}`}
          >
            <Cloud size={18} /> Cloud
          </button>
          <button 
            onClick={() => props.setLoginMode('local')}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${props.loginMode === 'local' ? 'bg-[#2c2e33] text-white shadow-md' : 'text-[#a0a0a0] hover:text-[#e0e0e0]'}`}
          >
            <MonitorSmartphone size={18} /> Local LAN
          </button>
        </div>

        {props.loginMode === 'cloud' && (
          <div>
            {props.cloudDevices.length === 0 ? (
              <form onSubmit={props.handleCloudLogin} className="flex flex-col gap-4">
                
                <div className="bg-[#111111] border border-[#2c2e33] rounded-xl p-4 flex items-start gap-3">
                  <Info className="text-[#a0a0a0] shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-[#a0a0a0] leading-relaxed">
                    Google login is not supported directly. Create a password in Bambu Lab Account Settings first.
                  </p>
                </div>

                <input 
                  type="email" 
                  value={props.cloudEmail} 
                  onChange={e => props.setCloudEmail(e.target.value)} 
                  placeholder="Email" 
                  className="x1c-input"
                  required
                />
                <input 
                  type="password" 
                  value={props.cloudPassword} 
                  onChange={e => props.setCloudPassword(e.target.value)} 
                  placeholder="Password" 
                  className="x1c-input"
                  required
                />
                
                {props.isRequire2FA && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={props.verifyCode || ''} 
                      onChange={e => props.setVerifyCode && props.setVerifyCode(e.target.value)} 
                      placeholder="Code (6 digits)" 
                      className="x1c-input flex-1"
                      maxLength={6}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={props.handleSendVerifyCode} 
                      className="x1c-btn px-4 text-sm bg-[#2c2e33]"
                    >
                      Resend
                    </button>
                  </div>
                )}
                
                {props.connectionError && (
                  <p className="text-xs text-[#ff5252] flex items-center gap-1"><AlertTriangle size={14} /> {props.connectionError}</p>
                )}
                
                <button type="submit" disabled={props.isLoggingIn} className="w-full x1c-btn-primary py-3 mt-4">
                  {props.isLoggingIn ? <RefreshCw className="animate-spin mx-auto" size={20} /> : 'Login to Cloud'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-xs text-[#a0a0a0] font-mono mb-2">Account: {props.cloudAccount || 'N/A'}</div>
                <div className="max-h-48 overflow-y-auto flex flex-col gap-3">
                  {props.cloudDevices.map(device => (
                    <button 
                      key={device.dev_id}
                      onClick={() => props.handleConnectCloudDevice(device)}
                      disabled={props.isConnecting}
                      className="w-full text-left p-4 bg-[#111111] border border-[#2c2e33] rounded-xl hover:border-[#00e676] transition-all group flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-white">{device.name}</h3>
                        <p className="text-xs text-[#a0a0a0] font-mono mt-1">{device.dev_id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold tracking-widest ${device.online ? 'bg-[#00e676]/20 text-[#00e676]' : 'bg-[#ff5252]/20 text-[#ff5252]'}`}>
                          {device.online ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        {props.isConnecting && props.serial === device.dev_id ? (
                          <span className="w-4 h-4 border-2 border-[#00e676]/30 border-t-[#00e676] rounded-full animate-spin"></span>
                        ) : (
                          <ChevronRight className="text-[#555] group-hover:text-[#00e676] transition-colors" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {props.connectionError && (
                  <p className="text-xs text-[#ff5252] flex items-center gap-1"><AlertTriangle size={14} /> {props.connectionError}</p>
                )}
                
                <button onClick={() => props.setCloudDevices([])} className="mt-4 text-sm text-[#a0a0a0] hover:text-white transition-colors text-center w-full">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {props.loginMode === 'local' && (
          <form onSubmit={props.handleConnectLocal} className="flex flex-col gap-4">
            <input 
              type="text" 
              value={props.ip} 
              onChange={e => props.setIp(e.target.value)} 
              placeholder="IP Address" 
              className="x1c-input"
            />
            <input 
              type="text" 
              value={props.accessCode} 
              onChange={e => props.setAccessCode(e.target.value)} 
              placeholder="LAN Access Code" 
              className="x1c-input"
            />
            <input 
              type="text" 
              value={props.serial} 
              onChange={e => props.setSerial(e.target.value)} 
              placeholder="Serial Number" 
              className="x1c-input"
            />
            
            {props.connectionError && (
              <p className="text-xs text-[#ff5252] flex items-center gap-1"><AlertTriangle size={14} /> {props.connectionError}</p>
            )}
            
            <button type="submit" disabled={props.isConnecting} className="w-full x1c-btn py-3 mt-4 bg-[#2c2e33] hover:bg-[#3f424a] text-white">
              {props.isConnecting ? <RefreshCw className="animate-spin mx-auto" size={20} /> : 'Connect Local'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
