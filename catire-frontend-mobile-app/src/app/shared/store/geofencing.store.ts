import { create } from 'zustand';
import * as Location from 'expo-location';

export interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
}

type GeofencingState = {
  currentLocation: { latitude: number; longitude: number } | null;
  nearbyBranches: GeofenceLocation[];
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  checkNearbyBranches: (branches: GeofenceLocation[]) => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
};

export const useGeofencingStore = create<GeofencingState>((set, get) => ({
  currentLocation: null,
  nearbyBranches: [],

  requestPermission: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  getCurrentLocation: async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      set({
        currentLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  },

  checkNearbyBranches: (branches) => {
    const { currentLocation } = get();
    if (!currentLocation) return;

    const nearby = branches.filter(branch => {
      const distance = get().calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        branch.latitude,
        branch.longitude
      );
      return distance <= branch.radius;
    });

    set({ nearbyBranches: nearby });
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },
}));
