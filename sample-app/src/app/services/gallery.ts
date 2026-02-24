import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

export interface PickResult {
  images: Array<{
    uri: string;
    exif?: {
      lat?: number;
      lng?: number;
      timestamp?: Date;
    };
    [key: string]: any;
  }>;
  cancelled?: boolean;
  filterExecutionTimeMs?: number; // Time taken to execute the filter in milliseconds
}

export interface FilterOptions {
  location?: {
    center?: { latitude: number; longitude: number };
    polyline?: Array<{ lat: number; lng: number }>;
    coordinates?: Array<{ lat: number; lng: number }>; // For individual points
    radiusMeters?: number;
    radius?: number;
  };
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface PickOptions {
  filter?: FilterOptions;
  distanceUnit?: 'kilometers' | 'miles';
  distanceStep?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Gallery {
  /**
   * Get mock data for web platform
   */
  private getMockImages(options: PickOptions = {}): PickResult {
    const mockImages = [
      {
        uri: 'https://picsum.photos/800/600?random=1',
        webPath: 'https://picsum.photos/800/600?random=1', // On web, webPath = uri
        exif: {
          lat: 52.520008,
          lng: 13.404954,
          timestamp: new Date('2024-01-15T10:30:00'),
        },
      },
      {
        uri: 'https://picsum.photos/800/600?random=2',
        webPath: 'https://picsum.photos/800/600?random=2',
        exif: {
          lat: 48.856613,
          lng: 2.352222,
          timestamp: new Date('2024-02-20T14:45:00'),
        },
      },
      {
        uri: 'https://picsum.photos/800/600?random=3',
        webPath: 'https://picsum.photos/800/600?random=3',
        exif: {
          lat: 51.507351,
          lng: -0.127758,
          timestamp: new Date('2024-03-10T09:15:00'),
        },
      },
      {
        uri: 'https://picsum.photos/800/600?random=4',
        webPath: 'https://picsum.photos/800/600?random=4',
        exif: {
          lat: 40.712776,
          lng: -74.005974,
          timestamp: new Date('2024-04-05T16:20:00'),
        },
      },
      {
        uri: 'https://picsum.photos/800/600?random=5',
        webPath: 'https://picsum.photos/800/600?random=5',
        exif: {
          lat: 35.689487,
          lng: 139.691711,
          timestamp: new Date('2024-05-12T11:00:00'),
        },
      },
      {
        uri: 'https://picsum.photos/800/600?random=6',
        webPath: 'https://picsum.photos/800/600?random=6',
        // No EXIF data for testing
      },
      {
        uri: 'https://picsum.photos/800/600?random=7',
        webPath: 'https://picsum.photos/800/600?random=7',
        exif: {
          lat: -33.86882,
          lng: 151.20929,
          timestamp: new Date('2024-06-18T13:30:00'),
        },
      },
      {
        uri: 'https://picsum.photos/800/600?random=8',
        webPath: 'https://picsum.photos/800/600?random=8',
        exif: {
          lat: 37.774929,
          lng: -122.419418,
          timestamp: new Date('2024-07-22T15:45:00'),
        },
      },
    ];

    // Apply filter if provided (basic simulation)
    let filteredImages = [...mockImages];

    if (options.filter?.timeRange) {
      filteredImages = filteredImages.filter((img) => {
        if (!img.exif?.timestamp) return false;
        const imgDate = new Date(img.exif.timestamp);
        return imgDate >= options.filter!.timeRange!.start && imgDate <= options.filter!.timeRange!.end;
      });
    }

    if (options.filter?.location) {
      // Simple location filter simulation
      filteredImages = filteredImages.filter((img) => img.exif?.lat && img.exif?.lng);
    }

    return {
      images: filteredImages,
      cancelled: false,
      filterExecutionTimeMs: Math.random() * 500 + 50, // Mock: 50-550ms
    };
  }

  /**
   * Check if we're running on web platform
   */
  private isWebPlatform(): boolean {
    return Capacitor.getPlatform() === 'web';
  }

  /**
   * Pick images with location filter
   */
  async pickWithLocationFilter(latitude: number, longitude: number, radiusKm: number): Promise<PickResult> {
    if (this.isWebPlatform()) {
      return this.getMockImages({
        filter: {
          location: {
            coordinates: [{ lat: latitude, lng: longitude }],
            radius: radiusKm * 1000,
          },
        },
      });
    }

    return await ExifGallery.pick({
      filter: {
        location: {
          coordinates: [{ lat: latitude, lng: longitude }],
          radius: radiusKm * 1000,
        },
      },
      distanceUnit: 'kilometers',
      distanceStep: 5,
    });
  }

  /**
   * Pick images with polyline filter
   */
  async pickWithPolylineFilter(points: Array<{ lat: number; lng: number }>, toleranceKm: number): Promise<PickResult> {
    if (this.isWebPlatform()) {
      return this.getMockImages({
        filter: {
          location: {
            polyline: points,
            radius: toleranceKm * 1000,
          },
        },
      });
    }

    return await ExifGallery.pick({
      filter: {
        location: {
          polyline: points,
          radius: toleranceKm * 1000,
        },
      },
      distanceUnit: 'kilometers',
      distanceStep: 5,
    });
  }

  /**
   * Pick images with time range filter
   */
  async pickWithTimeRangeFilter(startDate: Date, endDate: Date): Promise<PickResult> {
    if (this.isWebPlatform()) {
      return this.getMockImages({
        filter: {
          timeRange: {
            start: startDate,
            end: endDate,
          },
        },
      });
    }

    return await ExifGallery.pick({
      filter: {
        timeRange: {
          start: startDate,
          end: endDate,
        },
      },
      distanceUnit: 'kilometers',
      distanceStep: 5,
    });
  }

  /**
   * Pick images with custom filter options
   */
  async pick(options: PickOptions): Promise<PickResult> {
    if (this.isWebPlatform()) {
      return this.getMockImages(options);
    }

    return await ExifGallery.pick(options);
  }

  /**
   * Check if plugin is available
   * On web platform, always returns true (uses mock data)
   */
  isAvailable(): boolean {
    if (this.isWebPlatform()) {
      return true; // Mock data always available
    }
    // On native platforms, plugin is always available (registered via Capacitor)
    return true;
  }
}
