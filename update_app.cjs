const fs = require('fs');
const path = require('path');
const filePath = path.join('d:', 'App Theo dõi IN 3D', 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// The return statement starts with "return (" and ends at the end of the file
const returnRegex = /return \([\s\S]*\}\;/;

const newReturn = `return (
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
          connectionError={connectionError}
          handleCloudLogin={handleCloudLogin}
          handleConnectCloudDevice={handleConnectCloudDevice}
          ip={ip}
          setIp={setIp}
          accessCode={accessCode}
          setAccessCode={setAccessCode}
          serial={serial}
          setSerial={setSerial}
          handleConnectLocal={handleConnectLocal}
        />
      ) : (
        <Dashboard
          printerName={cloudDevices.find(d => d.dev_id === serial)?.name || 'Bambu Printer'}
          printState={printState}
          printProgress={printProgress}
          printTimeRemaining={printTimeRemaining}
          printSubtask={printSubtask}
          nozzleTemp={nozzleTemp}
          nozzleTarget={nozzleTarget}
          bedTemp={bedTemp}
          bedTarget={bedTarget}
          chamberTemp={chamberTemp}
          fanPart={fanPart}
          fanAux={fanAux}
          fanChamber={fanChamber}
          chamberLight={chamberLight}
          amsList={amsList}
          onControlLight={controlLight}
          onControlFan={controlFan}
          onControlPrint={controlPrint}
          onDisconnect={handleDisconnect}
          activeTab={activeTab as 'dashboard' | 'camera'}
          setActiveTab={(tab) => setActiveTab(tab as any)}
          videoRef={videoRef}
          canvasRef={canvasRef}
          isAiActive={isAiActive}
          setIsAiActive={setIsAiActive}
          aiStatusText={aiStatusText}
          riskScore={riskScore}
          isAlarmTriggered={isAlarmTriggered}
          handleDismissAlarm={handleDismissAlarm}
        />
      )}
    </>
  );
}`;

content = content.replace(returnRegex, newReturn);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('App.tsx return updated');
