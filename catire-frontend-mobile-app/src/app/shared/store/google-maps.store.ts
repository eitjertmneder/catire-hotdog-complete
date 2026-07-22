import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  place_id?: string;
}

export interface DeliveryRoute {
  id: string;
  origin: MapLocation;
  destination: MapLocation;
  distance: number; // km
  duration: number; // minutes
  polyline: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  location: MapLocation;
  rating: number;
  distance: number;
  type: string;
}

type GoogleMapsState = {
  currentLocation: MapLocation | null;
  selectedLocation: MapLocation | null;
  deliveryRoutes: DeliveryRoute[];
  nearbyPlaces: NearbyPlace[];
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<MapLocation | null>;
  geocodeAddress: (address: string) => Promise<MapLocation | null>;
  reverseGeocode: (location: MapLocation) => Promise<string | null>;
  calculateRoute: (origin: MapLocation, destination: MapLocation) => Promise<DeliveryRoute | null>;
  getNearbyPlaces: (location: MapLocation, type: string, radius: number) => Promise<NearbyPlace[]>;
  openInMaps: (location: MapLocation) => void;
  calculateDistance: (origin: MapLocation, destination: MapLocation) => number;
};

export const useGoogleMapsStore = create<GoogleMapsState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      selectedLocation: null,
      deliveryRoutes: [],
      nearbyPlaces: [],

      requestLocationPermission: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      },

      getCurrentLocation: async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          const mapLocation: MapLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          set({ currentLocation: mapLocation });
          return mapLocation;
        } catch (error) {
          console.error('Error getting location:', error);
          return null;
        }
      },

      geocodeAddress: async (address) => {
        try {
          const results = await Location.geocodeAsync(address);
          if (results.length > 0) {
            return {
              latitude: results[0].latitude,
              longitude: results[0].longitude,
              address,
            };
          }
          return null;
        } catch (error) {
          console.error('Error geocoding:', error);
          return null;
        }
      },

      reverseGeocode: async (location) => {
        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          
          if (results.length > 0) {
            const place = results[0];
            return `${place.street || ''} ${place.name || ''}, ${place.city || ''}, ${place.region || ''}`.trim();
          }
          return null;
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          return null;
        }
      },

      calculateRoute: async (origin, destination) => {
        // Simulated route calculation
        const distance = get().calculateDistance(origin, destination);
        const duration = Math.round(distance * 3); // Rough estimate: 3 min per km

        const route: DeliveryRoute = {
          id: Date.now().toString(),
          origin,
          destination,
          distance,
          duration,
          polyline: '', // Would be actual polyline from Google API
        };

        set((state) => ({
          deliveryRoutes: [route, ...state.deliveryRoutes],
        }));

        return route;
      },

      getNearbyPlaces: async (location, type, radius) => {
        // Simulated nearby places
        const places: NearbyPlace[] = [
          {
            id: '1',
            name: 'Centro Comercial',
            location: {
              latitude: location.latitude + 0.001,
              longitude: location.longitude + 0.001,
            },
            rating: 4.5,
            distance: 0.5,
            type: 'shopping_mall',
          },
          {
            id: '2',
            name: 'Farmacia',
            location: {
              latitude: location.latitude - 0.001,
              longitude: location.longitude + 0.002,
            },
            rating: 4.2,
            distance: 0.8,
            type: 'pharmacy',
          },
        ];

        set({ nearbyPlaces: places });
        return places;
      },

      openInMaps: (location) => {
        const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        // In production, use Linking.openURL(url)
        console.log('Opening maps:', url);
      },

      calculateDistance: (origin, destination) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (origin.latitude * Math.PI) / 180;
        const φ2 = (destination.latitude * Math.PI) / 180;
        const Δφ = ((destination.latitude - origin.latitude) * Math.PI) / 180;
        const Δλ = ((destination.longitude - origin.longitude) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c / 1000; // Return in km
      },
    }),
    {
      name: 'google-maps-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
