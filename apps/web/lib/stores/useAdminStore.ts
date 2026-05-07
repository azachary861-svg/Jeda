import { create } from 'zustand';

interface RegionStats {
  id: string;
  name: string;
  activeTrips: number;
  completedTripsToday: number;
  revenue: number;
  avgRating: number;
}

interface SelectedTrip {
  id: string;
  clientName: string;
  driverId?: string;
  status: 'scheduled' | 'on_trip' | 'completed';
  pickupLocation: string;
  destination: string;
}

interface AdminStoreState {
  selectedRegion: string | null;
  regionStats: RegionStats[];
  selectedTrip: SelectedTrip | null;
  filters: {
    status: string;
    dateRange: [Date, Date] | null;
    driverId?: string;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedRegion: (regionId: string) => void;
  setRegionStats: (stats: RegionStats[]) => void;
  setSelectedTrip: (trip: SelectedTrip | null) => void;
  updateFilters: (filters: Partial<AdminStoreState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminStoreState>((set) => ({
  selectedRegion: null,
  regionStats: [],
  selectedTrip: null,
  filters: {
    status: 'all',
    dateRange: null,
  },
  isLoading: false,
  error: null,

  setSelectedRegion: (regionId: string) =>
    set({ selectedRegion: regionId }),

  setRegionStats: (stats: RegionStats[]) =>
    set({ regionStats: stats }),

  setSelectedTrip: (trip: SelectedTrip | null) =>
    set({ selectedTrip: trip }),

  updateFilters: (filters: Partial<AdminStoreState['filters']>) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),
}));
