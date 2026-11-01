import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.tagesanker.app',
  appName: 'Tagesanker',
  webDir: 'dist',
  android: { backgroundColor: '#0A120E' },
  plugins: {
    // Edge-to-Edge: Abstände für Notch/Statusleiste als CSS-Variablen (--safe-area-inset-*)
    SystemBars: { insetsHandling: 'css', initialViewportFitValueHint: 'cover' },
    LocalNotifications: { smallIcon: 'ic_stat_tagesanker', iconColor: '#6B1F2A' },
  },
};

export default config;
