import { WebPlugin } from '@capacitor/core';
export class ImageGalleryPluginWeb extends WebPlugin {
    async initialize(config) {
        console.log('ImageGallery.initialize() called on web', config);
        // Web implementation not supported
        throw new Error('ImageGallery plugin is not supported on web platform');
    }
    async pick(options) {
        console.log('ImageGallery.pick() called on web', options);
        // Web implementation not supported
        throw new Error('ImageGallery plugin is not supported on web platform');
    }
}
//# sourceMappingURL=web.js.map