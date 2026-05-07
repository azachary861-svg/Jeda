import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import {
  getTrackingStatus,
  requestLocationPermissions,
  startBackgroundTracking,
  stopBackgroundTracking,
} from '@/services/location-tracking';
import { requestNotificationPermissions } from '@/services/notifications';

export default function DriverHomeScreen() {
  const [locationStatus, setLocationStatus] = useState('Belum diaktifkan');
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    getTrackingStatus().then(setTracking).catch(() => setTracking(false));
  }, []);

  const requestLocation = async () => {
    const granted = await requestLocationPermissions();
    setLocationStatus(granted ? 'Aktif (foreground + background)' : 'Ditolak');
  };

  const startTracking = async () => {
    await startBackgroundTracking();
    setTracking(true);
  };

  const stopTracking = async () => {
    await stopBackgroundTracking();
    setTracking(false);
  };

  const requestNotif = async () => {
    const granted = await requestNotificationPermissions();
    setLocationStatus((current) => `${current} · notif ${granted ? 'on' : 'off'}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Status Saat Ini</Text>
        <Text style={styles.cardValue}>Standby</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Booking Aktif</Text>
        <Text style={styles.cardValue}>1 trip</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Izin Lokasi</Text>
        <Text>{locationStatus}</Text>
      </View>

      <Pressable onPress={requestLocation} style={styles.button}>
        <Text style={styles.buttonText}>Aktifkan GPS</Text>
      </Pressable>

      <Pressable onPress={tracking ? stopTracking : startTracking} style={styles.button}>
        <Text style={styles.buttonText}>{tracking ? 'Stop Background Tracking' : 'Start Background Tracking'}</Text>
      </Pressable>

      <Pressable onPress={requestNotif} style={[styles.button, styles.secondary]}>
        <Text style={styles.secondaryText}>Aktifkan Notifikasi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  cardLabel: {
    opacity: 0.7,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#0f766e',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#e2e8f0',
  },
  secondaryText: {
    textAlign: 'center',
    color: '#0f172a',
    fontWeight: '600',
  },
});
