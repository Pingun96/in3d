import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bambuscreen.app',
  appName: 'Bambu Screen',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true
    },
    CapacitorUpdater: {
      autoUpdate: false
    }
  },
  ios: {
    scrollEnabled: false,
    allowsLinkPreview: false
  }
};

export default config;
