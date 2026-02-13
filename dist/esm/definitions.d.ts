/**
 * Supported languages for built-in translations.
 */
export type SupportedLocale = 'en' | 'de' | 'fr' | 'es';
/**
 * Distance unit for radius display in filter dialog.
 *
 * @since 1.1.0
 */
export type DistanceUnit = 'kilometers' | 'miles';
/**
 * Complete set of UI text keys used by the plugin.
 * All keys are required for a complete translation.
 */
export interface TranslationSet {
    /** Gallery screen title */
    galleryTitle: string;
    /** "Select" button text */
    selectButton: string;
    /** "Cancel" button text (also used for accessibility label on icon-only cancel button) */
    cancelButton: string;
    /** "Select All" button text */
    selectAllButton: string;
    /** "Deselect All" button text */
    deselectAllButton: string;
    /** Selection counter text. Placeholders: {count}, {total} */
    selectionCounter: string;
    /** "Confirm" button text (also used for accessibility label on icon-only confirm button) */
    confirmButton: string;
    /** "Filter" button accessibility label (optional, falls back to filterDialogTitle) */
    filterButton?: string;
    /** Filter dialog title */
    filterDialogTitle: string;
    /** "Radius (meters)" label */
    radiusLabel: string;
    /** "Start Date" label */
    startDateLabel: string;
    /** "End Date" label */
    endDateLabel: string;
    /** "Loading images..." message */
    loadingMessage: string;
    /** "No images found" message */
    emptyMessage: string;
    /** "An error occurred" message */
    errorMessage: string;
    /** "Retry" button text */
    retryButton: string;
    /** "Plugin not initialized" error */
    initializationError: string;
    /** "Permission denied" error */
    permissionError: string;
    /** "Invalid filter parameters" error */
    filterError: string;
    /** Photo access required message (shown when user denies photo permission) */
    noStoragePermission?: string;
    /** Permanent photo denial message (shown when user selects "Don't ask again" on Android) */
    noStoragePermissionPermanent?: string;
    /** Photo access restricted message (shown on iOS when restricted by parental controls/MDM) */
    noStoragePermissionRestricted?: string;
    /** Location access required message (shown when user denies location permission) */
    noLocationPermission?: string;
    /** Location permission fallback message (informational, shown when falling back to time filtering) */
    locationPermissionFallback?: string;
    /** "Open Settings" button text (opens system settings for permission management) */
    openSettings?: string;
    /** "OK" button text (generic confirmation, used in location fallback dialog) */
    ok?: string;
}
/**
 * Plugin initialization configuration.
 * All properties are optional.
 */
export interface InitConfig {
    /**
     * Optional locale to use for UI text.
     * If not provided, system language is detected automatically.
     * Falls back to English if system language is not supported.
     *
     * @example
     * ```typescript
     * await ExifGallery.initialize({ locale: 'de' });
     * ```
     */
    locale?: SupportedLocale;
    /**
     * Optional custom text overrides.
     * Merges on top of default translations for the selected locale.
     * Partial object - only override the keys you need.
     *
     * @example
     * ```typescript
     * await ExifGallery.initialize({
     *   customTexts: {
     *     galleryTitle: 'Choose Your Photos',
     *     confirmButton: 'Done'
     *   }
     * });
     * ```
     */
    customTexts?: Partial<TranslationSet>;
    /**
     * Whether to request photo library permissions immediately during initialization.
     * Default: false (permissions requested just-in-time when pick() is called)
     *
     * Set to true if you want to request permissions upfront (e.g., during onboarding).
     *
     * @example
     * ```typescript
     * await ExifGallery.initialize({ requestPermissionsUpfront: true });
     * ```
     */
    requestPermissionsUpfront?: boolean;
}
/**
 * Geographic coordinate with latitude and longitude.
 */
export interface LatLng {
    /** Latitude in decimal degrees */
    lat: number;
    /** Longitude in decimal degrees */
    lng: number;
}
/**
 * Location-based filter configuration.
 */
export interface LocationFilter {
    /**
     * GPS track as array of coordinates OR encoded polyline string.
     *
     * **Coordinate Array Format:**
     * ```typescript
     * polyline: [{ lat: 38.5, lng: -120.2 }, { lat: 40.7, lng: -120.95 }]
     * ```
     *
     * **Encoded Polyline Format (Google's Polyline Encoding Algorithm, precision 5):**
     * ```typescript
     * polyline: "_p~iF~ps|U_ulLnnqC"
     * ```
     *
     * Note: Precision 5 provides ±1 meter accuracy (Google Maps default).
     * Higher precision polylines (6+) are also supported.
     *
     * Images within `radius` meters of any point on the polyline will match.
     *
     * **Limits:**
     * - Max encoded string: 50 KB
     * - Max decoded points: 1,000
     * - Min points: 2 (to define a path)
     *
     * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
     * @example
     * // Using encoded polyline (from Google Maps API)
     * const result = await ExifGallery.pick({
     *   filter: {
     *     location: {
     *       polyline: "_p~iF~ps|U_ulLnnqC",
     *       radius: 5000
     *     }
     *   }
     * });
     *
     * @example
     * // Using coordinate array
     * const result = await ExifGallery.pick({
     *   filter: {
     *     location: {
     *       polyline: [
     *         { lat: 48.8566, lng: 2.3522 },
     *         { lat: 48.8606, lng: 2.3376 }
     *       ],
     *       radius: 5000
     *     }
     *   }
     * });
     */
    polyline?: LatLng[] | string;
    /**
     * Individual coordinate points (e.g., from map markers).
     * Images within `radius` meters of any coordinate will match.
     */
    coordinates?: LatLng[];
    /**
     * Search radius in meters.
     * Default: 100
     *
     * @example
     * ```typescript
     * {
     *   polyline: [{lat: 48.1, lng: 11.5}, {lat: 48.2, lng: 11.6}],
     *   radius: 1000  // 1km radius
     * }
     * ```
     */
    radius?: number;
}
/**
 * Time range filter configuration.
 */
export interface TimeRangeFilter {
    /**
     * Start date/time for the filter.
     * Images taken at or after this time will match.
     */
    start: Date;
    /**
     * End date/time for the filter.
     * Images taken at or before this time will match.
     */
    end: Date;
}
/**
 * Combined filter configuration for location and/or time.
 */
export interface FilterConfig {
    /**
     * Optional location-based filter.
     * If provided with timeRange, both filters are applied (AND condition).
     */
    location?: LocationFilter;
    /**
     * Optional time range filter.
     * If provided with location, both filters are applied (AND condition).
     */
    timeRange?: TimeRangeFilter;
}
/**
 * Options for the pick() method.
 */
export interface PickOptions {
    /**
     * Optional filter configuration to pre-configure the gallery.
     * If not provided, user can manually set filters in the gallery UI.
     *
     * @example
     * ```typescript
     * await ExifGallery.pick({
     *   filter: {
     *     location: {
     *       coordinates: [{lat: 48.1, lng: 11.5}],
     *       radius: 500
     *     }
     *   }
     * });
     * ```
     */
    filter?: FilterConfig;
    /**
     * Minimum number of results required before automatic fallback to time filter.
     * If location filter returns fewer images than this threshold,
     * the plugin automatically falls back to time-based filtering.
     *
     * Default: 5
     *
     * @example
     * ```typescript
     * await ExifGallery.pick({
     *   filter: { location: {...} },
     *   fallbackThreshold: 10  // Fallback if < 10 images found
     * });
     * ```
     */
    fallbackThreshold?: number;
    /**
     * Whether to allow user to manually adjust filters in the gallery UI.
     * Default: true
     *
     * Set to false if you want to enforce the provided filter configuration.
     */
    allowManualAdjustment?: boolean;
    /**
     * Distance unit for radius display in filter dialog.
     *
     * **Default:** `'kilometers'`
     *
     * **Supported units:**
     * - `'kilometers'`: Display as km (1000m = 1km)
     * - `'miles'`: Display as miles (1609.34m = 1mi)
     *
     * @since 1.1.0
     *
     * @example
     * ```typescript
     * // Use miles for US users
     * await ExifGallery.pick({
     *   filter: { location: {...} },
     *   distanceUnit: 'miles'
     * });
     *
     * // Use kilometers (default)
     * await ExifGallery.pick({
     *   filter: { location: {...} }
     * });
     *
     * // Based on user preference
     * const userUnit = userSettings.useMetric ? 'kilometers' : 'miles';
     * await ExifGallery.pick({
     *   filter: { location: {...} },
     *   distanceUnit: userUnit
     * });
     * ```
     */
    distanceUnit?: DistanceUnit;
    /**
     * Step size for distance filter slider (in kilometers).
     *
     * Defines the granularity of the radius adjustment slider in the filter dialog.
     *
     * **Default:** `5` (5km steps)
     *
     * **Range:** 1 - 25 km
     *
     * @since 1.2.0
     *
     * @example
     * ```typescript
     * // Fine-grained control: 1km steps (5, 6, 7, 8, ...)
     * await ExifGallery.pick({
     *   filter: { location: {...} },
     *   distanceStep: 1
     * });
     *
     * // Default: 5km steps (5, 10, 15, 20, ...)
     * await ExifGallery.pick({
     *   filter: { location: {...} }
     *   // distanceStep defaults to 5
     * });
     *
     * // Coarse control: 10km steps (10, 20, 30, 40, 50)
     * await ExifGallery.pick({
     *   filter: { location: {...} },
     *   distanceStep: 10
     * });
     *
     * // Can be combined with distanceUnit
     * await ExifGallery.pick({
     *   filter: { location: {...} },
     *   distanceUnit: 'miles',
     *   distanceStep: 5  // 5km steps, displayed as miles
     * });
     * ```
     */
    distanceStep?: number;
}
/**
 * EXIF metadata extracted from an image.
 */
export interface ImageExif {
    /** Latitude from GPS EXIF data (if available) */
    lat?: number;
    /** Longitude from GPS EXIF data (if available) */
    lng?: number;
    /** Timestamp from EXIF DateTimeOriginal (if available) */
    timestamp?: Date;
}
/**
 * Single image result from pick().
 */
export interface ImageResult {
    /**
     * File URI for the image (file:// path).
     * Can be used to display or upload the image.
     */
    uri: string;
    /**
     * EXIF metadata if available.
     * May be undefined if image has no EXIF data.
     */
    exif?: ImageExif;
    /**
     * How this image was filtered.
     * - 'location': Matched location filter
     * - 'time': Matched time filter (or fallback from location filter)
     */
    filteredBy: 'location' | 'time';
}
/**
 * Result from pick() method.
 */
export interface PickResult {
    /**
     * Array of selected images.
     * Empty if user cancelled or no images matched filters.
     */
    images: ImageResult[];
    /**
     * True if user explicitly cancelled the selection.
     * False if user confirmed selection (even if no images selected).
     */
    cancelled: boolean;
}
/**
 * Main plugin interface.
 *
 * @example
 * ```typescript
 * import { ExifGallery } from 'capacitor-exif-gallery';
 *
 * // Initialize plugin (once at app startup)
 * await ExifGallery.initialize({
 *   locale: 'de',
 *   customTexts: {
 *     galleryTitle: 'Wähle Fotos'
 *   }
 * });
 *
 * // Open gallery with filter
 * const result = await ExifGallery.pick({
 *   filter: {
 *     location: {
 *       polyline: gpsTrack,  // LatLng[]
 *       radius: 1000
 *     }
 *   },
 *   fallbackThreshold: 5
 * });
 *
 * if (!result.cancelled) {
 *   console.log(`Selected ${result.images.length} images`);
 *   result.images.forEach(img => {
 *     console.log(`Image: ${img.uri}, filtered by: ${img.filteredBy}`);
 *   });
 * }
 * ```
 */
export interface ExifGalleryPlugin {
    /**
     * Initialize the plugin with optional configuration.
     *
     * Must be called before pick(). Can be called multiple times to update configuration.
     *
     * **Default behavior (no config):**
     * - Detects system language automatically
     * - Uses built-in English/German/French/Spanish translations
     * - Requests permissions just-in-time (when pick() is called)
     *
     * @param config - Optional configuration object
     * @returns Promise that resolves when initialization is complete
     *
     * @throws {Error} If locale is invalid or customTexts contain unknown keys
     *
     * @example
     * ```typescript
     * // Minimal - use defaults
     * await ExifGallery.initialize();
     *
     * // With locale
     * await ExifGallery.initialize({ locale: 'de' });
     *
     * // With custom text overrides
     * await ExifGallery.initialize({
     *   customTexts: {
     *     galleryTitle: 'Choose Photos',
     *     confirmButton: 'Done'
     *   }
     * });
     *
     * // Request permissions upfront
     * await ExifGallery.initialize({
     *   requestPermissionsUpfront: true
     * });
     * ```
     */
    initialize(config?: InitConfig): Promise<void>;
    /**
     * Open native gallery with optional filters and return selected images.
     *
     * Must call initialize() first, otherwise throws initialization_required error.
     *
     * **Filter behavior:**
     * - If filter provided: Gallery opens with pre-configured filters
     * - If no filter: User can manually set filters in gallery UI
     * - Auto-fallback: If location filter returns < fallbackThreshold images, falls back to time filter
     *
     * @param options - Optional pick options with filters
     * @returns Promise with selected images or cancellation status
     *
     * @throws {Error} 'initialization_required' if initialize() not called
     * @throws {Error} 'no_permission' if required permissions denied
     * @throws {Error} 'filter_error' if filter parameters are invalid
     *
     * @example
     * ```typescript
     * // No filter - user sets filters manually
     * const result = await ExifGallery.pick();
     *
     * // Location filter with polyline
     * const result = await ExifGallery.pick({
     *   filter: {
     *     location: {
     *       polyline: [{lat: 48.1, lng: 11.5}, {lat: 48.2, lng: 11.6}],
     *       radius: 1000
     *     }
     *   }
     * });
     *
     * // Time range filter
     * const result = await ExifGallery.pick({
     *   filter: {
     *     timeRange: {
     *       start: new Date('2024-01-01'),
     *       end: new Date('2024-01-31')
     *     }
     *   }
     * });
     *
     * // Combined filters
     * const result = await ExifGallery.pick({
     *   filter: {
     *     location: { coordinates: [{lat: 48.1, lng: 11.5}], radius: 500 },
     *     timeRange: { start: new Date('2024-01-01'), end: new Date() }
     *   },
     *   fallbackThreshold: 10,
     *   allowManualAdjustment: false
     * });
     *
     * // Handle result
     * if (!result.cancelled) {
     *   console.log(`Selected ${result.images.length} images`);
     *   for (const img of result.images) {
     *     console.log(`${img.uri} - filtered by ${img.filteredBy}`);
     *     if (img.exif) {
     *       console.log(`  GPS: ${img.exif.lat}, ${img.exif.lng}`);
     *       console.log(`  Time: ${img.exif.timestamp}`);
     *     }
     *   }
     * }
     * ```
     */
    pick(options?: PickOptions): Promise<PickResult>;
}
