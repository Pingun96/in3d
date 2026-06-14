import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StatusBar } from '@capacitor/status-bar'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import './index.css'
import App from './App.tsx'

// Hide status bar and lock landscape
const initializeApp = async () => {
  try {
    await StatusBar.hide();
  } catch (e) {
    // Ignore on web
  }
  try {
    await ScreenOrientation.lock({ orientation: 'landscape' });
  } catch (e) {
    // Ignore on web
  }
};

initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
