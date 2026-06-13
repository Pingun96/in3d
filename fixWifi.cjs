const fs = require('fs');
let content = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');

// Add deviceInfo to props interface
if (!content.includes('deviceInfo?: any;')) {
    content = content.replace(
        '  speedLvl?: number;',
        '  speedLvl?: number;\n  deviceInfo?: any;'
    );
}

// Add deviceInfo to destructuring
if (content.includes('  speedLvl\n}: HomeScreenProps')) {
    content = content.replace(
        '  speedLvl\n}: HomeScreenProps',
        '  speedLvl,\n  deviceInfo\n}: HomeScreenProps'
    );
}

// Compute wifi color logic
const colorLogic = `
  // Compute WiFi color
  let wifiColor = '#00e676'; // Default green
  if (deviceInfo && deviceInfo.wifi_signal) {
    const signalStr = String(deviceInfo.wifi_signal);
    const signalMatch = signalStr.match(/([-+]?\\d+)/);
    if (signalMatch) {
      const signalValue = parseInt(signalMatch[1], 10);
      if (signalValue > -60) {
        wifiColor = '#00e676'; // Strong: Green
      } else if (signalValue > -75) {
        wifiColor = '#ffeb3b'; // Acceptable: Yellow
      } else {
        wifiColor = '#f44336'; // Weak: Red
      }
    }
  }
`;

if (!content.includes('wifiColor =')) {
    content = content.replace(
        '  // Get AMS data',
        colorLogic + '\n  // Get AMS data'
    );
}

// Update Wifi icon to use the computed color
content = content.replace(
    '<Wifi size={26} className="text-[#00e676]" strokeWidth={2.5} />',
    '<Wifi size={26} color={wifiColor} strokeWidth={2.5} />'
);

fs.writeFileSync('src/components/HomeScreen.tsx', content);
