import { Injectable } from '@angular/core';
import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface GeolocationError {
  code: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  constructor() {}

  /**
   * Get current position with fast network-based location
   * Uses progressive enhancement: tries fast location first, falls back to high accuracy if needed
   * @param options Position options (timeout, maximumAge, enableHighAccuracy)
   * @returns Promise with position data
   */
  async getCurrentPosition(options?: PositionOptions): Promise<Position> {
    try {
      // Check if running on native platform
      if (Capacitor.isNativePlatform()) {
        // Check permissions first on native
        const permission = await this.checkPermissions();
        if (permission !== 'granted') {
          throw this.createError('PERMISSION_DENIED', 'Location permission denied. Please enable in Settings.');
        }
      }

      // If user explicitly provided options, use them
      if (options) {
        const position = await Geolocation.getCurrentPosition(options);
        return position;
      }

      // Progressive enhancement: try fast location first
      try {
        const fastOptions: PositionOptions = {
          enableHighAccuracy: false, // Use network location (WiFi/Cell - much faster)
          timeout: 5000, // 5 second timeout
          maximumAge: 60000, // Accept position up to 1 minute old
        };

        const position = await Geolocation.getCurrentPosition(fastOptions);

        // Validate accuracy - if better than 500m, it's good enough for most use cases
        if (position.coords.accuracy <= 500) {
          return position;
        }

        // If accuracy is poor, fall through to high accuracy mode
      } catch (fastError) {
        // Fast location failed, fall through to high accuracy mode
      }

      // Fallback: high accuracy mode (slower but more precise)
      const highAccuracyOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 second timeout for GPS
        maximumAge: 30000, // Accept position up to 30 seconds old
      };

      const position = await Geolocation.getCurrentPosition(highAccuracyOptions);
      return position;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get high accuracy position using GPS
   * Use this for precise location requirements (e.g., navigation, exact coordinates)
   * Note: This is slower and drains more battery than getCurrentPosition()
   * @param options Position options
   * @returns Promise with position data
   */
  async getHighAccuracyPosition(options?: PositionOptions): Promise<Position> {
    try {
      // Check if running on native platform
      if (Capacitor.isNativePlatform()) {
        // Check permissions first on native
        const permission = await this.checkPermissions();
        if (permission !== 'granted') {
          throw this.createError('PERMISSION_DENIED', 'Location permission denied. Please enable in Settings.');
        }
      }

      const highAccuracyOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options,
      };

      const position = await Geolocation.getCurrentPosition(highAccuracyOptions);
      return position;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Check location permissions
   * @returns Permission state: 'granted', 'denied', or 'prompt'
   */
  async checkPermissions(): Promise<string> {
    try {
      const result = await Geolocation.checkPermissions();
      return result.location;
    } catch (error) {
      console.error('Permission check failed:', error);
      return 'denied';
    }
  }

  /**
   * Request location permissions
   * @returns Permission state after request
   */
  async requestPermissions(): Promise<string> {
    try {
      const result = await Geolocation.requestPermissions();
      return result.location;
    } catch (error) {
      console.error('Permission request failed:', error);
      return 'denied';
    }
  }

  /**
   * Check if geolocation is available
   * @returns true if geolocation is supported
   */
  isAvailable(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    // Check browser support
    return 'geolocation' in navigator;
  }

  /**
   * Handle geolocation errors
   * @param error Error object
   * @returns Formatted error with user-friendly message
   */
  private handleError(error: any): GeolocationError {
    console.error('Geolocation error:', error);

    // Handle Capacitor/native errors
    if (error.message) {
      if (error.message.includes('permission') || error.message.includes('denied')) {
        return this.createError('PERMISSION_DENIED', 'Location permission denied. Please enable in Settings.');
      }
      if (error.message.includes('timeout')) {
        return this.createError(
          'TIMEOUT',
          'Location request timed out. Please check if location services are enabled and try again.',
        );
      }
      if (error.message.includes('unavailable') || error.message.includes('not available')) {
        return this.createError('POSITION_UNAVAILABLE', 'Could not get your location. Please try again.');
      }
    }

    // Handle browser GeolocationPositionError
    if (error.code) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          return this.createError('PERMISSION_DENIED', 'Location permission denied. Please enable in Settings.');
        case 2: // POSITION_UNAVAILABLE
          return this.createError('POSITION_UNAVAILABLE', 'Could not get your location. Please try again.');
        case 3: // TIMEOUT
          return this.createError('TIMEOUT', 'Location request timed out. Please try again.');
        default:
          return this.createError('UNKNOWN_ERROR', 'An unknown error occurred while getting location.');
      }
    }

    // Generic error
    return this.createError('UNKNOWN_ERROR', error.message || 'Failed to get location. Please try again.');
  }

  /**
   * Create formatted error object
   */
  private createError(code: string, message: string): GeolocationError {
    const errorCodes: { [key: string]: number } = {
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
      UNKNOWN_ERROR: 0,
    };

    return {
      code: errorCodes[code] || 0,
      message,
    };
  }
}
