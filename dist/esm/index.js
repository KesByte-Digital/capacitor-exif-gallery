import { registerPlugin } from '@capacitor/core';
import { ExifGalleryImpl } from './ExifGalleryImpl';
/**
 * Native plugin instance (registered via Capacitor Bridge).
 * Provides direct bridge communication with iOS/Android native code.
 *
 * @internal
 */
export const ExifGalleryNative = registerPlugin('ExifGalleryPlugin', {
    web: () => import('./web').then((m) => new m.ExifGalleryPluginWeb()),
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
 * import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';
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
export const ExifGallery = new ExifGalleryImpl(ExifGalleryNative);
export * from './definitions';
export { PluginState } from './PluginState';
export * from './errors';
//# sourceMappingURL=index.js.map