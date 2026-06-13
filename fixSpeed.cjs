const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add speedLvl state
content = content.replace(
  'const [vtTray, setVtTray] = useState<any>(null);',
  'const [vtTray, setVtTray] = useState<any>(null);\n  const [speedLvl, setSpeedLvl] = useState(2);'
);

// 2. Extract spd_lvl in handleMqttMessage
content = content.replace(
  'if (printData.mc_remaining_time !== undefined) setPrintTimeRemaining(printData.mc_remaining_time);',
  'if (printData.mc_remaining_time !== undefined) setPrintTimeRemaining(printData.mc_remaining_time);\n          if (printData.spd_lvl !== undefined) setSpeedLvl(printData.spd_lvl);'
);

// 3. Optimistic UI update in controlSpeed
content = content.replace(
  /const controlSpeed = useCallback\(\(level: number\) => \{\s*bambuBridge.publish\(`device\/\$\{serial\}\/request`, \{\s*print: \{ sequence_id: '0', command: 'print_speed', param: level.toString\(\) \}\s*\}\);\s*\}, \[serial\]\);/,
  `const controlSpeed = useCallback((level: number) => {
    bambuBridge.publish(\`device/\${serial}/request\`, {
      print: { sequence_id: '0', command: 'print_speed', param: level.toString() }
    });
    setSpeedLvl(level);
  }, [serial]);`
);

// 4. Pass speedLvl to Dashboard
content = content.replace(
  'controlSpeed={controlSpeed}',
  'controlSpeed={controlSpeed}\n          speedLvl={speedLvl}'
);

fs.writeFileSync('src/App.tsx', content);
