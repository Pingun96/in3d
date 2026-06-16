import React from 'react';
import { Sidebar } from './Sidebar';
import { HomeScreen } from './HomeScreen';
import { ControlScreen } from './ControlScreen';
import { FilamentScreen } from './FilamentScreen';
import { MessageScreen } from './MessageScreen';
import { SettingsScreen } from './SettingsScreen';
import { CameraScreen } from './CameraScreen';
import { PrintScreen } from './PrintScreen';
import { DarkRoomScreen } from './DarkRoomScreen';

interface DashboardProps {
  printerName: string;
  printState: string;
  printProgress: number;
  printTimeRemaining: number;
  printSubtask: string;
  coverImage?: string;
  nozzleTemp: number;
  nozzleTarget: number;
  bedTemp: number;
  bedTarget: number;
  chamberTemp: number;
  fanPart: number;
  fanAux: number;
  fanChamber: number;
  chamberLight: boolean;
  hmsErrors: any[];
  deviceInfo: any;
  amsList: any[];
  onControlLight: () => void;
  onControlFan: (type: string, value: number) => void;
  onControlPrint: (action: string) => void;
  onDisconnect: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Camera/AI props
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isAiActive: boolean;
  setIsAiActive: (val: boolean) => void;
  aiStatusText: string;
  riskScore: number;
  isAlarmTriggered: boolean;
  handleDismissAlarm: () => void;
  handleLoadFilament: () => void;
  handleUnloadFilament: () => void;
  controlTemp: (target: 'nozzle' | 'bed', temp: number) => void;
  controlAxis: (axis: 'X' | 'Y' | 'Z', distance: number) => void;
  controlSpeed: (level: number) => void;
  speedLvl?: number;
  rawAmsData: any;
  activeTrayId: number | null;
  machineStatus?: string;
  vtTray?: any;
  editAmsFilament: (amsId: number, trayId: number, type: string, color: string) => void;
  loadAmsFilament: (targetTray: number) => void;
  cloudToken?: string;
  onPrintAgain: (task: any) => void;
}

export function Dashboard(props: DashboardProps) {
  const [showDarkRoom, setShowDarkRoom] = React.useState(false);

  return (
    <>
      <div className="flex w-full h-full bg-[#0f1011] overflow-hidden text-white select-none">
        <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} hmsErrors={props.hmsErrors} printState={props.printState} />
        
        <div className="flex-1 h-full overflow-hidden relative flex flex-col">
          {props.activeTab === 'home' || props.activeTab === 'dashboard' ? (
            <HomeScreen
              printerName={props.printerName}
              printState={props.printState}
              printProgress={props.printProgress}
              printTimeRemaining={props.printTimeRemaining}
              printSubtask={props.printSubtask}
              coverImage={props.coverImage}
              nozzleTemp={props.nozzleTemp}
              nozzleTarget={props.nozzleTarget}
              bedTemp={props.bedTemp}
              bedTarget={props.bedTarget}
              chamberTemp={props.chamberTemp}
              chamberLight={props.chamberLight}
              onControlLight={props.onControlLight}
              onControlPrint={props.onControlPrint}
              machineStatus={props.machineStatus || props.printState}
              amsList={props.amsList}
              setActiveTab={props.setActiveTab}
              speedLvl={props.speedLvl}
              onOpenDarkRoom={() => setShowDarkRoom(true)}
            />
          ) : props.activeTab === 'control' ? (
            <ControlScreen
              controlAxis={props.controlAxis}
              controlTemp={props.controlTemp}
              fanPart={props.fanPart}
              fanAux={props.fanAux}
              fanChamber={props.fanChamber}
              onControlFan={props.onControlFan}
              nozzleTemp={props.nozzleTemp}
              nozzleTarget={props.nozzleTarget}
              bedTemp={props.bedTemp}
              bedTarget={props.bedTarget}
              chamberTemp={props.chamberTemp}
              chamberLight={props.chamberLight}
              onControlLight={props.onControlLight}
              controlSpeed={props.controlSpeed}
              speedLvl={props.speedLvl}
            />
          ) : props.activeTab === 'filament' ? (
            <FilamentScreen
              amsList={props.amsList}
              activeTrayId={props.activeTrayId}
              vtTray={props.vtTray}
              loadAmsFilament={props.loadAmsFilament}
              handleLoadFilament={props.handleLoadFilament}
              handleUnloadFilament={props.handleUnloadFilament}
              machineStatus={props.machineStatus || props.printState}
              editAmsFilament={props.editAmsFilament}
            />
          ) : props.activeTab === 'camera' ? (
            <CameraScreen />
          ) : props.activeTab === 'settings' ? (
            <SettingsScreen 
              printerName={props.printerName}
              ip={props.deviceInfo?.ip || ''}
              deviceInfo={props.deviceInfo}
              onLogout={props.onDisconnect}
            />
          ) : props.activeTab === 'message' ? (
            <MessageScreen hmsErrors={props.hmsErrors} />
          ) : props.activeTab === 'print' ? (
            <PrintScreen cloudToken={props.cloudToken || ''} onPrintAgain={props.onPrintAgain} />
          ) : (
            <HomeScreen {...props} machineStatus={props.machineStatus || props.printState} onOpenDarkRoom={() => setShowDarkRoom(true)} />
          )}
        </div>
      </div>

      {/* Dark Room Fullscreen Overlay */}
      {showDarkRoom && (
        <DarkRoomScreen 
          nozzleTemp={props.nozzleTemp}
          bedTemp={props.bedTemp}
          printTimeRemaining={props.printTimeRemaining}
          printState={props.printState}
          printProgress={props.printProgress}
          onClose={() => setShowDarkRoom(false)}
        />
      )}
    </>
  );
}
