import { create } from 'zustand';

export interface DriverPin {
  driverId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  lastUpdate: Date;
  name: string;
  rating: number;
}

export interface MediaFeedItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  caption: string;
  timestamp: Date;
  thumbnailUrl?: string;
}

interface MapStoreState {
  // Active booking being tracked
  selectedBookingId: string | null;
  
  // Map state
  center: [number, number];
  zoom: number;
  
  // Real-time data
  driverPins: Map<string, DriverPin>;
  mediaFeed: MediaFeedItem[];
  
  // UI state
  showMediaGallery: boolean;
  selectedMediaIndex: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedBooking: (bookingId: string | null) => void;
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
  updateDriverPin: (driver: DriverPin) => void;
  addMediaItem: (item: MediaFeedItem) => void;
  clearMedia: () => void;
  setShowMediaGallery: (show: boolean) => void;
  setSelectedMediaIndex: (index: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedBookingId: null,
  center: [-6.2088, 106.8456] as [number, number], // Jakarta default
  zoom: 12,
  driverPins: new Map<string, DriverPin>(),
  mediaFeed: [] as MediaFeedItem[],
  showMediaGallery: false,
  selectedMediaIndex: null,
  isLoading: false,
  error: null,
};

export const useMapStore = create<MapStoreState>((set) => ({
  ...initialState,

  setSelectedBooking: (bookingId: string | null) =>
    set({ selectedBookingId: bookingId }),

  setCenter: (lat: number, lng: number) =>
    set({ center: [lat, lng] }),

  setZoom: (zoom: number) =>
    set({ zoom }),

  updateDriverPin: (driver: DriverPin) =>
    set((state) => {
      const newPins = new Map(state.driverPins);
      newPins.set(driver.driverId, driver);
      return { driverPins: newPins };
    }),

  addMediaItem: (item: MediaFeedItem) =>
    set((state) => ({
      mediaFeed: [item, ...state.mediaFeed].slice(0, 50), // Keep last 50 items
    })),

  clearMedia: () =>
    set({ mediaFeed: [] }),

  setShowMediaGallery: (show: boolean) =>
    set({ showMediaGallery: show }),

  setSelectedMediaIndex: (index: number | null) =>
    set({ selectedMediaIndex: index }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  reset: () =>
    set(initialState),
}));
