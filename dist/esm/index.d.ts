import { ExifGalleryImpl } from './ExifGalleryImpl';
import type { ExifGalleryPlugin } from './definitions';
/**
 * Native plugin instance (registered via Capacitor Bridge).
 * Provides direct bridge communication with iOS/Android native code.
 *
 * @internal
 */
export declare const ExifGalleryNative: ExifGalleryPlugin;
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
export declare const ExifGallery: ExifGalleryImpl;
export * from './definitions';
export { PluginState } from './PluginState';
export * from './errors';
export type { ExifGalleryErrorCode, PermissionType } from './errors';
