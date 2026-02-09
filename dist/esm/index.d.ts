import { ImageGalleryImpl } from './ImageGalleryImpl';
import type { ImageGalleryPlugin } from './definitions';
/**
 * Native plugin instance (registered via Capacitor Bridge).
 * Provides direct bridge communication with iOS/Android native code.
 *
 * @internal
 */
export declare const ImageGalleryNative: ImageGalleryPlugin;
/**
 * ImageGallery Plugin Instance.
 *
 * This combines TypeScript-side logic (translation loading, validation)
 * with native platform calls via Capacitor Bridge.
 *
 * Use this singleton to interact with the plugin:
 *
 * @example
 * ```typescript
 * import { ImageGallery } from 'capacitor-image-gallery';
 *
 * // Initialize plugin
 * await ImageGallery.initialize({ locale: 'de' });
 *
 * // Pick images with location filter
 * const result = await ImageGallery.pick({
 *   filter: {
 *     location: {
 *       coordinates: [{ lat: 48.8566, lng: 2.3522 }],
 *       radius: 500,
 *     },
 *   },
 * });
 * ```
 */
export declare const ImageGallery: ImageGalleryImpl;
export * from './definitions';
export { PluginState } from './PluginState';
export * from './errors';
export type { ImageGalleryErrorCode, PermissionType } from './errors';
