import { useState, useCallback, useRef, useEffect } from 'react';
import * as Location from 'expo-location';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type LocationErrorCode =
  | 'GPS_PERMISSION_DENIED'
  | 'GPS_ACCURACY_LOW'
  | 'GPS_MOCK_DETECTED'
  | 'GPS_TIMEOUT'
  | 'GPS_UNAVAILABLE';

export interface LocationError {
  code: LocationErrorCode;
  message: string;
  accuracy?: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_ACCURACY_METERS = 50; // PRD §14.2.1: reject if accuracy > 50m
const LOCATION_TIMEOUT_MS = 10_000; // 10 seconds

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [lastPosition, setLastPosition] = useState<LocationResult | null>(null);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  /**
   * Request location permissions (foreground only).
   * Returns true if permission granted.
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError({
        code: 'GPS_PERMISSION_DENIED',
        message: 'Location permission is required for attendance.',
      });
      return false;
    }
    return true;
  }, []);

  /**
   * Get current GPS position with validation.
   * Throws LocationError if accuracy is too low.
   */
  const getPosition = useCallback(async (): Promise<LocationResult> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw {
          code: 'GPS_PERMISSION_DENIED' as LocationErrorCode,
          message: 'Location permission denied.',
        };
      }

      // 2. Check if location services enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw {
          code: 'GPS_UNAVAILABLE' as LocationErrorCode,
          message: 'Location services are disabled. Please enable GPS.',
        };
      }

      // 3. Get position with high accuracy
      const position = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject({
            code: 'GPS_TIMEOUT' as LocationErrorCode,
            message: 'GPS timed out. Please try again in an open area.',
          }), LOCATION_TIMEOUT_MS)
        ),
      ]);

      const { latitude, longitude, accuracy } = position.coords;

      // 4. Validate accuracy (PRD §14.2.1)
      if (accuracy !== null && accuracy > MAX_ACCURACY_METERS) {
        const err: LocationError = {
          code: 'GPS_ACCURACY_LOW',
          message: `GPS accuracy is ${Math.round(accuracy)}m (max ${MAX_ACCURACY_METERS}m). Move to an open area.`,
          accuracy,
        };
        setError(err);
        throw err;
      }

      // 5. Check for mock location (Android — PRD §14.2.2)
      if (position.mocked) {
        const err: LocationError = {
          code: 'GPS_MOCK_DETECTED',
          message: 'Mock location detected. Disable mock GPS apps.',
        };
        setError(err);
        throw err;
      }

      const result: LocationResult = {
        latitude,
        longitude,
        accuracy: accuracy ?? 0,
      };

      setLastPosition(result);
      return result;
    } catch (err: any) {
      if (err.code && err.message) {
        // Our typed error
        setError(err as LocationError);
        throw err;
      }
      // System error
      const locationError: LocationError = {
        code: 'GPS_UNAVAILABLE',
        message: 'Failed to get GPS position. Please try again.',
      };
      setError(locationError);
      throw locationError;
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  /**
   * Pre-warm GPS: start watching position in background.
   * Call this when QR scanner screen opens — so GPS is already cached
   * when the student scans a QR code (PRD risk mitigation for QR/GPS latency).
   */
  const startWatching = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    // Stop any existing watch
    if (watchSubscription.current) {
      watchSubscription.current.remove();
    }

    watchSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,  // Update every 3 seconds
        distanceInterval: 5, // Or when moved 5 meters
      },
      (position) => {
        if (position.coords.accuracy !== null && position.coords.accuracy <= MAX_ACCURACY_METERS) {
          setLastPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? 0,
          });
        }
      }
    );
  }, [requestPermission]);

  /**
   * Stop GPS watching to save battery.
   */
  const stopWatching = useCallback(() => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    getPosition,
    startWatching,
    stopWatching,
    lastPosition,
    loading,
    error,
    clearError: () => setError(null),
  };
}
