import { PolylineDecoder } from './PolylineDecoder';
import { FilterError } from './errors';
/**
 * Validation utilities for filter parameters.
 *
 * Ensures filter configurations are valid before passing to native layers.
 *
 * @internal
 */
export class FilterValidator {
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
//# sourceMappingURL=FilterValidator.js.map