import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { supabase } from '@/lib/supabase';

const LOCATION_TASK_NAME = 'jeda-driver-background-location';

type TaskData = {
  locations: Array<Location.LocationObject>;
};

async function pushDriverLocation(location: Location.LocationObject) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('driver_locations').upsert(
    {
      driver_id: user.id,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      status: 'on_trip',
      is_sharing: true,
      last_seen: new Date().toISOString(),
    },
    { onConflict: 'driver_id' },
  );
}

TaskManager.defineTask<TaskData>(
  LOCATION_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<TaskData>) => {
  if (error || !data?.locations?.length) {
    return;
  }

  const latest = data.locations[data.locations.length - 1];
  await pushDriverLocation(latest);
  },
);

export async function requestLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  const background = await Location.requestBackgroundPermissionsAsync();

  return foreground.status === 'granted' && background.status === 'granted';
}

export async function startBackgroundTracking() {
  const granted = await requestLocationPermissions();
  if (!granted) {
    throw new Error('Izin lokasi foreground/background dibutuhkan.');
  }

  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (alreadyStarted) return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 10000,
    distanceInterval: 20,
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: 'Jeda Driver Tracking Aktif',
      notificationBody: 'Lokasi trip sedang dikirim untuk live map.',
    },
  });
}

export async function stopBackgroundTracking() {
  const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!started) return;
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
}

export async function getTrackingStatus() {
  return Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
}
