const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
content = content.replace(
  'const [speedLvl, setSpeedLvl] = useState(2);',
  'const [speedLvl, setSpeedLvl] = useState(2);\n  const [showFinishModal, setShowFinishModal] = useState(false);'
);

// 2. Update state logic
content = content.replace(
  `          if (printData.gcode_state !== undefined) {
            setPrintState(printData.gcode_state);
          }`,
  `          if (printData.gcode_state !== undefined) {
            setPrintState(prev => {
              if (prev === 'RUNNING' && printData.gcode_state === 'FINISH') {
                setShowFinishModal(true);
              }
              return printData.gcode_state;
            });
          }`
);

// 3. Add Modal component
const modalCode = `
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
      )}`;

content = content.replace(
  `    </>\n  );\n}\n`,
  `${modalCode}\n    </>\n  );\n}\n`
);

fs.writeFileSync('src/App.tsx', content);
