'use client';

import { useEffect, useRef } from 'react';
import Map, { Marker, Popup, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { useMapStore } from '@/lib/stores/useMapStore';
import { useRealtimeGPS, useRealtimeMedia } from '@/lib/hooks/useRealtimeGPS';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin, Video, Image } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RealTripMapProps {
  bookingId?: string;
  height?: string;
  showMediaGallery?: boolean;
}

/**
 * Live map component menampilkan:
 * - Real-time driver location (GPS)
 * - Route history
 * - Media feed (photos/videos) dari driver
 * - ETA estimate
 *
 * CRITICAL FEATURE: Key differentiator vs Klook/Airbnb
 */
export function RealTripMap({
  bookingId,
  height = 'h-96',
  showMediaGallery = true,
}: RealTripMapProps) {
  const mapRef = useRef<any>(null);
  const {
    center,
    zoom,
    driverPins,
    mediaFeed,
    selectedMediaIndex,
    setCenter,
    setZoom,
    setSelectedMediaIndex,
  } = useMapStore();

  // Subscribe to real-time GPS
  useRealtimeGPS(bookingId);

  // Subscribe to real-time media
  useRealtimeMedia(bookingId);

  // Zoom to first driver when loaded
  useEffect(() => {
    if (driverPins.size > 0 && mapRef.current) {
      const firstDriver = Array.from(driverPins.values())[0];
      setCenter(firstDriver.lat, firstDriver.lng);
      setZoom(14);
    }
  }, [driverPins, setCenter, setZoom]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Mapbox token not configured</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col ${height} bg-white rounded-lg border`}>
      {/* Map Container */}
      <div className="flex-1 relative">
        {driverPins.size === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-t-lg">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Waiting for driver location...</p>
            </div>
          </div>
        )}

        <Map
          ref={mapRef}
          initialViewState={{
            longitude: center[1],
            latitude: center[0],
            zoom: zoom,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          onMove={(evt: ViewStateChangeEvent) => {
            setCenter(evt.viewState.latitude, evt.viewState.longitude);
            setZoom(evt.viewState.zoom);
          }}
        >
          {/* Driver Pins */}
          {Array.from(driverPins.values()).map((driver) => (
            <Marker
              key={driver.driverId}
              longitude={driver.lng}
              latitude={driver.lat}
              anchor="bottom"
            >
              <div
                className="bg-primary text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-opacity-90"
                style={{
                  transform: `rotate(${driver.heading}deg)`,
                }}
              >
                <MapPin className="h-5 w-5" />
              </div>

              {/* Driver Info Popup */}
              <Popup
                longitude={driver.lng}
                latitude={driver.lat}
                anchor="top"
                offset={[0, -10]}
                closeButton={false}
              >
                <div className="p-3">
                  <p className="font-medium">{driver.name}</p>
                  <p className="text-sm text-gray-600">Rating: ⭐ {driver.rating}</p>
                  <p className="text-xs text-gray-500">
                    Updated: {driver.lastUpdate.toLocaleTimeString()}
                  </p>
                  {driver.speed > 0 && (
                    <p className="text-xs text-gray-500">Speed: {Math.round(driver.speed)} km/h</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </Map>
      </div>

      {/* Media Feed */}
      {showMediaGallery && mediaFeed.length > 0 && (
        <div className="border-t bg-gray-50 p-4">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Live Photos & Videos ({mediaFeed.length})
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {mediaFeed.slice(0, 8).map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedMediaIndex(idx)}
                className={`flex-shrink-0 relative rounded-lg overflow-hidden h-16 w-16 ${
                  selectedMediaIndex === idx ? 'ring-2 ring-primary' : ''
                }`}
              >
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Video className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Media Viewer */}
          {selectedMediaIndex !== null && mediaFeed[selectedMediaIndex] && (
            <div className="mt-3 p-3 bg-white rounded-lg border">
              <img
                src={mediaFeed[selectedMediaIndex].url}
                alt={mediaFeed[selectedMediaIndex].caption}
                className="w-full rounded-md mb-2 max-h-40 object-cover"
              />
              <p className="text-sm text-gray-700">{mediaFeed[selectedMediaIndex].caption}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(mediaFeed[selectedMediaIndex].timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RealTripMap;
