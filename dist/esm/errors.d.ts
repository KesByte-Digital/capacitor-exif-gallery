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
 * Error codes for all ExifGallery Plugin errors.
 * Used for programmatic error handling with type safety.
 */
export type ExifGalleryErrorCode = 'initialization_required' | 'picker_in_progress' | 'no_permission' | 'filter_error' | 'native_error';
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
export declare class ExifGalleryError extends Error {
    /**
     * Error code for programmatic handling.
     * Typed as union for compile-time safety and autocomplete.
     */
    readonly code: ExifGalleryErrorCode;
    constructor(code: ExifGalleryErrorCode, message: string);
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
export declare class InitializationRequiredError extends ExifGalleryError {
    constructor(message?: string);
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
export declare class PickerInProgressError extends ExifGalleryError {
    constructor(message?: string);
}
/**
 * Permission types that can be denied.
 */
export type PermissionType = 'photo_library' | 'location';
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
export declare class NoPermissionError extends ExifGalleryError {
    /**
     * The type of permission that was denied.
     */
    readonly permissionType: PermissionType;
    constructor(permissionType?: PermissionType, message?: string);
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
export declare class FilterError extends ExifGalleryError {
    constructor(message: string);
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
export declare class NativeError extends ExifGalleryError {
    constructor(message?: string);
}
