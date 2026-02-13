import { WebPlugin } from '@capacitor/core';
export class ExifGalleryPluginWeb extends WebPlugin {
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
//# sourceMappingURL=web.js.map