import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useMapStore, DriverPin } from '@/lib/stores/useMapStore';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook untuk subscribe ke live GPS updates dari driver locations
 * Subscribes ke Supabase Realtime channel 'driver-locations'
 * Updates setiap 10 detik atau lebih cepat
 */
export function useRealtimeGPS(bookingId?: string) {
  const { selectedBookingId, updateDriverPin } = useMapStore();
  const targetBookingId = bookingId || selectedBookingId;

  useEffect(() => {
    if (!targetBookingId) return;
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        // Subscribe ke driver locations channel
        channel = supabase.channel(`booking-${targetBookingId}-location`);

        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'driver_locations',
              filter: `booking_id=eq.${targetBookingId}`,
            },
            (payload) => {
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const location = payload.new as any;

                // Update driver pin on map
                const driverPin: DriverPin = {
                  driverId: location.driver_id,
                  lat: parseFloat(location.latitude),
                  lng: parseFloat(location.longitude),
                  speed: parseFloat(location.speed || 0),
                  heading: parseFloat(location.heading || 0),
                  lastUpdate: new Date(location.last_seen),
                  name: 'Driver', // Will be enriched from profiles table
                  rating: 4.8, // Will be fetched from reviews
                };

                updateDriverPin(driverPin);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to setup GPS subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup
    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [targetBookingId, updateDriverPin]);
}

/**
 * Hook untuk subscribe ke live media uploads
 * Subscribes ke channel 'trip-{bookingId}-media'
 */
export function useRealtimeMedia(bookingId?: string) {
  const { selectedBookingId, addMediaItem } = useMapStore();
  const targetBookingId = bookingId || selectedBookingId;

  useEffect(() => {
    if (!targetBookingId) return;
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        channel = supabase.channel(`trip-${targetBookingId}-media`);

        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'trip_media',
              filter: `booking_id=eq.${targetBookingId}`,
            },
            (payload) => {
              const media = payload.new as any;

              addMediaItem({
                id: media.id,
                url: media.public_url,
                type: media.media_type === 'photo' ? 'photo' : 'video',
                caption: media.caption || '',
                timestamp: new Date(media.created_at),
                thumbnailUrl: media.thumbnail_url,
              });
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to setup media subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup
    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [targetBookingId, addMediaItem]);
}

/**
 * Hook untuk subscribe ke booking status changes
 */
export function useRealtimeBookingStatus(bookingId: string, onStatusChange?: (status: string) => void) {
  useEffect(() => {
    if (!bookingId) return;
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        channel = supabase.channel(`booking-${bookingId}-status`);

        channel
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'bookings',
              filter: `id=eq.${bookingId}`,
            },
            (payload) => {
              const booking = payload.new as any;
              onStatusChange?.(booking.status);
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to setup booking status subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [bookingId, onStatusChange]);
}
