import React, { useState, useEffect } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hmsErrors?: any[];
  printState?: string;
}

export function Sidebar({ activeTab, setActiveTab, hmsErrors, printState }: SidebarProps) {
  const [isPowerOn, setIsPowerOn] = useState<boolean | null>(null);

  const haUrl = 'http://600bk.cameraddns.net:8124';
  const haToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlOTg0ZTYzM2FiMTM0ZDdkYjYyODQ0ODA1NzY5OTEwNyIsImlhdCI6MTc4MDg5MjI3NCwiZXhwIjoyMDk2MjUyMjc0fQ.iu76GuCzF4WrZKbT3phHFHkXgSctuXToZBmkA0B8tQE';
  const haEntityId = 'switch.may_in_3d_socket_1';

  const fetchPowerState = async () => {
    try {
      const response = await fetch(`${haUrl}/api/states/${haEntityId}`, {
        headers: {
          'Authorization': `Bearer ${haToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIsPowerOn(data.state === 'on');
      }
    } catch (e) {
      // Ignore network errors silently for polling
    }
  };

  useEffect(() => {
    fetchPowerState();
    const interval = setInterval(fetchPowerState, 5000);
    return () => clearInterval(interval);
  }, []);

  // Custom SVG icons to match the Bambu UI
  const HomeIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M12 3l8 7v10h-5v-6H9v6H4V10l8-7z"/>
    </svg>
  );

  const ControlIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <rect x="5" y="4" width="4" height="16" rx="2" />
      <rect x="15" y="4" width="4" height="16" rx="2" />
      <rect x="2" y="10" width="10" height="4" rx="1" />
      <rect x="12" y="14" width="10" height="4" rx="1" />
    </svg>
  );

  const FilamentIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M5 4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4zm10 0c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2V4zM9 4h6v16H9z" />
    </svg>
  );

  const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  );

  const MessageIcon = () => {
    const hasErrors = hmsErrors && hmsErrors.length > 0;
    return (
      <div className="relative">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V6c0-1.1-.9-2-2-2zM6 12h2v2H6zm4 0h2v2h-2zm4 0h2v2h-2z" />
        </svg>
        {/* Red dot notification */}
        {hasErrors && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff5252] rounded-full border-2 border-[#1e1e1e]"></div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'home', icon: <HomeIcon /> },
    { id: 'control', icon: <ControlIcon /> },
    { id: 'filament', icon: <FilamentIcon /> },
    { id: 'settings', icon: <SettingsIcon /> },
    { id: 'message', icon: <MessageIcon /> },
  ];

  const PowerIcon = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
      <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
  );

  const togglePrinterPower = async () => {
    // Prevent turning off the printer while it's printing
    if (isPowerOn && (printState === 'RUNNING' || printState === 'PRINTING' || printState === 'PAUSE')) {
      alert('Máy in đang hoạt động. Cúp điện đột ngột có thể làm kẹt nhựa và hỏng máy in!');
      return;
    }

    // Hardcoded HA Configuration
    const haUrl = 'http://600bk.cameraddns.net:8124';
    const haToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJlOTg0ZTYzM2FiMTM0ZDdkYjYyODQ0ODA1NzY5OTEwNyIsImlhdCI6MTc4MDg5MjI3NCwiZXhwIjoyMDk2MjUyMjc0fQ.iu76GuCzF4WrZKbT3phHFHkXgSctuXToZBmkA0B8tQE';
    const haEntityId = 'switch.may_in_3d_socket_1';

    try {
      const response = await fetch(`${haUrl}/api/services/switch/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${haToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entity_id: haEntityId })
      });
      if (!response.ok) {
        alert('Failed to toggle power. Check your HA configuration.');
      } else {
        // Optimistically switch state
        setIsPowerOn(prev => prev === null ? null : !prev);
        setTimeout(fetchPowerState, 1500); // Poll again shortly after
      }
    } catch (e: any) {
      alert('Error toggling power: ' + e.message);
    }
  };

  return (
    <div className="w-14 sm:w-16 xl:w-20 h-full bg-[#1e1e1e] flex flex-col items-center py-1 sm:py-2 xl:py-6 border-r border-[#2b2b2b]">
      <div className="flex flex-col flex-1 w-full items-center justify-around xl:justify-evenly">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'text-[#00e676]'
                : 'text-[#888] hover:text-[#e0e0e0]'
            }`}
          >
            {tab.icon}
          </div>
        ))}
      </div>
      
      {/* Power Button */}
      <div className="mt-auto mb-2 w-full flex items-center justify-center">
        <div 
          onClick={togglePrinterPower}
          className={`w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 flex items-center justify-center rounded-xl cursor-pointer transition-colors hover:bg-[#333] ${
            isPowerOn === true ? 'text-[#00e676] shadow-[0_0_15px_rgba(0,230,118,0.2)]' : 
            isPowerOn === false ? 'text-[#ff5252]' : 
            'text-[#888]'
          }`}
          title="Toggle Printer Power (Home Assistant)"
        >
          <PowerIcon />
        </div>
      </div>
    </div>
  );
}
