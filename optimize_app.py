import re

filepath = r"d:\App Theo dõi IN 3D\src\App.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import useCallback
content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect, useCallback } from 'react';")

# 2. Add throttle function outside App
throttle_fn = """
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
"""
content = content.replace("export default function App() {", throttle_fn + "\nexport default function App() {")

# 3. Throttle MQTT handler
# We will wrap the onMessage callback in a throttled function. Wait, the state updates are inside the callback.
# We don't want to lose the latest message. If we throttle the handler itself, we might drop the most recent message.
# The custom throttle ensures the trailing edge is executed.
target_mqtt_handler = "await bambuBridge.onMessage((event) => {"
replacement_mqtt_handler = """    const handleMqttMessage = throttle((event: any) => {
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
          if (printData.gcode_state !== undefined) setPrintState(printData.gcode_state);
          if (printData.subtask_name !== undefined) setPrintSubtask(printData.subtask_name);
          if (printData.lights_report && Array.isArray(printData.lights_report)) {
            const chamber = printData.lights_report.find((l: any) => l.node === 'chamber_light');
            if (chamber) setChamberLight(chamber.mode === 'on');
          }
          if (printData.cooling_fan_speed !== undefined) setFanPart(Math.round((printData.cooling_fan_speed / 15) * 100));
          if (printData.heatbreak_fan_speed !== undefined) setFanAux(Math.round((printData.heatbreak_fan_speed / 15) * 100));
          if (printData.big_fan1_speed !== undefined) setFanChamber(Math.round((printData.big_fan1_speed / 15) * 100));
          if (printData.mc_print_stage !== undefined) setMachineStatus(getPrintStageString(printData.mc_print_stage));
          
          if (printData.hms && Array.isArray(printData.hms)) {
            setHmsErrors(printData.hms);
          } else if (printData.hms !== undefined && printData.hms.length === 0) {
            setHmsErrors([]);
          }
          
          let newAmsList = null;
          
          if (printData.ams) {
            setRawAmsData(printData.ams); // Store raw data for debugging
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
          
          if ((!newAmsList || newAmsList.length === 0) && printData.vt_tray) {
            if (printData.vt_tray.tray_id_name !== undefined) {
              setActiveTrayId(254);
            }
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
    }, 200); // Throttle to max 5 times per second

    await bambuBridge.onMessage(handleMqttMessage);"""

# The original block spans from line 77 to 138.
# We will use regex to replace it
content = re.sub(r'await bambuBridge\.onMessage\(\(event\) => \{.*?\n    \}\);\n', replacement_mqtt_handler + "\n", content, flags=re.DOTALL)


# 4. Memoize all callbacks
callbacks = {
    "const handleDisconnect = async () => {": "const handleDisconnect = useCallback(async () => {",
    "if (isAiActive) setIsAiActive(false);\n  };": "if (isAiActive) setIsAiActive(false);\n  }, [isAiActive]);",
    
    "const controlLight = () => {": "const controlLight = useCallback(() => {",
    "setChamberLight(newState);\n  };": "setChamberLight(newState);\n  }, [chamberLight, serial]);",
    
    "const controlFan = (fanType: string, value: number) => {": "const controlFan = useCallback((fanType: string, value: number) => {",
    "if (fanType === 'chamber') setFanChamber(value);\n  };": "if (fanType === 'chamber') setFanChamber(value);\n  }, [serial]);",
    
    "const controlPrint = (action: string) => {": "const controlPrint = useCallback((action: string) => {",
    "print: { sequence_id: '0', command: action }\n    });\n  };": "print: { sequence_id: '0', command: action }\n    });\n  }, [serial]);",
    
    "const handleDismissAlarm = () => {": "const handleDismissAlarm = useCallback(() => {",
    "setAiStatusText('Đã bỏ qua cảnh báo.');\n  };": "setAiStatusText('Đã bỏ qua cảnh báo.');\n  }, []);",
    
    "const handleLoadFilament = () => {": "const handleLoadFilament = useCallback(() => {",
    "bambuBridge.loadFilament(serial);\n  };": "bambuBridge.loadFilament(serial);\n  }, [serial]);",
    
    "const handleUnloadFilament = () => {": "const handleUnloadFilament = useCallback(() => {",
    "bambuBridge.unloadFilament(serial);\n  };": "bambuBridge.unloadFilament(serial);\n  }, [serial]);",
    
    "const controlTemp = (target: 'nozzle' | 'bed', temp: number) => {": "const controlTemp = useCallback((target: 'nozzle' | 'bed', temp: number) => {",
    "if (target === 'bed') setBedTarget(temp);\n  };": "if (target === 'bed') setBedTarget(temp);\n  }, [serial]);",
    
    "const controlAxis = (axis: 'X' | 'Y' | 'Z', distance: number) => {": "const controlAxis = useCallback((axis: 'X' | 'Y' | 'Z', distance: number) => {",
    "print: { sequence_id: '0', command: 'gcode_line', param: gcode }\n    });\n  };": "print: { sequence_id: '0', command: 'gcode_line', param: gcode }\n    });\n  }, [serial]);",
    
    "const controlSpeed = (level: number) => {": "const controlSpeed = useCallback((level: number) => {",
    "print: { sequence_id: '0', command: 'print_speed', param: level.toString() }\n    });\n  };": "print: { sequence_id: '0', command: 'print_speed', param: level.toString() }\n    });\n  }, [serial]);",
    
    "const editAmsFilament = (amsId: number, trayId: number, type: string, color: string) => {": "const editAmsFilament = useCallback((amsId: number, trayId: number, type: string, color: string) => {",
    "bambuBridge.setAmsFilament(serial, amsId, trayId, brand, material, color);\n  };": "bambuBridge.setAmsFilament(serial, amsId, trayId, brand, material, color);\n  }, [serial]);",
    
    "const loadAmsFilament = (targetTray: number) => {": "const loadAmsFilament = useCallback((targetTray: number) => {",
    "bambuBridge.amsChangeFilament(serial, targetTray);\n  };": "bambuBridge.amsChangeFilament(serial, targetTray);\n  }, [serial]);",
}

for k, v in callbacks.items():
    content = content.replace(k, v)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("App.tsx optimized.")
