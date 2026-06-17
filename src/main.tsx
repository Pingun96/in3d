import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StatusBar } from '@capacitor/status-bar'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import './index.css'
import App from './App.tsx'
import { NotificationProvider } from './context/NotificationContext'
import { CapacitorUpdater } from '@capgo/capacitor-updater';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>,
)

// Notify Capgo that the app has successfully loaded to prevent rollback
CapacitorUpdater.notifyAppReady().catch(console.error);
