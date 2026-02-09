/**
 * Error types thrown by the Image Gallery Plugin.
 *
 * All errors extend ImageGalleryError for easy type checking.
 * Each error has a unique code for programmatic handling.
 *
 * @example
 * ```typescript
 * import { ImageGallery, InitializationRequiredError, NoPermissionError } from 'capacitor-image-gallery';
 *
 * try {
 *   const result = await ImageGallery.pick();
 * } catch (error) {
 *   if (error instanceof InitializationRequiredError) {
 *     // Plugin not initialized - call initialize() first
 *     await ImageGallery.initialize();
 *     // Retry pick()
 *     const result = await ImageGallery.pick();
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
 * Base class for all Image Gallery Plugin errors.
 *
 * @example
 * ```typescript
 * try {
 *   await ImageGallery.pick();
 * } catch (error) {
 *   if (error instanceof ImageGalleryError) {
 *     console.error(`Plugin error [${error.code}]:`, error.message);
 *   }
 * }
 * ```
 */
export class ImageGalleryError extends Error {
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
 * import { ImageGallery, InitializationRequiredError } from 'capacitor-image-gallery';
 *
 * try {
 *   // ERROR: calling pick() without initialize()
 *   const result = await ImageGallery.pick();
 * } catch (error) {
 *   if (error instanceof InitializationRequiredError) {
 *     // Fix: Initialize plugin first
 *     await ImageGallery.initialize();
 *     // Retry pick()
 *     const result = await ImageGallery.pick();
 *   }
 * }
 * ```
 */
export class InitializationRequiredError extends ImageGalleryError {
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
 * import { ImageGallery, PickerInProgressError } from 'capacitor-image-gallery';
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
 *     const result = await ImageGallery.pick();
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
export class PickerInProgressError extends ImageGalleryError {
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
 * import { ImageGallery, NoPermissionError } from 'capacitor-image-gallery';
 *
 * try {
 *   const result = await ImageGallery.pick({
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
export class NoPermissionError extends ImageGalleryError {
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
 * import { ImageGallery, FilterError } from 'capacitor-image-gallery';
 *
 * try {
 *   const result = await ImageGallery.pick({
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
 *     const result = await ImageGallery.pick({
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
export class FilterError extends ImageGalleryError {
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
 * import { ImageGallery, NativeError } from 'capacitor-image-gallery';
 *
 * try {
 *   const result = await ImageGallery.pick();
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
export class NativeError extends ImageGalleryError {
    constructor(message = 'Native platform operation failed') {
        super('native_error', message);
    }
}
//# sourceMappingURL=errors.js.map