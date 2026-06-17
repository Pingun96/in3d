import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { HmsPopup } from './components/HmsPopup';
import { bambuBridge } from './services/BambuBridge';
import { BambuCloudApi, type BambuDevice } from './services/BambuCloudApi';
import { CapacitorHttp } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useNotification } from './context/NotificationContext';

function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function(this: any) {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }.bind(this), Math.max(limit - (Date.now() - lastRan), 0));
    }
  } as T;
}

// Store the latest blob URL to revoke it and prevent memory leaks
let lastBlobUrl = '';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // connectionError removed in favor of showToast
  
  const [ip, setIp] = useState(() => localStorage.getItem('bambu_ip') || '');
  const [accessCode, setAccessCode] = useState(() => localStorage.getItem('bambu_code') || '');
  const [serial, setSerial] = useState(() => localStorage.getItem('bambu_serial') || '');
  
  const [loginMode, setLoginMode] = useState<'cloud' | 'local'>('cloud');
  const [cloudEmail, setCloudEmail] = useState(() => localStorage.getItem('bambu_email') || '');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudDevices, setCloudDevices] = useState<BambuDevice[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [cloudToken, setCloudToken] = useState(() => localStorage.getItem('bambu_token') || '');
  const [cloudAccount, setCloudAccount] = useState(() => localStorage.getItem('bambu_account') || '');
  
  const [isRequire2FA, setIsRequire2FA] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  const [activeTab, setActiveTab] = useState<string>('home');
  const [printState, setPrintState] = useState('OFFLINE');
  const [printProgress, setPrintProgress] = useState(0);
  const [printTimeRemaining, setPrintTimeRemaining] = useState(0);
  const [printSubtask, setPrintSubtask] = useState('');
  const [printTaskId, setPrintTaskId] = useState('');
  const [printProfileId, setPrintProfileId] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [nozzleTemp, setNozzleTemp] = useState(0);
  const [nozzleTarget, setNozzleTarget] = useState(0);
  const [bedTemp, setBedTemp] = useState(0);
  const [bedTarget, setBedTarget] = useState(0);
  const [chamberTemp, setChamberTemp] = useState(0);
  const [chamberLight, setChamberLight] = useState(false);
  const [fanPart, setFanPart] = useState(0);
  const [fanAux, setFanAux] = useState(0);
  const [fanChamber, setFanChamber] = useState(0);
  const [amsList, setAmsList] = useState<any[]>([]);
  const [rawAmsData, setRawAmsData] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>({}); // For BMCU debugging
  const [activeTrayId, setActiveTrayId] = useState<number | null>(null);
  const [machineStatus, setMachineStatus] = useState<string>('');
  const [hmsErrors, setHmsErrors] = useState<any[]>([]);
  const [vtTray, setVtTray] = useState<any>(null);
  const [speedLvl, setSpeedLvl] = useState(2);
  const [showFinishModal, setShowFinishModal] = useState(false);
  
  const [isAiActive, setIsAiActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aiStatusText, setAiStatusText] = useState('Chưa bắt đầu');
  const [riskScore, setRiskScore] = useState(0);
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  
  const [hasAppUpdate, setHasAppUpdate] = useState(false);

  const [autoOffEnabled, setAutoOffEnabled] = useState(() => localStorage.getItem('bambu_auto_off') === 'true');
  const [autoTurnOffPending, setAutoTurnOffPending] = useState(false);

  // Auto Turn Off Logic
  useEffect(() => {
    // If the printer starts printing, we set pending to true
    if (printState === 'PRINTING' || printState === 'RUNNING') {
      setAutoTurnOffPending(true);
    }
  }, [printState]);

  useEffect(() => {
    const checkAndTurnOff = async () => {
      // Check if feature is enabled, a print just finished, and temp dropped below 70
      if (autoOffEnabled && autoTurnOffPending && printState === 'FINISH' && nozzleTemp < 70) {
        setAutoTurnOffPending(false); // Reset pending so we don't trigger again
        
        // Hardcoded HA Configuration for turn off
        const haUrl = 'http://600bk.cameraddns.net:8124';
        const haToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlOTg0ZTYzM2FiMTM0ZDdkYjYyODQ0ODA1NzY5OTEwNyIsImlhdCI6MTc4MDg5MjI3NCwiZXhwIjoyMDk2MjUyMjc0fQ.iu76GuCzF4WrZKbT3phHFHkXgSctuXToZBmkA0B8tQE';
        const haEntityId = 'switch.may_in_3d_socket_1';
        
        try {
          // Fire local notification
          try {
             LocalNotifications.schedule({
                notifications: [
                  {
                    title: "Tự động tắt máy",
                    body: "Máy in đã in xong và hạ nhiệt. Đang tiến hành ngắt nguồn.",
                    id: 9999,
                    schedule: { at: new Date(Date.now() + 1000) }
                  }
                ]
             });
          } catch(e) {}

          const response = await fetch(`${haUrl}/api/services/switch/turn_off`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${haToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ entity_id: haEntityId })
          });
          if (response.ok) {
             console.log("Printer auto-turned off successfully.");
          }
        } catch (e) {
          console.error("Failed to auto turn off printer", e);
        }
      }
    };
    checkAndTurnOff();
  }, [autoOffEnabled, autoTurnOffPending, printState, nozzleTemp]);

  useEffect(() => {
    const checkAppUpdate = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/Pingun96/in3d/releases/latest');
        if (res.ok) {
          const data = await res.json();
          const latestTag = data.tag_name;
          const currentTag = localStorage.getItem('app_version') || 'v0.0.0';
          if (latestTag && latestTag !== currentTag && latestTag !== 'v0.0.0') {
            setHasAppUpdate(true);
          }
        }
      } catch (e) {
        // Ignore errors
      }
    };
    checkAppUpdate();
  }, []);
  

  useEffect(() => {
    // Restore Theme
    const savedTheme = localStorage.getItem('bambu_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('theme-light');
    }

    // Request Notification Permissions on Mount
    try {
      LocalNotifications.requestPermissions();
    } catch (e) {}

    let interval: any;
    if (isConnected) {
      const fetchCover = async () => {
        let foundCover = '';
        const logs: string[] = [];
        logs.push('1. Try HASS');
        try {
          const haUrl = 'http://600bk.cameraddns.net:8124';
          const haToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlOTg0ZTYzM2FiMTM0ZDdkYjYyODQ0ODA1NzY5OTEwNyIsImlhdCI6MTc4MDg5MjI3NCwiZXhwIjoyMDk2MjUyMjc0fQ.iu76GuCzF4WrZKbT3phHFHkXgSctuXToZBmkA0B8tQE';
          
          const response = await fetch(`${haUrl}/api/states`, {
            headers: {
              'Authorization': `Bearer ${haToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            logs.push('HASS fetch OK');
            const data = await response.json();
            if (data && Array.isArray(data)) {
              const coverEntity = data.find((e: any) => e.entity_id && e.entity_id.startsWith('image.') && e.entity_id.includes('cover_image'));
              if (coverEntity && coverEntity.attributes && coverEntity.attributes.entity_picture) {
                const picUrl = `${haUrl}${coverEntity.attributes.entity_picture}`;
                logs.push(`Found URL: ${picUrl.substring(0, 30)}`);
                
                try {
                  const imgResponse = await fetch(picUrl, {
                    headers: { 'Authorization': `Bearer ${haToken}` }
                  });
                  if (imgResponse.ok) {
                    const blob = await imgResponse.blob();
                    if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
                    foundCover = URL.createObjectURL(blob);
                    lastBlobUrl = foundCover;
                    logs.push('Blob created');
                  } else {
                    logs.push(`Blob err: ${imgResponse.status}`);
                  }
                } catch (e: any) {
                  // logs.push(`Blob exception: ${e.message}`);
                }
              }
            }
          }
        } catch (e: any) {
          // logs.push(`HASS Exception: ${e.message}`);
        }

        if (!foundCover) {
          // logs.push('2. Fallback Cloud');
          try {
            const tasks = await BambuCloudApi.getTasks(cloudToken);
            if (tasks && tasks.length > 0) {
              let activeTask = tasks.find((t: any) => 
                (printTaskId && printTaskId !== '0' && (String(t.id) === String(printTaskId) || String(t.taskId) === String(printTaskId))) ||
                (printProfileId && printProfileId !== '0' && String(t.profileId) === String(printProfileId)) ||
                (printSubtask && t.title && printSubtask.toLowerCase().includes(t.title.toLowerCase()))
              );

              if (activeTask && activeTask.cover) {
                foundCover = activeTask.cover;
              }
            }
          } catch (e: any) {
             // Ignore cloud exceptions
          }
        }

        const isPrinting = printState !== 'OFFLINE';

        if (!isPrinting) {
           setCoverImage('');
        } else {
           setCoverImage(foundCover || '');
        }
      };
      
      fetchCover();
      const interval = setInterval(fetchCover, 30000);
      return () => clearInterval(interval);
    } else {
      setCoverImage('');
    }
  }, [cloudToken, isConnected, printState, printSubtask, printTaskId, printProfileId]);

  const getPrintStageString = (stage: number) => {
    const stages: {[key: number]: string} = {
      1: 'Cân bàn tự động',
      2: 'Làm nóng bàn',
      4: 'Đang đổi nhựa (Changing Filament)...',
      7: 'Làm nóng đầu phun',
      13: 'Về gốc tọa độ (Homing)',
      14: 'Làm sạch đầu phun',
      22: 'Đang rút nhựa (Unloading)...',
      24: 'Đang nạp nhựa (Loading)...',
      29: 'Làm nguội đầu phun',
      34: 'Đang di chuyển'
    };
    return stages[stage] || '';
  };

  const setupMqttListeners = async () => {
    await bambuBridge.onStatusChange((event) => {
      setIsConnected(event.status === 'connected');
      if (event.status === 'connected') setPrintState('IDLE');
      else setPrintState('OFFLINE');
    });

    const handleMqttMessage = throttle((event: any) => {
      try {
        const data = JSON.parse(event.payload);
        const printData = data.print || (data.report && data.report.print) || data;
        if (printData) {
          if (printData.nozzle_temper !== undefined) setNozzleTemp(Math.round(printData.nozzle_temper));
          if (printData.nozzle_target_temper !== undefined) setNozzleTarget(Math.round(printData.nozzle_target_temper));
          if (printData.bed_temper !== undefined) setBedTemp(Math.round(printData.bed_temper));
          if (printData.bed_target_temper !== undefined) setBedTarget(Math.round(printData.bed_target_temper));
          if (printData.chamber_temper !== undefined) setChamberTemp(Math.round(printData.chamber_temper));
          if (printData.mc_percent !== undefined) setPrintProgress(printData.mc_percent);
          if (printData.mc_remaining_time !== undefined) setPrintTimeRemaining(printData.mc_remaining_time);
          if (printData.spd_lvl !== undefined) setSpeedLvl(printData.spd_lvl);
          
          if (printData.gcode_state !== undefined) {
            setPrintState(prev => {
              if (prev !== 'FINISH' && printData.gcode_state === 'FINISH') {
                setShowFinishModal(true);
                try {
                  LocalNotifications.schedule({
                    notifications: [{
                      title: "In hoàn tất!",
                      body: `Mẫu in của bạn đã hoàn thành thành công.`,
                      id: Date.now(),
                      schedule: { at: new Date(Date.now() + 1000) }
                    }]
                  });
                } catch (e) {}
              }
              if (prev !== 'FAILED' && printData.gcode_state === 'FAILED') {
                try {
                  LocalNotifications.schedule({
                    notifications: [{
                      title: "In thất bại!",
                      body: `Máy in gặp sự cố và đã dừng lại.`,
                      id: Date.now() + 1,
                      schedule: { at: new Date(Date.now() + 1000) }
                    }]
                  });
                } catch (e) {}
              }
              return printData.gcode_state;
            });
          }
          
          if (printData.subtask_name !== undefined) setPrintSubtask(printData.subtask_name);
          if (printData.task_id !== undefined) setPrintTaskId(printData.task_id);
          if (printData.profile_id !== undefined) setPrintProfileId(printData.profile_id);
          if (printData.lights_report && Array.isArray(printData.lights_report)) {
            const chamber = printData.lights_report.find((l: any) => l.node === 'chamber_light');
            if (chamber) setChamberLight(chamber.mode === 'on');
          }
          if (printData.cooling_fan_speed !== undefined) setFanPart(Math.round((printData.cooling_fan_speed / 15) * 100));
          if (printData.heatbreak_fan_speed !== undefined) setFanAux(Math.round((printData.heatbreak_fan_speed / 15) * 100));
          if (printData.big_fan1_speed !== undefined) setFanChamber(Math.round((printData.big_fan1_speed / 15) * 100));
          
          const stage = printData.stg_cur !== undefined ? printData.stg_cur : printData.mc_print_stage;
          if (stage !== undefined) {
            setMachineStatus(getPrintStageString(Number(stage)));
          }
          
          setDeviceInfo((prev: any) => ({
            ...prev,
            sdcard: printData.sdcard || prev.sdcard,
            wifi_signal: printData.wifi_signal !== undefined ? printData.wifi_signal : prev.wifi_signal,
            ip: printData.ip || prev.ip,
            module_version: printData.module_version || prev.module_version,
            ota: printData.ota || prev.ota
          }));

          if (printData.hms && Array.isArray(printData.hms)) {
            setHmsErrors(printData.hms);
          } else if (printData.hms !== undefined && printData.hms.length === 0) {
            setHmsErrors([]);
          }
          
          let newAmsList = null;
          
          if (printData.ams) {
            setRawAmsData(printData.ams);
            if (printData.ams.tray_now !== undefined) {
              setActiveTrayId(printData.ams.tray_now);
            }
            if (Array.isArray(printData.ams.ams) && printData.ams.ams.length > 0) {
              newAmsList = printData.ams.ams;
            } else if (Array.isArray(printData.ams) && printData.ams.length > 0) {
              newAmsList = printData.ams;
            } else if (printData.ams.tray) {
              newAmsList = [{ id: '0', tray: printData.ams.tray }];
            }
          }
          
          if (printData.vt_tray) {
            setVtTray(printData.vt_tray);
            if (printData.vt_tray.tray_id_name !== undefined && printData.vt_tray.tray_id_name !== '') {
               if (printData.ams?.tray_now === undefined) setActiveTrayId(254);
            }
          }

          if ((!newAmsList || newAmsList.length === 0) && printData.vt_tray) {
            if (Array.isArray(printData.vt_tray)) {
              newAmsList = [{ id: 'vt', tray: printData.vt_tray }];
            } else {
              newAmsList = [{ id: 'vt', tray: [printData.vt_tray] }];
            }
          }
          
          if (newAmsList && newAmsList.length > 0) {
            setAmsList(newAmsList);
          }
        }
      } catch (_e) {}
    }, 200);

    await bambuBridge.onMessage(handleMqttMessage);
  };

  const handleCloudLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudEmail || !cloudPassword) {
      showToast('Vui lòng nhập Email và Password', 'error');
      return;
    }
    setIsLoggingIn(true);
    // setConnectionError('');
    try {
      const res = await BambuCloudApi.login(cloudEmail, cloudPassword, verifyCode);
      setCloudToken(res.token);
      setCloudAccount(res.account);
      setIsRequire2FA(false);
      localStorage.setItem('bambu_email', cloudEmail);
      localStorage.setItem('bambu_token', res.token);
      localStorage.setItem('bambu_account', res.account);
      const devices = await BambuCloudApi.getDevices(res.token);
      setCloudDevices(devices);
    } catch (err: unknown) {
      if ((err as Error).message === 'REQUIRE_2FA') {
        setIsRequire2FA(true);
        showToast('Hệ thống yêu cầu mã xác thực đã được gửi về email của bạn.', 'info');
      } else {
        showToast((err as Error).message, 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSendVerifyCode = async () => {
    try {
      // setConnectionError('');
      await BambuCloudApi.sendVerifyCode(cloudEmail);
      showToast('Mã xác thực đã được gửi lại vào email của bạn.', 'success');
    } catch (err: unknown) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleConnectCloudDevice = async (device: BambuDevice) => {
    setIsConnecting(true);
    // setConnectionError('');
    try {
      setSerial(device.dev_id);
      localStorage.setItem('bambu_serial', device.dev_id);
      await bambuBridge.cleanup();
      await setupMqttListeners();
      const broker = 'ssl://us.mqtt.bambulab.com:8883';
      const response = await bambuBridge.connectMqtt(cloudToken, device.dev_id, '', broker, cloudAccount);
      setIsConnected(response.status === 'connected');
      if (response.status === 'connected') {
        bambuBridge.publish(`device/${device.dev_id}/request`, {
          pushing: { sequence_id: '0', command: 'pushall' }
        });
      }
      setIsConnecting(false);
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Kết nối Cloud thất bại';
      if (errorMsg.includes('not implemented on web') || errorMsg.includes('BambuPrinter')) {
        // Mock connection for Web testing
        setIsConnected(true);
        setPrintState('PRINTING');
        setMachineStatus('Đang in...');
        setNozzleTemp(220);
        setNozzleTarget(220);
        setBedTemp(55);
        setBedTarget(55);
        setChamberTemp(27);
        setPrintProgress(20);
        setPrintTimeRemaining(82);
        setFanPart(100);
        setFanAux(70);
        setFanChamber(0);
        setAmsList([{ id: '0', tray: [
          { id: '0', tray_color: 'FF0000FF', tray_type: 'PLA', tray_sub_brands: 'PLA Basic', remain: 80 },
          { id: '1', tray_color: '00FF00FF', tray_type: 'PLA', tray_sub_brands: 'PLA Matte', remain: 50 },
          { id: '2', tray_color: '0000FFFF', tray_type: 'PETG', tray_sub_brands: 'PETG Basic', remain: 100 },
          { id: '3', empty: true }
        ] }]);
      } else {
        showToast(errorMsg, 'error');
        setIsConnected(false);
      }
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const autoLogin = async () => {
      const savedToken = localStorage.getItem('bambu_token');
      if (savedToken && loginMode === 'cloud') {
        setIsLoggingIn(true);
        try {
          const devices = await BambuCloudApi.getDevices(savedToken);
          setCloudDevices(devices);
          
          // Auto connect to previously connected device if exists
          const savedSerial = localStorage.getItem('bambu_serial');
          const targetDevice = devices.find(d => d.dev_id === savedSerial);
          if (targetDevice) {
            handleConnectCloudDevice(targetDevice);
          }
        } catch (e) {
          // Token invalid or expired
          setCloudToken('');
          localStorage.removeItem('bambu_token');
        } finally {
          setIsLoggingIn(false);
        }
      }
    };
    autoLogin();
  }, []);

  const handleConnectLocal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ip || !accessCode || !serial) {
      showToast('Vui lòng điền đầy đủ IP, LAN Access Code và Serial Number', 'error');
      return;
    }
    setIsConnecting(true);
    // setConnectionError('');
    try {
      localStorage.setItem('bambu_ip', ip);
      localStorage.setItem('bambu_code', accessCode);
      localStorage.setItem('bambu_serial', serial);
      await bambuBridge.cleanup();
      await setupMqttListeners();
      const response = await bambuBridge.connectMqtt(accessCode, serial, ip);
      setIsConnected(response.status === 'connected');
      if (response.status === 'connected') {
        bambuBridge.publish(`device/${serial}/request`, {
          pushing: { sequence_id: '0', command: 'pushall' }
        });
      }
      setIsConnecting(false);
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Kết nối thất bại';
      if (errorMsg.includes('not implemented on web') || errorMsg.includes('BambuPrinter')) {
        // Mock connection for Web testing
        setIsConnected(true);
        setPrintState('PRINTING');
        setMachineStatus('Đang in...');
        setNozzleTemp(220);
        setNozzleTarget(220);
        setBedTemp(55);
        setBedTarget(55);
        setChamberTemp(27);
        setPrintProgress(20);
        setPrintTimeRemaining(82);
        setFanPart(100);
        setFanAux(70);
        setFanChamber(0);
        setAmsList([{ id: '0', tray: [
          { id: '0', tray_color: 'FF0000FF', tray_type: 'PLA', tray_sub_brands: 'PLA Basic', remain: 80 },
          { id: '1', tray_color: '00FF00FF', tray_type: 'PLA', tray_sub_brands: 'PLA Matte', remain: 50 },
          { id: '2', tray_color: '0000FFFF', tray_type: 'PETG', tray_sub_brands: 'PETG Basic', remain: 100 },
          { id: '3', empty: true }
        ] }]);
      } else {
        showToast(errorMsg, 'error');
        setIsConnected(false);
      }
      setIsConnecting(false);
    }
  };

  const handleDisconnect = useCallback(async () => {
    await bambuBridge.disconnectMqtt();
    await bambuBridge.cleanup();
    setIsConnected(false);
    setPrintState('OFFLINE');
    if (isAiActive) setIsAiActive(false);
  }, [isAiActive]);

  const controlLight = useCallback(() => {
    const newState = !chamberLight;
    bambuBridge.publish(`device/${serial}/request`, {
      system: { sequence_id: '0', command: 'ledctrl', led_node: 'chamber_light', led_mode: newState ? 'on' : 'off', led_on_time: 500, led_off_time: 500, loop_times: 1, interval_time: 1000 }
    });
    setChamberLight(newState);
  }, [chamberLight, serial]);

  const controlFan = useCallback((fanType: string, value: number) => {
    const speed = Math.round((value / 100) * 255);
    let gcode = '';
    if (fanType === 'part') gcode = `M106 P1 S${speed}`;
    if (fanType === 'aux') gcode = `M106 P2 S${speed}`;
    if (fanType === 'chamber') gcode = `M106 P3 S${speed}`;
    
    bambuBridge.publish(`device/${serial}/request`, {
      print: { sequence_id: '0', command: 'gcode_line', param: gcode }
    });
    
    if (fanType === 'part') setFanPart(value);
    if (fanType === 'aux') setFanAux(value);
    if (fanType === 'chamber') setFanChamber(value);
  }, [serial]);

  const controlPrint = useCallback((action: string) => {
    bambuBridge.publish(`device/${serial}/request`, {
      print: { sequence_id: '0', command: action }
    });
  }, [serial]);

  const handleDismissAlarm = useCallback(() => {
    setIsAlarmTriggered(false);
    setRiskScore(0);
    setAiStatusText('Đã bỏ qua cảnh báo.');
  }, []);

  const handleLoadFilament = useCallback(() => {
    bambuBridge.loadFilament(serial);
  }, [serial]);

  const handleUnloadFilament = useCallback(() => {
    bambuBridge.unloadFilament(serial);
  }, [serial]);

  const controlTemp = useCallback((target: 'nozzle' | 'bed', temp: number) => {
    let gcode = '';
    if (target === 'nozzle') gcode = `M104 S${temp} \n`;
    if (target === 'bed') gcode = `M140 S${temp} \n`;
    
    bambuBridge.publish(`device/${serial}/request`, {
      print: { sequence_id: '0', command: 'gcode_line', param: gcode }
    });
    
    // Optimistic UI update
    if (target === 'nozzle') setNozzleTarget(temp);
    if (target === 'bed') setBedTarget(temp);
  }, [serial]);

  const controlAxis = useCallback((axis: 'X' | 'Y' | 'Z', distance: number) => {
    const gcode = `G91 \n G1 ${axis}${distance} F3000 \n G90 \n`;
    bambuBridge.publish(`device/${serial}/request`, {
      print: { sequence_id: '0', command: 'gcode_line', param: gcode }
    });
  }, [serial]);

  const controlSpeed = useCallback((level: number) => {
    bambuBridge.publish(`device/${serial}/request`, {
      print: { sequence_id: '0', command: 'print_speed', param: level.toString() }
    });
    setSpeedLvl(level);
  }, [serial]);

  const editAmsFilament = useCallback((amsId: number, trayId: number, type: string, color: string) => {
    const parts = type.split(' ');
    const material = parts.pop() || 'PLA';
    const brand = parts.join(' ') || 'Generic';
    bambuBridge.setAmsFilament(serial, amsId, trayId, brand, material, color);
  }, [serial]);

  const loadAmsFilament = useCallback((targetTray: number) => {
    bambuBridge.amsChangeFilament(serial, targetTray);
  }, [serial]);

  const { showToast } = useNotification();

  const onPrintAgain = useCallback((task: any) => {
    // Send print_project command to start printing again
    bambuBridge.publish(`device/${serial}/request`, {
      print: {
        sequence_id: '0',
        command: 'project_file',
        param: `Metadata/plate_1.gcode`,
        project_id: task.profileId || '0',
        profile_id: task.profileId || '0',
        task_id: task.id || '0',
        subtask_name: task.title || '',
        file: `${task.title}.gcode`,
        url: task.url || ''
      }
    });
    showToast('Đã gửi lệnh in lại xuống máy in!', 'success');
  }, [serial, showToast]);

  return (
    <>
      {!isConnected ? (
        <LoginScreen
          loginMode={loginMode}
          setLoginMode={setLoginMode}
          cloudEmail={cloudEmail}
          setCloudEmail={setCloudEmail}
          cloudPassword={cloudPassword}
          setCloudPassword={setCloudPassword}
          cloudDevices={cloudDevices}
          setCloudDevices={setCloudDevices}
          isLoggingIn={isLoggingIn}
          isConnecting={isConnecting}
          handleCloudLogin={handleCloudLogin}
          handleConnectCloudDevice={handleConnectCloudDevice}
          ip={ip}
          setIp={setIp}
          accessCode={accessCode}
          setAccessCode={setAccessCode}
          serial={serial}
          setSerial={setSerial}
          handleConnectLocal={handleConnectLocal}
          isRequire2FA={isRequire2FA}
          verifyCode={verifyCode}
          setVerifyCode={setVerifyCode}
          handleSendVerifyCode={handleSendVerifyCode}
          cloudAccount={cloudAccount}
        />
      ) : (
        <Dashboard
          printerName={cloudDevices.find(d => d.dev_id === serial)?.name || 'Bambu Printer'}
          printState={printState}
          printProgress={printProgress}
          printTimeRemaining={printTimeRemaining}
          printSubtask={printSubtask}
          coverImage={coverImage}
          nozzleTemp={nozzleTemp}
          nozzleTarget={nozzleTarget}
          bedTemp={bedTemp}
          bedTarget={bedTarget}
          chamberTemp={chamberTemp}
          fanPart={fanPart}
          fanAux={fanAux}
          fanChamber={fanChamber}
          chamberLight={chamberLight}
          hmsErrors={hmsErrors}
          deviceInfo={deviceInfo}
          amsList={amsList}
          vtTray={vtTray}
          onControlLight={controlLight}
          onControlFan={controlFan}
          onControlPrint={controlPrint}
          onDisconnect={handleDisconnect}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          videoRef={videoRef}
          canvasRef={canvasRef}
          isAiActive={isAiActive}
          setIsAiActive={setIsAiActive}
          aiStatusText={aiStatusText}
          riskScore={riskScore}
          isAlarmTriggered={isAlarmTriggered}
          handleDismissAlarm={handleDismissAlarm}
          handleLoadFilament={handleLoadFilament}
          handleUnloadFilament={handleUnloadFilament}
          controlTemp={controlTemp}
          controlAxis={controlAxis}
          controlSpeed={controlSpeed}
          speedLvl={speedLvl}
          rawAmsData={rawAmsData}
          activeTrayId={activeTrayId}
          machineStatus={machineStatus}
          editAmsFilament={editAmsFilament}
          loadAmsFilament={loadAmsFilament}
          cloudToken={cloudToken}
          onPrintAgain={onPrintAgain}
          hasAppUpdate={hasAppUpdate}
          autoOffEnabled={autoOffEnabled}
          setAutoOffEnabled={setAutoOffEnabled}
        />
      )}
      
      {isAlarmTriggered && (
        <HmsPopup 
          hmsErrors={hmsErrors} serial={serial} />
      )}

      {showFinishModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-sm flex flex-col items-center p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00e676] to-[#00b259]"></div>
            <div className="w-20 h-20 rounded-full bg-[#00e676]/20 flex items-center justify-center mb-4 mt-2">
              <svg viewBox="0 0 24 24" width="40" height="40" stroke="#00e676" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">In hoàn tất!</h2>
            <p className="text-[#a0a0a0] text-center mb-6">Mẫu in "{printSubtask || 'Không xác định'}" đã hoàn thành thành công.</p>
            <button 
              className="w-full bg-[#00e676] text-black font-semibold text-lg py-3 rounded-xl hover:bg-[#00c853] transition-colors"
              onClick={() => setShowFinishModal(false)}
            >
              OK, Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
