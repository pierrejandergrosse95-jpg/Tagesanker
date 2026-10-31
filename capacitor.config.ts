import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.klartakt.app',
  appName: 'KlarTakt',
  webDir: 'dist',
  android: { backgroundColor: '#F4EFE4' },
  plugins: {
    LocalNotifications: { smallIcon: 'ic_stat_klartakt', iconColor: '#1F3A2E' },
  },
};

export default config;
