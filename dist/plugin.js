var capacitorExifGalleryPlugin = (function (exports, core) {
    'use strict';

    var polyline = {exports: {}};

    var hasRequiredPolyline;

    function requirePolyline () {
    	if (hasRequiredPolyline) return polyline.exports;
    	hasRequiredPolyline = 1;
    	(function (module) {

    		/**
    		 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
    		 *
    		 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
    		 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
    		 *
    		 * @module polyline
    		 */

    		var polyline = {};

    		function py2_round(value) {
    		    // Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
    		    return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
    		}

    		function encode(current, previous, factor) {
    		    current = py2_round(current * factor);
    		    previous = py2_round(previous * factor);
    		    var coordinate = (current - previous) * 2;
    		    if (coordinate < 0) {
    		        coordinate = -coordinate - 1;
    		    }
    		    var output = '';
    		    while (coordinate >= 0x20) {
    		        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
    		        coordinate /= 32;
    		    }
    		    output += String.fromCharCode((coordinate | 0) + 63);
    		    return output;
    		}

    		/**
    		 * Decodes to a [latitude, longitude] coordinates array.
    		 *
    		 * This is adapted from the implementation in Project-OSRM.
    		 *
    		 * @param {String} str
    		 * @param {Number} precision
    		 * @returns {Array}
    		 *
    		 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
    		 */
    		polyline.decode = function(str, precision) {
    		    var index = 0,
    		        lat = 0,
    		        lng = 0,
    		        coordinates = [],
    		        shift = 0,
    		        result = 0,
    		        byte = null,
    		        latitude_change,
    		        longitude_change,
    		        factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

    		    // Coordinates have variable length when encoded, so just keep
    		    // track of whether we've hit the end of the string. In each
    		    // loop iteration, a single coordinate is decoded.
    		    while (index < str.length) {

    		        // Reset shift, result, and byte
    		        byte = null;
    		        shift = 1;
    		        result = 0;

    		        do {
    		            byte = str.charCodeAt(index++) - 63;
    		            result += (byte & 0x1f) * shift;
    		            shift *= 32;
    		        } while (byte >= 0x20);

    		        latitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

    		        shift = 1;
    		        result = 0;

    		        do {
    		            byte = str.charCodeAt(index++) - 63;
    		            result += (byte & 0x1f) * shift;
    		            shift *= 32;
    		        } while (byte >= 0x20);

    		        longitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

    		        lat += latitude_change;
    		        lng += longitude_change;

    		        coordinates.push([lat / factor, lng / factor]);
    		    }

    		    return coordinates;
    		};

    		/**
    		 * Encodes the given [latitude, longitude] coordinates array.
    		 *
    		 * @param {Array.<Array.<Number>>} coordinates
    		 * @param {Number} precision
    		 * @returns {String}
    		 */
    		polyline.encode = function(coordinates, precision) {
    		    if (!coordinates.length) { return ''; }

    		    var factor = Math.pow(10, Number.isInteger(precision) ? precision : 5),
    		        output = encode(coordinates[0][0], 0, factor) + encode(coordinates[0][1], 0, factor);

    		    for (var i = 1; i < coordinates.length; i++) {
    		        var a = coordinates[i], b = coordinates[i - 1];
    		        output += encode(a[0], b[0], factor);
    		        output += encode(a[1], b[1], factor);
    		    }

    		    return output;
    		};

    		function flipped(coords) {
    		    var flipped = [];
    		    for (var i = 0; i < coords.length; i++) {
    		        var coord = coords[i].slice();
    		        flipped.push([coord[1], coord[0]]);
    		    }
    		    return flipped;
    		}

    		/**
    		 * Encodes a GeoJSON LineString feature/geometry.
    		 *
    		 * @param {Object} geojson
    		 * @param {Number} precision
    		 * @returns {String}
    		 */
    		polyline.fromGeoJSON = function(geojson, precision) {
    		    if (geojson && geojson.type === 'Feature') {
    		        geojson = geojson.geometry;
    		    }
    		    if (!geojson || geojson.type !== 'LineString') {
    		        throw new Error('Input must be a GeoJSON LineString');
    		    }
    		    return polyline.encode(flipped(geojson.coordinates), precision);
    		};

    		/**
    		 * Decodes to a GeoJSON LineString geometry.
    		 *
    		 * @param {String} str
    		 * @param {Number} precision
    		 * @returns {Object}
    		 */
    		polyline.toGeoJSON = function(str, precision) {
    		    var coords = polyline.decode(str, precision);
    		    return {
    		        type: 'LineString',
    		        coordinates: flipped(coords)
    		    };
    		};

    		if (module.exports) {
    		    module.exports = polyline;
    		} 
    	} (polyline));
    	return polyline.exports;
    }

    var polylineExports = requirePolyline();

    /**
     * Decodes Google's Encoded Polyline format to coordinate array.
     *
     * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
     *
     * Precision: Uses precision 5 (Google Maps default, ±1 meter accuracy).
     * Higher precision polylines (precision 6+) are also supported automatically.
     *
     * @param encoded - Encoded polyline string (e.g., "_p~iF~ps|U_ulLnnqC")
     * @returns Array of LatLng coordinates
     * @throws Error if encoded string is malformed or exceeds limits
     *
     * @example
     * const coords = PolylineDecoder.decode("_p~iF~ps|U_ulLnnqC");
     * // Returns: [{ lat: 38.5, lng: -120.2 }, { lat: 40.7, lng: -120.95 }, ...]
     */
    class PolylineDecoder {
        /**
         * Decodes an encoded polyline string to LatLng coordinate array.
         */
        static decode(encoded) {
            try {
                // polyline package returns array of [lat, lng] coordinate pairs
                const decoded = polylineExports.decode(encoded);
                // Convert to LatLng objects
                return decoded.map(([lat, lng]) => ({ lat, lng }));
            }
            catch (error) {
                throw new Error(`Failed to decode polyline: ${error.message}`);
            }
        }
    }

    /**
     * Error types thrown by the ExifGallery Plugin.
     *
     * All errors extend ExifGalleryError for easy type checking.
     * Each error has a unique code for programmatic handling.
     *
     * @example
     * ```typescript
     * import { ExifGallery, InitializationRequiredError, NoPermissionError } from 'capacitor-exif-gallery';
     *
     * try {
     *   const result = await ExifGallery.pick();
     * } catch (error) {
     *   if (error instanceof InitializationRequiredError) {
     *     // Plugin not initialized - call initialize() first
     *     await ExifGallery.initialize();
     *     // Retry pick()
     *     const result = await ExifGallery.pick();
     *   } else if (error instanceof NoPermissionError) {
     *     // User denied permissions - show explanation and retry
     *     alert('Photo access required to select images');
     *   } else if (error instanceof FilterError) {
     *     // Invalid filter parameters - fix and retry
     *     console.error('Invalid filter:', error.message);
     *   }
     * }
     * ```
     */
    /**
     * Base class for all ExifGallery Plugin errors.
     *
     * @example
     * ```typescript
     * try {
     *   await ExifGallery.pick();
     * } catch (error) {
     *   if (error instanceof ExifGalleryError) {
     *     console.error(`Plugin error [${error.code}]:`, error.message);
     *   }
     * }
     * ```
     */
    class ExifGalleryError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
            this.name = this.constructor.name;
            // Maintains proper stack trace for where error was thrown
            if (Error.captureStackTrace) {
                // V8 engines (Chrome, Node.js)
                Error.captureStackTrace(this, this.constructor);
            }
            else {
                // Safari, Firefox fallback
                this.stack = new Error().stack;
            }
        }
    }
    /**
     * Thrown when pick() is called before initialize().
     *
     * **Resolution:** Call initialize() before calling pick().
     *
     * @example
     * ```typescript
     * import { ExifGallery, InitializationRequiredError } from 'capacitor-exif-gallery';
     *
     * try {
     *   // ERROR: calling pick() without initialize()
     *   const result = await ExifGallery.pick();
     * } catch (error) {
     *   if (error instanceof InitializationRequiredError) {
     *     // Fix: Initialize plugin first
     *     await ExifGallery.initialize();
     *     // Retry pick()
     *     const result = await ExifGallery.pick();
     *   }
     * }
     * ```
     */
    class InitializationRequiredError extends ExifGalleryError {
        constructor(message = 'Plugin must be initialized before calling pick()') {
            super('initialization_required', message);
        }
    }
    /**
     * Thrown when pick() is called while another picker is already in progress.
     *
     * **Resolution:** Wait for the first pick() to complete before calling again.
     *
     * @example
     * ```typescript
     * import { ExifGallery, PickerInProgressError } from 'capacitor-exif-gallery';
     *
     * // Track picker state
     * let isPickerOpen = false;
     *
     * async function selectImages() {
     *   if (isPickerOpen) {
     *     console.log('Picker already open');
     *     return;
     *   }
     *
     *   try {
     *     isPickerOpen = true;
     *     const result = await ExifGallery.pick();
     *     // Handle result...
     *   } catch (error) {
     *     if (error instanceof PickerInProgressError) {
     *       console.log('Another picker is open, please wait');
     *     }
     *   } finally {
     *     isPickerOpen = false;
     *   }
     * }
     * ```
     */
    class PickerInProgressError extends ExifGalleryError {
        constructor(message = 'Cannot open picker while another picker is in progress') {
            super('picker_in_progress', message);
        }
    }
    /**
     * Thrown when user denies photo library or location permissions.
     *
     * **Resolution:**
     * - Check `permissionType` to show specific guidance
     * - Explain why permission is needed
     * - Guide user to Settings to enable permission
     * - Request permission again on next attempt
     *
     * @example
     * ```typescript
     * import { ExifGallery, NoPermissionError } from 'capacitor-exif-gallery';
     *
     * try {
     *   const result = await ExifGallery.pick({
     *     filter: {
     *       location: {
     *         coordinates: [{ lat: 48.8566, lng: 2.3522 }],
     *         radius: 500
     *       }
     *     }
     *   });
     * } catch (error) {
     *   if (error instanceof NoPermissionError) {
     *     // Show context-specific guidance
     *     if (error.permissionType === 'photo_library') {
     *       await showPermissionDialog(
     *         'Photo Access Required',
     *         'This app needs access to your photos to let you select images. ' +
     *         'Please enable photo access in Settings.'
     *       );
     *     } else if (error.permissionType === 'location') {
     *       await showPermissionDialog(
     *         'Location Access Required',
     *         'This app needs location access to filter photos by location. ' +
     *         'Please enable location access in Settings.'
     *       );
     *     }
     *   }
     * }
     * ```
     */
    class NoPermissionError extends ExifGalleryError {
        constructor(permissionType = 'photo_library', message) {
            const defaultMessage = permissionType === 'photo_library' ? 'Photo library permission denied' : 'Location permission denied';
            super('no_permission', message !== null && message !== void 0 ? message : defaultMessage);
            this.permissionType = permissionType;
        }
    }
    /**
     * Thrown when filter parameters are invalid.
     *
     * **Common causes:**
     * - Empty coordinates/polyline arrays
     * - Invalid LatLng coordinates (out of bounds)
     * - Negative or zero radius
     * - Invalid date range (end before start)
     * - Infinite or NaN numeric values
     * - Arrays exceeding size limits
     *
     * **Resolution:** Fix the filter parameters based on the error message.
     *
     * @example
     * ```typescript
     * import { ExifGallery, FilterError } from 'capacitor-exif-gallery';
     *
     * try {
     *   const result = await ExifGallery.pick({
     *     filter: {
     *       location: {
     *         coordinates: [], // ERROR: empty array
     *         radius: -100     // ERROR: negative radius
     *       }
     *     }
     *   });
     * } catch (error) {
     *   if (error instanceof FilterError) {
     *     // error.message contains specific validation error
     *     console.error('Invalid filter:', error.message);
     *
     *     // Fix and retry
     *     const result = await ExifGallery.pick({
     *       filter: {
     *         location: {
     *           coordinates: [{ lat: 48.8566, lng: 2.3522 }], // Fixed
     *           radius: 500 // Fixed
     *         }
     *       }
     *     });
     *   }
     * }
     *
     * // Validation errors include details:
     * // - "coordinates must contain at least one coordinate"
     * // - "radius must be greater than 0"
     * // - "polyline[2] is not a valid LatLng coordinate"
     * // - "timeRange.start must be before timeRange.end"
     * ```
     */
    class FilterError extends ExifGalleryError {
        constructor(message) {
            // Validate message parameter
            if (typeof message !== 'string') {
                throw new TypeError('FilterError requires a string message, got ' + typeof message);
            }
            // Remove 'filter_error: ' prefix if present for cleaner message
            const cleanMessage = message.replace(/^filter_error:\s*/, '').trim();
            // Ensure we have a meaningful message after cleanup
            if (!cleanMessage) {
                super('filter_error', 'Invalid filter parameters');
                // Warn about empty message in development
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('FilterError created with empty message. Original:', message);
                }
            }
            else {
                super('filter_error', cleanMessage);
            }
        }
    }
    /**
     * Thrown when native platform operation fails.
     *
     * **Common causes:**
     * - Native gallery UI failed to open
     * - Device storage access error
     * - Out of memory
     * - Platform-specific errors
     *
     * **Resolution:** Check error message for platform-specific details.
     *
     * @example
     * ```typescript
     * import { ExifGallery, NativeError } from 'capacitor-exif-gallery';
     *
     * try {
     *   const result = await ExifGallery.pick();
     * } catch (error) {
     *   if (error instanceof NativeError) {
     *     // Log platform-specific error for debugging
     *     console.error('Native error:', error.message);
     *
     *     // Show user-friendly message
     *     alert('Unable to open photo gallery. Please try again.');
     *   }
     * }
     * ```
     */
    class NativeError extends ExifGalleryError {
        constructor(message = 'Native platform operation failed') {
            super('native_error', message);
        }
    }

    /**
     * Validation utilities for filter parameters.
     *
     * Ensures filter configurations are valid before passing to native layers.
     *
     * @internal
     */
    class FilterValidator {
        /**
         * Validate that an object is a valid LatLng coordinate.
         *
         * Valid coordinates must have:
         * - lat: number between -90 and 90
         * - lng: number between -180 and 180
         *
         * @param obj - Object to validate
         * @returns True if valid LatLng
         *
         * @example
         * ```typescript
         * isValidLatLng({ lat: 48.8566, lng: 2.3522 }); // true
         * isValidLatLng({ lat: 200, lng: 0 }); // false (lat out of range)
         * isValidLatLng({ lat: 0 }); // false (missing lng)
         * ```
         */
        static isValidLatLng(obj) {
            return (obj !== null &&
                obj !== undefined &&
                typeof obj === 'object' &&
                typeof obj.lat === 'number' &&
                typeof obj.lng === 'number' &&
                !isNaN(obj.lat) &&
                !isNaN(obj.lng) &&
                obj.lat >= -90 &&
                obj.lat <= 90 &&
                obj.lng >= -180 &&
                obj.lng <= 180);
        }
        /**
         * Validate location filter configuration.
         *
         * Valid location filter must have:
         * - Either polyline OR coordinates array (not both)
         * - polyline/coordinates must be non-empty array of valid LatLng
         * - radius must be > 0 if provided
         *
         * ⚠️ **MUTATION WARNING:** If polyline is provided as an encoded string,
         * it will be decoded and replaced with a LatLng[] array in-place.
         * This is an optimization to prevent double-decoding. If you need to
         * preserve the original filter object, pass a deep copy.
         *
         * @mutates locationFilter.polyline - Replaces encoded string with decoded LatLng[]
         * @param locationFilter - Location filter to validate
         * @throws {Error} If validation fails
         *
         * @example
         * ```typescript
         * // Valid - coordinate array
         * validateLocationFilter({
         *   coordinates: [{ lat: 48.8566, lng: 2.3522 }],
         *   radius: 500
         * });
         *
         * // Valid - encoded polyline (will be decoded in-place)
         * const filter = { polyline: "_p~iF~ps|U_ulLnnqC", radius: 1000 };
         * validateLocationFilter(filter);
         * // Note: filter.polyline is now LatLng[] (not string)
         *
         * // Invalid: empty coordinates array
         * validateLocationFilter({ coordinates: [] }); // throws
         *
         * // Invalid: negative radius
         * validateLocationFilter({ coordinates: [...], radius: -1 }); // throws
         * ```
         */
        static validateLocationFilter(locationFilter) {
            const { polyline, coordinates, radius } = locationFilter;
            // Check for presence (excluding null/undefined but allowing empty string for better error message)
            const hasPolyline = polyline !== null && polyline !== undefined;
            const hasCoordinates = coordinates !== null && coordinates !== undefined;
            // At least one of polyline or coordinates must be present
            if (!hasPolyline && !hasCoordinates) {
                throw new FilterError('LocationFilter must have either polyline or coordinates');
            }
            // Cannot have both polyline and coordinates
            if (hasPolyline && hasCoordinates) {
                throw new FilterError('LocationFilter cannot have both polyline and coordinates');
            }
            // Validate polyline if present
            if (polyline !== undefined && polyline !== null) {
                let decodedPolyline;
                // Type guard: Check if polyline is string, array, or invalid type
                if (typeof polyline === 'string') {
                    // Encoded polyline string - decode it
                    // Check for empty or whitespace-only strings FIRST (before length check)
                    const trimmed = polyline.trim();
                    if (trimmed === '') {
                        throw new FilterError('encoded polyline string cannot be empty');
                    }
                    // Check max string length (DoS protection)
                    if (polyline.length > 51200) {
                        // 50 KB limit
                        throw new FilterError('encoded polyline string exceeds 50KB limit. ' + 'Use a simplified polyline or reduce precision.');
                    }
                    // Decode encoded polyline
                    try {
                        decodedPolyline = PolylineDecoder.decode(trimmed);
                    }
                    catch (error) {
                        throw new FilterError(`Invalid encoded polyline: ${error.message}. ` +
                            `Expected Google Encoded Polyline format (e.g., "_p~iF~ps|U_ulLnnqC"). ` +
                            `See: https://developers.google.com/maps/documentation/utilities/polylinealgorithm`);
                    }
                    // Replace string with decoded array for downstream processing
                    // This ensures native layers always receive coordinate arrays
                    locationFilter.polyline = decodedPolyline;
                }
                else if (Array.isArray(polyline)) {
                    // Already a coordinate array - use as-is
                    decodedPolyline = polyline;
                }
                else {
                    // Invalid type (not string or array)
                    throw new FilterError('polyline must be a string (encoded polyline) or array of LatLng coordinates. ' +
                        `Received: ${typeof polyline}`);
                }
                // Validate decoded polyline structure
                if (decodedPolyline.length === 0) {
                    throw new FilterError('decoded polyline is empty');
                }
                if (decodedPolyline.length < 2) {
                    throw new FilterError('polyline must contain at least 2 coordinates to define a path');
                }
                if (decodedPolyline.length > 1000) {
                    throw new FilterError(`polyline contains ${decodedPolyline.length} points, maximum is 1,000. ` +
                        `Use a simplified polyline or reduce precision.`);
                }
                // Validate each coordinate
                for (let i = 0; i < decodedPolyline.length; i++) {
                    if (!this.isValidLatLng(decodedPolyline[i])) {
                        throw new FilterError(`polyline[${i}] is not a valid LatLng coordinate`);
                    }
                }
            }
            // Validate coordinates if present
            if (coordinates) {
                if (!Array.isArray(coordinates)) {
                    throw new FilterError('coordinates must be an array');
                }
                if (coordinates.length === 0) {
                    throw new FilterError('coordinates must contain at least one coordinate');
                }
                // Prevent DoS via huge coordinates arrays (max 1000 points)
                if (coordinates.length > 1000) {
                    throw new FilterError('coordinates must not exceed 1,000 points');
                }
                for (let i = 0; i < coordinates.length; i++) {
                    if (!this.isValidLatLng(coordinates[i])) {
                        throw new FilterError(`coordinates[${i}] is not a valid LatLng coordinate`);
                    }
                }
            }
            // Validate radius if present
            if (radius !== undefined) {
                if (typeof radius !== 'number' || !isFinite(radius)) {
                    throw new FilterError('radius must be a finite number');
                }
                if (radius <= 0) {
                    throw new FilterError('radius must be greater than 0');
                }
                // Prevent unreasonably large radius (50km = 50,000 meters)
                if (radius > 50000) {
                    throw new FilterError('radius must not exceed 50,000 meters (50km)');
                }
            }
        }
        /**
         * Validate time range filter configuration.
         *
         * Valid time range must have:
         * - start and end as Date objects
         * - start must be before end
         *
         * @param timeRange - Time range filter to validate
         * @throws {Error} If validation fails
         *
         * @example
         * ```typescript
         * // Valid
         * validateTimeRangeFilter({
         *   start: new Date('2024-01-01'),
         *   end: new Date('2024-12-31')
         * });
         *
         * // Invalid: end before start
         * validateTimeRangeFilter({
         *   start: new Date('2024-12-31'),
         *   end: new Date('2024-01-01')
         * }); // throws
         * ```
         */
        static validateTimeRangeFilter(timeRange) {
            const { start, end } = timeRange;
            // Validate start
            if (!(start instanceof Date)) {
                throw new FilterError('timeRange.start must be a Date object');
            }
            if (isNaN(start.getTime())) {
                throw new FilterError('timeRange.start is an invalid Date');
            }
            // Validate end
            if (!(end instanceof Date)) {
                throw new FilterError('timeRange.end must be a Date object');
            }
            if (isNaN(end.getTime())) {
                throw new FilterError('timeRange.end is an invalid Date');
            }
            // Validate start < end
            if (start >= end) {
                throw new FilterError('timeRange.start must be before timeRange.end');
            }
        }
        /**
         * Validate complete filter configuration.
         *
         * Valid filter must have:
         * - At least one of: location or timeRange
         * - Valid location filter (if present)
         * - Valid time range filter (if present)
         *
         * @param filter - Filter configuration to validate
         * @throws {Error} If validation fails
         *
         * @example
         * ```typescript
         * // Valid: location only
         * validateFilterConfig({
         *   location: { coordinates: [{ lat: 0, lng: 0 }] }
         * });
         *
         * // Valid: time only
         * validateFilterConfig({
         *   timeRange: { start: new Date(), end: new Date() }
         * });
         *
         * // Valid: both
         * validateFilterConfig({
         *   location: { coordinates: [...] },
         *   timeRange: { start: ..., end: ... }
         * });
         *
         * // Invalid: neither
         * validateFilterConfig({}); // throws
         * ```
         */
        static validateFilterConfig(filter) {
            const { location, timeRange } = filter;
            // At least one filter type must be present
            if (!location && !timeRange) {
                throw new FilterError('Filter must have at least one of location or timeRange');
            }
            // Validate location filter if present
            if (location) {
                this.validateLocationFilter(location);
            }
            // Validate time range filter if present
            if (timeRange) {
                this.validateTimeRangeFilter(timeRange);
            }
        }
    }

    /**
     * Singleton class for managing plugin state.
     *
     * Ensures:
     * - Plugin is initialized before pick() is called
     * - Only one picker can be open at a time
     * - Translations are consistently available across all calls
     *
     * @example
     * ```typescript
     * const state = PluginState.getInstance();
     * state.setInitialized(true);
     * if (state.isInitialized()) {
     *   // Safe to call pick()
     * }
     * ```
     */
    class PluginState {
        /**
         * Private constructor to enforce singleton pattern.
         * Use getInstance() to access the singleton instance.
         */
        constructor() {
            this._initialized = false;
            this._mergedTranslations = null;
            this._pickerInProgress = false;
            this._requestPermissionsUpfront = false;
            this._photoLibraryPermissionRequested = false;
            // Private constructor prevents direct instantiation
        }
        /**
         * Get the singleton instance of PluginState.
         *
         * @returns The singleton PluginState instance
         *
         * @example
         * ```typescript
         * const state = PluginState.getInstance();
         * ```
         */
        static getInstance() {
            if (!PluginState.instance) {
                PluginState.instance = new PluginState();
            }
            return PluginState.instance;
        }
        /**
         * Check if plugin has been initialized.
         *
         * @returns True if initialize() has been called successfully
         */
        isInitialized() {
            return this._initialized;
        }
        /**
         * Set initialization status.
         *
         * @param value - True if plugin is initialized
         */
        setInitialized(value) {
            this._initialized = value;
        }
        /**
         * Get merged translations (defaults + custom overrides).
         *
         * @returns Merged translations or null if not initialized
         */
        getMergedTranslations() {
            return this._mergedTranslations;
        }
        /**
         * Set merged translations.
         * Creates a defensive copy to prevent external mutation.
         *
         * @param translations - Complete TranslationSet with all keys
         */
        setMergedTranslations(translations) {
            this._mergedTranslations = Object.assign({}, translations);
        }
        /**
         * Check if picker is currently in progress.
         *
         * @returns True if pick() is currently active
         */
        isPickerInProgress() {
            return this._pickerInProgress;
        }
        /**
         * Set picker progress status.
         *
         * @param value - True if picker is active
         */
        setPickerInProgress(value) {
            this._pickerInProgress = value;
        }
        /**
         * Atomically check and set picker progress flag.
         * Prevents race condition where two concurrent pick() calls could both pass the check.
         *
         * @returns True if picker was NOT in progress and has been set to in progress.
         *          False if picker is already in progress.
         *
         * @example
         * ```typescript
         * if (!state.trySetPickerInProgress()) {
         *   throw new Error('picker_in_progress');
         * }
         * try {
         *   // ... picker logic ...
         * } finally {
         *   state.setPickerInProgress(false);
         * }
         * ```
         */
        trySetPickerInProgress() {
            if (this._pickerInProgress) {
                return false;
            }
            this._pickerInProgress = true;
            return true;
        }
        /**
         * Check if requestPermissionsUpfront is enabled.
         *
         * @returns True if permissions should be requested upfront
         */
        getRequestPermissionsUpfront() {
            return this._requestPermissionsUpfront;
        }
        /**
         * Set requestPermissionsUpfront flag.
         *
         * @param value - True if permissions should be requested upfront
         */
        setRequestPermissionsUpfront(value) {
            this._requestPermissionsUpfront = value;
        }
        /**
         * Check if Photo Library permission has been requested.
         * Used to prevent duplicate permission requests.
         *
         * @returns True if permission was already requested
         */
        isPhotoLibraryPermissionRequested() {
            return this._photoLibraryPermissionRequested;
        }
        /**
         * Mark Photo Library permission as requested.
         * Prevents duplicate permission requests.
         */
        setPhotoLibraryPermissionRequested(value) {
            this._photoLibraryPermissionRequested = value;
        }
        /**
         * Reset all state to initial values.
         * Primarily used for testing.
         */
        reset() {
            this._initialized = false;
            this._mergedTranslations = null;
            this._pickerInProgress = false;
            this._requestPermissionsUpfront = false;
            this._photoLibraryPermissionRequested = false;
        }
    }

    const Device = core.registerPlugin('Device', {
        web: () => Promise.resolve().then(function () { return web$1; }).then((m) => new m.DeviceWeb()),
    });

    var galleryTitle$3 = "Bilder auswählen";
    var selectButton$3 = "Auswählen";
    var cancelButton$3 = "Abbrechen";
    var selectAllButton$3 = "Alle auswählen";
    var deselectAllButton$3 = "Alle abwählen";
    var selectionCounter$3 = "{count} von {total} ausgewählt";
    var confirmButton$3 = "Bestätigen";
    var filterDialogTitle$3 = "Filter-Optionen";
    var radiusLabel$3 = "Radius";
    var startDateLabel$3 = "Startdatum";
    var endDateLabel$3 = "Enddatum";
    var loadingMessage$3 = "Bilder werden geladen...";
    var emptyMessage$3 = "Keine Bilder gefunden";
    var errorMessage$3 = "Ein Fehler ist aufgetreten";
    var retryButton$3 = "Erneut versuchen";
    var initializationError$3 = "Plugin nicht initialisiert. Rufen Sie zuerst initialize() auf.";
    var permissionError$3 = "Berechtigung verweigert. Bitte gewähren Sie Zugriff auf Ihre Fotobibliothek.";
    var filterError$3 = "Ungültige Filter-Parameter. Bitte überprüfen Sie Ihre Konfiguration.";
    var deTranslations = {
    	galleryTitle: galleryTitle$3,
    	selectButton: selectButton$3,
    	cancelButton: cancelButton$3,
    	selectAllButton: selectAllButton$3,
    	deselectAllButton: deselectAllButton$3,
    	selectionCounter: selectionCounter$3,
    	confirmButton: confirmButton$3,
    	filterDialogTitle: filterDialogTitle$3,
    	radiusLabel: radiusLabel$3,
    	startDateLabel: startDateLabel$3,
    	endDateLabel: endDateLabel$3,
    	loadingMessage: loadingMessage$3,
    	emptyMessage: emptyMessage$3,
    	errorMessage: errorMessage$3,
    	retryButton: retryButton$3,
    	initializationError: initializationError$3,
    	permissionError: permissionError$3,
    	filterError: filterError$3
    };

    var galleryTitle$2 = "Select Images";
    var selectButton$2 = "Select";
    var cancelButton$2 = "Cancel";
    var selectAllButton$2 = "Select All";
    var deselectAllButton$2 = "Deselect All";
    var selectionCounter$2 = "{count} of {total} selected";
    var confirmButton$2 = "Confirm";
    var filterDialogTitle$2 = "Filter Options";
    var radiusLabel$2 = "Radius";
    var startDateLabel$2 = "Start Date";
    var endDateLabel$2 = "End Date";
    var loadingMessage$2 = "Loading images...";
    var emptyMessage$2 = "No images found";
    var errorMessage$2 = "An error occurred";
    var retryButton$2 = "Retry";
    var initializationError$2 = "Plugin not initialized. Call initialize() first.";
    var permissionError$2 = "Permission denied. Please grant access to your photo library.";
    var filterError$2 = "Invalid filter parameters. Please check your configuration.";
    var enTranslations = {
    	galleryTitle: galleryTitle$2,
    	selectButton: selectButton$2,
    	cancelButton: cancelButton$2,
    	selectAllButton: selectAllButton$2,
    	deselectAllButton: deselectAllButton$2,
    	selectionCounter: selectionCounter$2,
    	confirmButton: confirmButton$2,
    	filterDialogTitle: filterDialogTitle$2,
    	radiusLabel: radiusLabel$2,
    	startDateLabel: startDateLabel$2,
    	endDateLabel: endDateLabel$2,
    	loadingMessage: loadingMessage$2,
    	emptyMessage: emptyMessage$2,
    	errorMessage: errorMessage$2,
    	retryButton: retryButton$2,
    	initializationError: initializationError$2,
    	permissionError: permissionError$2,
    	filterError: filterError$2
    };

    var galleryTitle$1 = "Seleccionar imágenes";
    var selectButton$1 = "Seleccionar";
    var cancelButton$1 = "Cancelar";
    var selectAllButton$1 = "Seleccionar todo";
    var deselectAllButton$1 = "Deseleccionar todo";
    var selectionCounter$1 = "{count} de {total} seleccionados";
    var confirmButton$1 = "Confirmar";
    var filterDialogTitle$1 = "Opciones de filtro";
    var radiusLabel$1 = "Radio";
    var startDateLabel$1 = "Fecha de inicio";
    var endDateLabel$1 = "Fecha de fin";
    var loadingMessage$1 = "Cargando imágenes...";
    var emptyMessage$1 = "No se encontraron imágenes";
    var errorMessage$1 = "Ocurrió un error";
    var retryButton$1 = "Reintentar";
    var initializationError$1 = "Plugin no inicializado. Llame primero a initialize().";
    var permissionError$1 = "Permiso denegado. Por favor, conceda acceso a su biblioteca de fotos.";
    var filterError$1 = "Parámetros de filtro inválidos. Por favor, verifique su configuración.";
    var esTranslations = {
    	galleryTitle: galleryTitle$1,
    	selectButton: selectButton$1,
    	cancelButton: cancelButton$1,
    	selectAllButton: selectAllButton$1,
    	deselectAllButton: deselectAllButton$1,
    	selectionCounter: selectionCounter$1,
    	confirmButton: confirmButton$1,
    	filterDialogTitle: filterDialogTitle$1,
    	radiusLabel: radiusLabel$1,
    	startDateLabel: startDateLabel$1,
    	endDateLabel: endDateLabel$1,
    	loadingMessage: loadingMessage$1,
    	emptyMessage: emptyMessage$1,
    	errorMessage: errorMessage$1,
    	retryButton: retryButton$1,
    	initializationError: initializationError$1,
    	permissionError: permissionError$1,
    	filterError: filterError$1
    };

    var galleryTitle = "Sélectionner des images";
    var selectButton = "Sélectionner";
    var cancelButton = "Annuler";
    var selectAllButton = "Tout sélectionner";
    var deselectAllButton = "Tout désélectionner";
    var selectionCounter = "{count} sur {total} sélectionnés";
    var confirmButton = "Confirmer";
    var filterDialogTitle = "Options de filtre";
    var radiusLabel = "Rayon";
    var startDateLabel = "Date de début";
    var endDateLabel = "Date de fin";
    var loadingMessage = "Chargement des images...";
    var emptyMessage = "Aucune image trouvée";
    var errorMessage = "Une erreur s'est produite";
    var retryButton = "Réessayer";
    var initializationError = "Plugin non initialisé. Appelez d'abord initialize().";
    var permissionError = "Permission refusée. Veuillez autoriser l'accès à votre photothèque.";
    var filterError = "Paramètres de filtre invalides. Veuillez vérifier votre configuration.";
    var frTranslations = {
    	galleryTitle: galleryTitle,
    	selectButton: selectButton,
    	cancelButton: cancelButton,
    	selectAllButton: selectAllButton,
    	deselectAllButton: deselectAllButton,
    	selectionCounter: selectionCounter,
    	confirmButton: confirmButton,
    	filterDialogTitle: filterDialogTitle,
    	radiusLabel: radiusLabel,
    	startDateLabel: startDateLabel,
    	endDateLabel: endDateLabel,
    	loadingMessage: loadingMessage,
    	emptyMessage: emptyMessage,
    	errorMessage: errorMessage,
    	retryButton: retryButton,
    	initializationError: initializationError,
    	permissionError: permissionError,
    	filterError: filterError
    };

    /**
     * Translation loader utility for language detection and merging.
     *
     * Handles:
     * - System language detection via navigator.language
     * - Default translation loading
     * - Custom translation merging
     * - Validation of locale and custom keys
     *
     * @internal
     */
    class TranslationLoader {
        /**
         * Detect system language from navigator.language.
         *
         * Logic:
         * 1. Get navigator.language (e.g., 'de-DE', 'fr-FR', 'en-US')
         * 2. Extract language code (first 2 chars: 'de', 'fr', 'en')
         * 3. Check if supported ('en' | 'de' | 'fr' | 'es')
         * 4. Fallback to 'en' if not supported
         *
         * @returns Detected SupportedLocale, fallback to 'en'
         *
         * @example
         * ```typescript
         * // navigator.language = 'de-DE'
         * detectSystemLanguage(); // 'de'
         *
         * // navigator.language = 'ja-JP' (not supported)
         * detectSystemLanguage(); // 'en' (fallback)
         * ```
         */
        static async detectSystemLanguage() {
            try {
                const deviceInfo = await Device.getLanguageCode();
                const langCode = deviceInfo.value.split('-')[0].toLowerCase();
                const supportedLocales = ['en', 'de', 'fr', 'es'];
                if (supportedLocales.includes(langCode)) {
                    return langCode;
                }
            }
            catch (error) {
                console.warn('[TranslationLoader] Failed to detect device language, falling back to English:', error);
            }
            return 'en'; // Fallback to English
        }
        /**
         * Load default translations for a given locale.
         *
         * @param locale - The locale to load translations for
         * @returns TranslationSet with all 18 keys
         *
         * @example
         * ```typescript
         * const translations = TranslationLoader.loadDefaults('de');
         * console.log(translations.galleryTitle); // 'Bilder auswählen'
         * ```
         */
        static loadDefaults(locale) {
            return Object.assign({}, this.DEFAULT_TRANSLATIONS[locale]);
        }
        /**
         * Validate that a locale is supported.
         *
         * @param locale - The locale to validate
         * @throws {Error} If locale is not a SupportedLocale
         *
         * @example
         * ```typescript
         * TranslationLoader.validateLocale('en'); // OK
         * TranslationLoader.validateLocale('ja'); // Error: Invalid locale 'ja'
         * ```
         */
        static validateLocale(locale) {
            const supportedLocales = ['en', 'de', 'fr', 'es'];
            if (!supportedLocales.includes(locale)) {
                throw new Error(`Invalid locale '${locale}'. Supported locales: ${supportedLocales.join(', ')}`);
            }
        }
        /**
         * Validate that custom text keys match TranslationSet keys.
         *
         * @param customTexts - Partial custom overrides
         * @throws {Error} If any key in customTexts is not a valid TranslationSet key
         *
         * @example
         * ```typescript
         * TranslationLoader.validateCustomTexts({ galleryTitle: 'Custom' }); // OK
         * TranslationLoader.validateCustomTexts({ invalidKey: 'X' }); // Error
         * ```
         */
        static validateCustomTexts(customTexts) {
            const invalidKeys = Object.keys(customTexts).filter((key) => !this.REQUIRED_KEYS.includes(key));
            if (invalidKeys.length > 0) {
                throw new Error(`Invalid customTexts keys: ${invalidKeys.join(', ')}. ` + `Valid keys: ${this.REQUIRED_KEYS.join(', ')}`);
            }
        }
        /**
         * Merge custom overrides on top of default translations.
         *
         * Creates a defensive copy to prevent mutation.
         *
         * @param defaults - Default TranslationSet
         * @param customTexts - Partial custom overrides
         * @returns Merged TranslationSet with all 18 keys
         *
         * @example
         * ```typescript
         * const defaults = TranslationLoader.loadDefaults('en');
         * const merged = TranslationLoader.merge(defaults, {
         *   galleryTitle: 'My Custom Title',
         * });
         * console.log(merged.galleryTitle); // 'My Custom Title'
         * console.log(merged.selectButton); // 'Select' (from defaults)
         * ```
         */
        static merge(defaults, customTexts) {
            if (!customTexts) {
                return Object.assign({}, defaults);
            }
            return Object.assign(Object.assign({}, defaults), customTexts);
        }
        /**
         * Load and merge translations based on configuration.
         *
         * This is the main entry point for translation loading.
         *
         * Logic:
         * 1. If locale provided: validate and use it
         * 2. Else: detect system language (fallback to 'en')
         * 3. Load default translations for locale
         * 4. If customTexts provided: validate and merge
         * 5. Return merged TranslationSet
         *
         * @param locale - Optional explicit locale ('en' | 'de' | 'fr' | 'es')
         * @param customTexts - Optional custom text overrides
         * @returns Merged TranslationSet with all 18 keys
         * @throws {Error} If locale is invalid or customTexts has invalid keys
         *
         * @example
         * ```typescript
         * // System language detection
         * const t1 = TranslationLoader.loadTranslations();
         *
         * // Explicit locale
         * const t2 = TranslationLoader.loadTranslations('de');
         *
         * // Explicit locale + custom overrides
         * const t3 = TranslationLoader.loadTranslations('en', {
         *   galleryTitle: 'Pick Photos',
         * });
         *
         * // System language + custom overrides
         * const t4 = TranslationLoader.loadTranslations(undefined, {
         *   confirmButton: 'Done',
         * });
         * ```
         */
        static async loadTranslations(locale, customTexts) {
            // Determine locale to use
            let targetLocale;
            if (locale !== undefined) {
                this.validateLocale(locale);
                targetLocale = locale;
            }
            else {
                targetLocale = await this.detectSystemLanguage();
            }
            // Load default translations
            const defaults = this.loadDefaults(targetLocale);
            // Validate and merge custom overrides
            if (customTexts !== undefined) {
                this.validateCustomTexts(customTexts);
                return this.merge(defaults, customTexts);
            }
            return defaults;
        }
    }
    /**
     * All required keys in a valid TranslationSet.
     * Used for validation of custom overrides.
     */
    TranslationLoader.REQUIRED_KEYS = [
        'galleryTitle',
        'selectButton',
        'cancelButton',
        'selectAllButton',
        'deselectAllButton',
        'selectionCounter',
        'confirmButton',
        'filterDialogTitle',
        'radiusLabel',
        'startDateLabel',
        'endDateLabel',
        'loadingMessage',
        'emptyMessage',
        'errorMessage',
        'retryButton',
        'initializationError',
        'permissionError',
        'filterError',
    ];
    /**
     * Default translations by locale.
     */
    TranslationLoader.DEFAULT_TRANSLATIONS = {
        en: enTranslations,
        de: deTranslations,
        fr: frTranslations,
        es: esTranslations,
    };

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
    class ExifGalleryImpl {
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

    /**
     * Native plugin instance (registered via Capacitor Bridge).
     * Provides direct bridge communication with iOS/Android native code.
     *
     * @internal
     */
    const ExifGalleryNative = core.registerPlugin('ExifGalleryPlugin', {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.ExifGalleryPluginWeb()),
    });
    /**
     * ExifGallery Plugin Instance.
     *
     * This combines TypeScript-side logic (translation loading, validation)
     * with native platform calls via Capacitor Bridge.
     *
     * Use this singleton to interact with the plugin:
     *
     * @example
     * ```typescript
     * import { ExifGallery } from 'capacitor-exif-gallery';
     *
     * // Initialize plugin
     * await ExifGallery.initialize({ locale: 'de' });
     *
     * // Pick images with location filter
     * const result = await ExifGallery.pick({
     *   filter: {
     *     location: {
     *       coordinates: [{ lat: 48.8566, lng: 2.3522 }],
     *       radius: 500,
     *     },
     *   },
     * });
     * ```
     */
    const ExifGallery = new ExifGalleryImpl(ExifGalleryNative);

    class DeviceWeb extends core.WebPlugin {
        async getId() {
            return {
                identifier: this.getUid(),
            };
        }
        async getInfo() {
            if (typeof navigator === 'undefined' || !navigator.userAgent) {
                throw this.unavailable('Device API not available in this browser');
            }
            const ua = navigator.userAgent;
            const uaFields = this.parseUa(ua);
            return {
                model: uaFields.model,
                platform: 'web',
                operatingSystem: uaFields.operatingSystem,
                osVersion: uaFields.osVersion,
                manufacturer: navigator.vendor,
                isVirtual: false,
                webViewVersion: uaFields.browserVersion,
            };
        }
        async getBatteryInfo() {
            if (typeof navigator === 'undefined' || !navigator.getBattery) {
                throw this.unavailable('Device API not available in this browser');
            }
            let battery = {};
            try {
                battery = await navigator.getBattery();
            }
            catch (e) {
                // Let it fail, we don't care
            }
            return {
                batteryLevel: battery.level,
                isCharging: battery.charging,
            };
        }
        async getLanguageCode() {
            return {
                value: navigator.language.split('-')[0].toLowerCase(),
            };
        }
        async getLanguageTag() {
            return {
                value: navigator.language,
            };
        }
        parseUa(ua) {
            const uaFields = {};
            const start = ua.indexOf('(') + 1;
            let end = ua.indexOf(') AppleWebKit');
            if (ua.indexOf(') Gecko') !== -1) {
                end = ua.indexOf(') Gecko');
            }
            const fields = ua.substring(start, end);
            if (ua.indexOf('Android') !== -1) {
                const tmpFields = fields.replace('; wv', '').split('; ').pop();
                if (tmpFields) {
                    uaFields.model = tmpFields.split(' Build')[0];
                }
                uaFields.osVersion = fields.split('; ')[1];
            }
            else {
                uaFields.model = fields.split('; ')[0];
                if (typeof navigator !== 'undefined' && navigator.oscpu) {
                    uaFields.osVersion = navigator.oscpu;
                }
                else {
                    if (ua.indexOf('Windows') !== -1) {
                        uaFields.osVersion = fields;
                    }
                    else {
                        const tmpFields = fields.split('; ').pop();
                        if (tmpFields) {
                            const lastParts = tmpFields.replace(' like Mac OS X', '').split(' ');
                            uaFields.osVersion = lastParts[lastParts.length - 1].replace(/_/g, '.');
                        }
                    }
                }
            }
            if (/android/i.test(ua)) {
                uaFields.operatingSystem = 'android';
            }
            else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
                uaFields.operatingSystem = 'ios';
            }
            else if (/Win/.test(ua)) {
                uaFields.operatingSystem = 'windows';
            }
            else if (/Mac/i.test(ua)) {
                uaFields.operatingSystem = 'mac';
            }
            else {
                uaFields.operatingSystem = 'unknown';
            }
            // Check for browsers based on non-standard javascript apis, only not user agent
            const isSafari = !!window.ApplePaySession;
            const isChrome = !!window.chrome;
            const isFirefox = /Firefox/.test(ua);
            const isEdge = /Edg/.test(ua);
            const isFirefoxIOS = /FxiOS/.test(ua);
            const isChromeIOS = /CriOS/.test(ua);
            const isEdgeIOS = /EdgiOS/.test(ua);
            // FF and Edge User Agents both end with "/MAJOR.MINOR"
            if (isSafari || (isChrome && !isEdge) || isFirefoxIOS || isChromeIOS || isEdgeIOS) {
                // Safari version comes as     "... Version/MAJOR.MINOR ..."
                // Chrome version comes as     "... Chrome/MAJOR.MINOR ..."
                // FirefoxIOS version comes as "... FxiOS/MAJOR.MINOR ..."
                // ChromeIOS version comes as  "... CriOS/MAJOR.MINOR ..."
                let searchWord;
                if (isFirefoxIOS) {
                    searchWord = 'FxiOS';
                }
                else if (isChromeIOS) {
                    searchWord = 'CriOS';
                }
                else if (isEdgeIOS) {
                    searchWord = 'EdgiOS';
                }
                else if (isSafari) {
                    searchWord = 'Version';
                }
                else {
                    searchWord = 'Chrome';
                }
                const words = ua.split(' ');
                for (const word of words) {
                    if (word.includes(searchWord)) {
                        const version = word.split('/')[1];
                        uaFields.browserVersion = version;
                    }
                }
            }
            else if (isFirefox || isEdge) {
                const reverseUA = ua.split('').reverse().join('');
                const reverseVersion = reverseUA.split('/')[0];
                const version = reverseVersion.split('').reverse().join('');
                uaFields.browserVersion = version;
            }
            return uaFields;
        }
        getUid() {
            if (typeof window !== 'undefined' && window.localStorage) {
                let uid = window.localStorage.getItem('_capuid');
                if (uid) {
                    return uid;
                }
                uid = this.uuid4();
                window.localStorage.setItem('_capuid', uid);
                return uid;
            }
            return this.uuid4();
        }
        uuid4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }
    }

    var web$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DeviceWeb: DeviceWeb
    });

    class ExifGalleryPluginWeb extends core.WebPlugin {
        async initialize(config) {
            console.log('ExifGallery.initialize() called on web', config);
            // Web implementation not supported
            throw new Error('ExifGallery plugin is not supported on web platform');
        }
        async pick(options) {
            console.log('ExifGallery.pick() called on web', options);
            // Web implementation not supported
            throw new Error('ExifGallery plugin is not supported on web platform');
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ExifGalleryPluginWeb: ExifGalleryPluginWeb
    });

    exports.ExifGallery = ExifGallery;
    exports.ExifGalleryError = ExifGalleryError;
    exports.ExifGalleryNative = ExifGalleryNative;
    exports.FilterError = FilterError;
    exports.InitializationRequiredError = InitializationRequiredError;
    exports.NativeError = NativeError;
    exports.NoPermissionError = NoPermissionError;
    exports.PickerInProgressError = PickerInProgressError;
    exports.PluginState = PluginState;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
