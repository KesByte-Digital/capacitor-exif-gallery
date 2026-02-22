import { FilterValidator } from './FilterValidator';
import { PluginState } from './PluginState';
import { TranslationLoader } from './TranslationLoader';
import { InitializationRequiredError, PickerInProgressError, FilterError } from './errors';
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
export class ExifGalleryImpl {
    /**
     * Create ExifGalleryImpl instance with native bridge dependency.
     *
     * @param nativePlugin - Native plugin instance from Capacitor Bridge
     */
    constructor(nativePlugin) {
        this.nativePlugin = nativePlugin;
    }
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
    async initialize(config) {
        var _a;
        const state = PluginState.getInstance();
        // Load and merge translations (async: detects device language)
        const mergedTranslations = await TranslationLoader.loadTranslations(config === null || config === void 0 ? void 0 : config.locale, config === null || config === void 0 ? void 0 : config.customTexts);
        const requestPermissionsUpfront = (_a = config === null || config === void 0 ? void 0 : config.requestPermissionsUpfront) !== null && _a !== void 0 ? _a : false;
        // Call native layer FIRST (before updating state)
        // If native call fails, state remains unchanged
        await this.nativePlugin.initialize({
            locale: undefined, // Not needed, we pass full translations
            customTexts: mergedTranslations, // Full merged TranslationSet
            requestPermissionsUpfront,
        });
        // Only update state after native confirmation
        state.setRequestPermissionsUpfront(requestPermissionsUpfront);
        state.setMergedTranslations(mergedTranslations);
        state.setInitialized(true);
    }
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
    async pick(options) {
        var _a, _b, _c, _d;
        const state = PluginState.getInstance();
        // 1. Verify plugin is initialized
        if (!state.isInitialized()) {
            throw new InitializationRequiredError();
        }
        // 2. Prevent concurrent picker operations (atomic check-and-set)
        if (!state.trySetPickerInProgress()) {
            throw new PickerInProgressError();
        }
        try {
            // Picker is now marked as in progress (atomic operation above)
            // 3. Validate filter configuration if provided
            if (options === null || options === void 0 ? void 0 : options.filter) {
                FilterValidator.validateFilterConfig(options.filter);
            }
            // 4. Apply default values and convert Date objects to timestamps
            const pickOptions = {
                fallbackThreshold: (_a = options === null || options === void 0 ? void 0 : options.fallbackThreshold) !== null && _a !== void 0 ? _a : 5,
                allowManualAdjustment: (_b = options === null || options === void 0 ? void 0 : options.allowManualAdjustment) !== null && _b !== void 0 ? _b : true,
                hasActiveFilters: this.hasActiveFilters(options), // Story 8.2: Detect active filters
                distanceUnit: (_c = options === null || options === void 0 ? void 0 : options.distanceUnit) !== null && _c !== void 0 ? _c : 'kilometers',
                distanceStep: (_d = options === null || options === void 0 ? void 0 : options.distanceStep) !== null && _d !== void 0 ? _d : 5,
            };
            // Convert filter configuration for native bridge
            if (options === null || options === void 0 ? void 0 : options.filter) {
                pickOptions.filter = {};
                // Copy location filter as-is
                if (options.filter.location) {
                    pickOptions.filter.location = options.filter.location;
                }
                // Convert Date objects to timestamps (milliseconds) for native bridge
                if (options.filter.timeRange) {
                    pickOptions.filter.timeRange = {
                        start: options.filter.timeRange.start.getTime(),
                        end: options.filter.timeRange.end.getTime(),
                    };
                }
            }
            // Validate fallbackThreshold
            if (pickOptions.fallbackThreshold !== undefined) {
                if (typeof pickOptions.fallbackThreshold !== 'number' || !isFinite(pickOptions.fallbackThreshold)) {
                    throw new FilterError('fallbackThreshold must be a finite number');
                }
                if (pickOptions.fallbackThreshold < 0) {
                    throw new FilterError('fallbackThreshold must be greater than or equal to 0');
                }
                // Prevent unreasonably large threshold
                if (pickOptions.fallbackThreshold > 10000) {
                    throw new FilterError('fallbackThreshold must not exceed 10,000');
                }
            }
            // Validate allowManualAdjustment
            if (pickOptions.allowManualAdjustment !== undefined) {
                if (typeof pickOptions.allowManualAdjustment !== 'boolean') {
                    throw new FilterError('allowManualAdjustment must be a boolean');
                }
            }
            // Validate distanceUnit
            if (pickOptions.distanceUnit !== undefined) {
                const validUnits = ['kilometers', 'miles'];
                if (!validUnits.includes(pickOptions.distanceUnit)) {
                    throw new FilterError(`distanceUnit must be one of: ${validUnits.join(', ')}`);
                }
            }
            // Validate distanceStep
            if (pickOptions.distanceStep !== undefined) {
                if (typeof pickOptions.distanceStep !== 'number' || !isFinite(pickOptions.distanceStep)) {
                    throw new FilterError('distanceStep must be a finite number');
                }
                if (pickOptions.distanceStep < 1) {
                    throw new FilterError('distanceStep must be at least 1 km');
                }
                if (pickOptions.distanceStep > 25) {
                    throw new FilterError('distanceStep must not exceed 25 km');
                }
            }
            // 5. Call native layer via Capacitor Bridge
            const result = await this.nativePlugin.pick(pickOptions);
            return result;
        }
        finally {
            // 6. Always clear picker in progress flag (success or error)
            state.setPickerInProgress(false);
        }
    }
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
    hasActiveFilters(options) {
        var _a, _b, _c, _d;
        if (!(options === null || options === void 0 ? void 0 : options.filter))
            return false;
        // Check for location filter (coordinates array or polyline)
        // Note: polyline can be string OR array, but after validation it's always an array
        const polyline = (_a = options.filter.location) === null || _a === void 0 ? void 0 : _a.polyline;
        const hasPolyline = Array.isArray(polyline)
            ? polyline.length > 0
            : typeof polyline === 'string'
                ? polyline.trim().length > 0
                : false;
        const hasLocationFilter = !!(((_c = (_b = options.filter.location) === null || _b === void 0 ? void 0 : _b.coordinates) === null || _c === void 0 ? void 0 : _c.length) || hasPolyline);
        const hasTimeFilter = !!(((_d = options.filter.timeRange) === null || _d === void 0 ? void 0 : _d.start) && options.filter.timeRange.end);
        return hasLocationFilter || hasTimeFilter;
    }
}
//# sourceMappingURL=ExifGalleryImpl.js.map