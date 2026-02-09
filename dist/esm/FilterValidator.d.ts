import type { FilterConfig, LatLng, LocationFilter, TimeRangeFilter } from './definitions';
/**
 * Validation utilities for filter parameters.
 *
 * Ensures filter configurations are valid before passing to native layers.
 *
 * @internal
 */
export declare class FilterValidator {
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
    static isValidLatLng(obj: any): obj is LatLng;
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
    static validateLocationFilter(locationFilter: LocationFilter): void;
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
    static validateTimeRangeFilter(timeRange: TimeRangeFilter): void;
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
    static validateFilterConfig(filter: FilterConfig): void;
}
