import type { ExifGalleryPlugin, InitConfig, PickOptions, PickResult } from './definitions';
/**
 * TypeScript implementation of ExifGalleryPlugin.
 *
 * Handles:
 * - Translation loading and merging
 * - Plugin state management
 * - Validation
 * - Native bridge communication
 *
 * @internal
 */
export declare class ExifGalleryImpl implements ExifGalleryPlugin {
    /**
     * Native plugin instance for Capacitor Bridge communication.
     * @private
     */
    private nativePlugin;
    /**
     * Create ExifGalleryImpl instance with native bridge dependency.
     *
     * @param nativePlugin - Native plugin instance from Capacitor Bridge
     */
    constructor(nativePlugin: ExifGalleryPlugin);
    /**
     * Initialize the plugin with optional configuration.
     *
     * This method performs the following steps:
     * 1. Language Detection: Detects system language via navigator.language
     *    (e.g., 'de-DE' → 'de'), or uses explicit config.locale
     * 2. Default Loading: Loads appropriate translation file (en.json, de.json, fr.json, es.json)
     * 3. Fallback: Falls back to English if system language is not supported
     * 4. Merging: Merges config.customTexts on top of default translations
     * 5. Validation: Validates locale and customTexts keys
     * 6. Native Bridge: Passes translations and permissions to native layers
     * 7. State Update: Stores merged translations in PluginState singleton (only after native success)
     *
     * All InitConfig properties are optional:
     * - locale?: 'en' | 'de' | 'fr' | 'es' - Explicit language override
     * - customTexts?: Partial<TranslationSet> - Custom text overrides
     * - requestPermissionsUpfront?: boolean - Request Photo Library permissions immediately
     *
     * Permission Behavior:
     * - If requestPermissionsUpfront is true, native layers request Photo Library access
     * - The promise resolves regardless of whether permission was granted or denied
     * - If permission is denied, pick() will request it again when called
     * - Location permissions are NEVER requested upfront (only when filter uses location)
     * - Check logs for permission grant/deny status on Android
     *
     * Placeholder Syntax:
     * - {count}: Current selection count (e.g., "3")
     * - {total}: Total available items (e.g., "24")
     * - Example: "{count} of {total} selected" → "3 of 24 selected"
     *
     * @param config - Optional initialization configuration
     * @returns Promise that resolves when initialization is complete
     * @throws {Error} If locale is invalid (not 'en' | 'de' | 'fr' | 'es')
     * @throws {Error} If customTexts contains invalid keys
     * @throws {Error} If native initialization fails
     *
     * @example
     * ```typescript
     * // System language detection (navigator.language)
     * await ExifGallery.initialize();
     *
     * // Explicit locale
     * await ExifGallery.initialize({ locale: 'de' });
     *
     * // Custom text overrides with system language detection
     * await ExifGallery.initialize({
     *   customTexts: {
     *     galleryTitle: 'Pick Your Photos',
     *     confirmButton: 'Done',
     *   },
     * });
     *
     * // Explicit locale + custom overrides
     * await ExifGallery.initialize({
     *   locale: 'en',
     *   customTexts: {
     *     galleryTitle: 'Choose Images',
     *   },
     * });
     *
     * // Request permissions upfront
     * await ExifGallery.initialize({
     *   requestPermissionsUpfront: true,
     * });
     * ```
     */
    initialize(config?: InitConfig): Promise<void>;
    /**
     * Open native gallery with optional filter configuration.
     *
     * This method performs the following steps:
     * 1. Initialization Check: Verifies initialize() was called
     * 2. Concurrent Check: Prevents opening multiple pickers simultaneously
     * 3. Filter Validation: Validates all filter parameters
     * 4. Default Values: Applies defaults for fallbackThreshold and allowManualAdjustment
     * 5. Native Bridge: Calls native layer with filter configuration
     * 6. Result Handling: Returns PickResult with selected images
     *
     * Filter Options:
     * - filter.location.polyline: Array of LatLng defining a path (min 2 points)
     * - filter.location.coordinates: Array of LatLng for specific locations
     * - filter.location.radius: Search radius in meters (default: 100, must be > 0)
     * - filter.timeRange.start: Start date/time (must be before end)
     * - filter.timeRange.end: End date/time (must be after start)
     * - fallbackThreshold: Minimum images to show filter UI (default: 5)
     * - allowManualAdjustment: Allow user to adjust filters (default: true)
     *
     * @param options - Optional picker configuration
     * @returns Promise<PickResult> with selected images array and cancelled flag
     * @throws {Error} 'initialization_required' if initialize() not called
     * @throws {Error} 'picker_in_progress' if picker is already open
     * @throws {Error} 'filter_error' if filter parameters are invalid
     *
     * @example
     * ```typescript
     * // Simple pick without filters
     * const result = await ExifGallery.pick();
     *
     * // Location filter with coordinates
     * const result = await ExifGallery.pick({
     *   filter: {
     *     location: {
     *       coordinates: [{ lat: 48.8566, lng: 2.3522 }], // Paris
     *       radius: 500 // 500 meters
     *     }
     *   }
     * });
     *
     * // Time range filter
     * const result = await ExifGallery.pick({
     *   filter: {
     *     timeRange: {
     *       start: new Date('2024-01-01'),
     *       end: new Date('2024-12-31')
     *     }
     *   }
     * });
     *
     * // Combined filters with custom options
     * const result = await ExifGallery.pick({
     *   filter: {
     *     location: {
     *       polyline: [
     *         { lat: 48.8566, lng: 2.3522 },
     *         { lat: 48.8606, lng: 2.3376 }
     *       ],
     *       radius: 200
     *     },
     *     timeRange: {
     *       start: new Date('2024-06-01'),
     *       end: new Date('2024-06-30')
     *     }
     *   },
     *   fallbackThreshold: 10,
     *   allowManualAdjustment: false
     * });
     * ```
     */
    pick(options?: PickOptions): Promise<PickResult>;
    /**
     * Detects if active filters are present in pick options.
     *
     * **Story 8.2:** Used to determine filter button visibility.
     *
     * Note: This is called AFTER FilterValidator.validateFilterConfig(),
     * so encoded polyline strings have already been decoded to arrays.
     *
     * @param options - Pick options to check
     * @returns true if location or time filters are present
     */
    private hasActiveFilters;
}
