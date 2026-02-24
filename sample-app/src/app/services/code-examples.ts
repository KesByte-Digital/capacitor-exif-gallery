import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CodeExamples {
  /**
   * Get installation example
   */
  getInstallationExample(): string {
    return `# Install the plugin
npm install @kesbyte/capacitor-exif-gallery

# Sync with native projects
npx cap sync

# iOS specific (if not already done)
cd ios/App && pod install`;
  }

  /**
   * Get import example
   */
  getImportExample(): string {
    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

// TypeScript types are included
import type {
  InitConfig,
  PickOptions,
  PickResult,
  ImageResult,
  FilterConfig,
  LocationFilter,
  TimeRangeFilter,
  ImageExif
} from '@kesbyte/capacitor-exif-gallery';`;
  }

  /**
   * Get basic usage example
   */
  getBasicExample(): string {
    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function pickImages() {
  try {
    // Initialize plugin (call once at app startup)
    await ExifGallery.initialize();

    // Open gallery - user can set filters manually
    const result = await ExifGallery.pick();

    if (result.cancelled) {
      console.log('User cancelled selection');
      return [];
    }

    console.log(\`Selected \${result.images.length} images\`);

    // Process each image
    result.images.forEach(image => {
      console.log(\`Image: \${image.uri}\`);
      console.log(\`Filtered by: \${image.filteredBy}\`);

      // Access EXIF data if available
      if (image.exif) {
        console.log(\`GPS: \${image.exif.lat}, \${image.exif.lng}\`);
        console.log(\`Timestamp: \${image.exif.timestamp}\`);
      }

      // Use webPath for displaying in <img> tags
      if (image.webPath) {
        console.log(\`Web path: \${image.webPath}\`);
      }
    });

    return result.images;
  } catch (error) {
    console.error('Failed to pick images:', error);
    throw error;
  }
}

pickImages();`;
  }

  /**
   * Get permissions example
   */
  getPermissionsExample(): string {
    return `// Permissions are handled automatically by the plugin

// iOS - Add to Info.plist
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to let you select images</string>

// iOS - Optional: Only needed if using location filtering
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to filter photos by GPS data</string>

// Android - Permissions declared automatically by plugin:
// - API 33+: READ_MEDIA_IMAGES (automatic)
// - API <33: READ_EXTERNAL_STORAGE with maxSdkVersion="32" (automatic)
// - Location: ACCESS_FINE_LOCATION (automatic if using location filter)

// Request permissions in code
import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function initializePlugin() {
  // Option 1: Request permissions upfront (e.g., during onboarding)
  await ExifGallery.initialize({
    requestPermissionsUpfront: true
  });

  // Option 2: Request permissions just-in-time (default)
  await ExifGallery.initialize();
  // Permissions will be requested when pick() is called
}

initializePlugin();`;
  }

  /**
   * Get initialization example
   */
  getConfigurationExample(): string {
    return `// Plugin initialization (call once at app startup)
import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function initializeApp() {
  // Basic initialization with defaults
  await ExifGallery.initialize();

  // With locale (supported: 'en', 'de', 'fr', 'es')
  await ExifGallery.initialize({
    locale: 'de'
  });

  // With custom text overrides
  await ExifGallery.initialize({
    locale: 'en',
    customTexts: {
      galleryTitle: 'Choose Photos',
      confirmButton: 'Done',
      selectAllButton: 'Select All'
    }
  });

  // Request permissions upfront
  await ExifGallery.initialize({
    requestPermissionsUpfront: true
  });

  // Full configuration example
  await ExifGallery.initialize({
    locale: 'de',
    requestPermissionsUpfront: true,
    customTexts: {
      galleryTitle: 'Fotos wählen',
      confirmButton: 'Fertig'
    }
  });
}

initializeApp();`;
  }

  /**
   * Get error handling example
   */
  getErrorHandlingExample(): string {
    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function pickImagesWithErrorHandling() {
  try {
    const result = await ExifGallery.pick({
      filter: {
        location: {
          polyline: [
            { lat: 52.52, lng: 13.405 },
            { lat: 52.51, lng: 13.39 }
          ],
          radius: 5000
        }
      }
    });

    // Check if user cancelled
    if (result.cancelled) {
      console.log('User cancelled selection');
      return [];
    }

    // Check if no images found
    if (result.images.length === 0) {
      console.warn('No images found matching the filter');
      return [];
    }

    return result.images;

  } catch (error: any) {
    // Handle different error cases
    if (error.message?.includes('permission')) {
      console.error('Permission denied');
      // Show user-friendly message
    } else if (error.message?.includes('initialization_required')) {
      console.error('Plugin not initialized. Call initialize() first.');
    } else if (error.message?.includes('filter_error')) {
      console.error('Invalid filter parameters');
    } else {
      console.error('Unexpected error:', error);
      // Log to error tracking service
    }

    throw error;
  }
}`;
  }

  /**
   * Get advanced combination example
   */
  getAdvancedExample(): string {
    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function pickImagesAdvanced() {
  // Combine location and time filters
  const result = await ExifGallery.pick({
    filter: {
      location: {
        polyline: [
          { lat: 52.520008, lng: 13.404954 }, // Berlin
          { lat: 48.856613, lng: 2.352222 }   // Paris
        ],
        radius: 10000 // 10km corridor
      },
      timeRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      }
    },
    distanceUnit: 'kilometers',
    distanceStep: 10,
    fallbackThreshold: 5,
    allowManualAdjustment: true
  });

  if (result.cancelled) {
    console.log('User cancelled');
    return { location: [], time: [] };
  }

  // Group images by filter type
  const grouped = result.images.reduce((acc, img) => {
    if (!acc[img.filteredBy]) acc[img.filteredBy] = [];
    acc[img.filteredBy].push(img);
    return acc;
  }, {} as Record<string, typeof result.images>);

  console.log(\`Location filtered: \${grouped.location?.length || 0}\`);
  console.log(\`Time filtered: \${grouped.time?.length || 0}\`);

  return grouped;
}`;
  }

  /**
   * Get TypeScript types example
   */
  getTypesExample(): string {
    return `// Core interfaces from capacitor-exif-gallery

// Plugin interface
interface ExifGalleryPlugin {
  initialize(config?: InitConfig): Promise<void>;
  pick(options?: PickOptions): Promise<PickResult>;
}

// Initialization configuration
interface InitConfig {
  locale?: 'en' | 'de' | 'fr' | 'es';
  customTexts?: Partial<TranslationSet>;
  requestPermissionsUpfront?: boolean;
}

// Pick options
interface PickOptions {
  filter?: FilterConfig;
  fallbackThreshold?: number;
  allowManualAdjustment?: boolean;
  distanceUnit?: 'kilometers' | 'miles';
  distanceStep?: number;
}

// Filter configuration
interface FilterConfig {
  location?: LocationFilter;
  timeRange?: TimeRangeFilter;
}

interface LocationFilter {
  polyline?: LatLng[] | string;  // Array or encoded polyline
  coordinates?: LatLng[];         // Individual points
  radius?: number;                // In meters
}

interface TimeRangeFilter {
  start: Date;
  end: Date;
}

// Result types
interface PickResult {
  images: ImageResult[];
  cancelled: boolean;
}

interface ImageResult {
  uri: string;                    // File URI (file://)
  webPath?: string;               // Web-safe path for <img>
  exif?: ImageExif;               // EXIF metadata
  filteredBy: 'location' | 'time';
}

interface ImageExif {
  lat?: number;                   // GPS latitude
  lng?: number;                   // GPS longitude
  timestamp?: Date;               // Photo timestamp
}`;
  }

  /**
   * Get code example for location filter
   */
  getLocationFilterExample(latitude: number, longitude: number, radiusKm: number): string {
    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function pickNearbyImages() {
  const result = await ExifGallery.pick({
    filter: {
      location: {
        coordinates: [
          { lat: ${latitude}, lng: ${longitude} }
        ],
        radius: ${radiusKm * 1000} // ${radiusKm}km in meters
      }
    },
    distanceUnit: 'kilometers',
    distanceStep: 5
  });

  return result.images;
}

pickNearbyImages();`;
  }

  /**
   * Get code example for polyline filter
   */
  getPolylineFilterExample(
    routeName: string,
    points: Array<{ lat: number; lng: number; label?: string }>,
    toleranceKm: number,
  ): string {
    const pointsCode = points
      .map(
        (p, i) =>
          `    { lat: ${p.lat}, lng: ${p.lng} }${p.label ? ` // ${p.label}` : ''}${i < points.length - 1 ? ',' : ''}`,
      )
      .join('\n');

    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function pickAlongRoute() {
  // Route: ${routeName}
  const result = await ExifGallery.pick({
    filter: {
      location: {
        polyline: [
${pointsCode}
        ],
        radius: ${toleranceKm * 1000} // ${toleranceKm}km corridor
      }
    },
    distanceUnit: 'kilometers',
    distanceStep: 5
  });

  return result.images;
}

pickAlongRoute();`;
  }

  /**
   * Get code example for encoded polyline filter
   */
  getEncodedPolylineExample(): string {
    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function pickWithEncodedPolyline() {
  // Using Google's Polyline Encoding Algorithm (precision 5)
  // This encoded string represents a route from Berlin to Paris
  const encodedPolyline = "_p~iF~ps|U_ulLnnqC_mqNvxq\`@";

  const result = await ExifGallery.pick({
    filter: {
      location: {
        polyline: encodedPolyline,  // Encoded polyline string
        radius: 5000                 // 5km corridor
      }
    },
    distanceUnit: 'kilometers'
  });

  // Benefits of encoded polylines:
  // - Compact: 50KB string can represent 1000+ points
  // - Max size: 50 KB encoded string
  // - Max points: 1,000 decoded points
  // - Precision: ±1 meter (precision 5)
  // - Compatible with Google Maps Directions API

  if (result.cancelled) {
    console.log('User cancelled');
    return [];
  }

  console.log(\`Found \${result.images.length} images along route\`);
  return result.images;
}

// Where to get encoded polylines:
// 1. Google Maps Directions API (routes.overview_polyline.points)
// 2. Google Maps JavaScript API (path.getEncodedPath())
// 3. Third-party encoding libraries (e.g., @mapbox/polyline)
// 4. Manual encoding with precision 5 or higher

pickWithEncodedPolyline();`;
  }

  /**
   * Get code example for time range filter
   */
  getTimeRangeFilterExample(startDate: Date, endDate: Date): string {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    return `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function pickImagesByDate() {
  const result = await ExifGallery.pick({
    filter: {
      timeRange: {
        start: new Date('${startStr}'),
        end: new Date('${endStr}')
      }
    },
    distanceUnit: 'kilometers',
    distanceStep: 5
  });

  return result.images;
}

pickImagesByDate();`;
  }
}
