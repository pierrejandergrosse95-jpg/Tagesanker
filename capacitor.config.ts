import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.tagesanker.app',
  appName: 'Tagesanker',
  webDir: 'dist',
  android: { backgroundColor: '#F4EFE4' },
  plugins: {
    LocalNotifications: { smallIcon: 'ic_stat_tagesanker', iconColor: '#1F3A2E' },
  },
};

export default config;
