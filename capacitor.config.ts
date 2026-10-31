import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.tagesanker.app',
  appName: 'Tagesanker',
  webDir: 'dist',
  android: { backgroundColor: '#ECE0C2' },
  plugins: {
    LocalNotifications: { smallIcon: 'ic_stat_tagesanker', iconColor: '#6B1F2A' },
  },
};

export default config;
