const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('const setupMqttListeners = async () => {'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('await bambuBridge.onMessage(handleMqttMessage);'));

if (startIdx !== -1 && endIdx !== -1) {
  const newBlock = `  const setupMqttListeners = async () => {
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
          
          if (printData.gcode_state !== undefined) {
            const stateMap: {[key: string]: string} = {
              'IDLE': 'Sẵn sàng',
              'PREPARE': 'Đang chuẩn bị',
              'RUNNING': 'Đang in',
              'PAUSE': 'Tạm dừng',
              'FINISH': 'Hoàn thành',
              'FAILED': 'Lỗi',
              'OFFLINE': 'Ngoại tuyến'
            };
            setPrintState(stateMap[printData.gcode_state] || printData.gcode_state);
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

    await bambuBridge.onMessage(handleMqttMessage);`;

  lines.splice(startIdx, endIdx - startIdx + 1, newBlock);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log('Replaced successfully!');
} else {
  console.log('Could not find bounds', startIdx, endIdx);
}
