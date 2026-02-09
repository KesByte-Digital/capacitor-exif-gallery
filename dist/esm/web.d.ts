import { WebPlugin } from '@capacitor/core';
import type { ImageGalleryPlugin, InitConfig, PickOptions, PickResult } from './definitions';
export declare class ImageGalleryPluginWeb extends WebPlugin implements ImageGalleryPlugin {
    initialize(config?: InitConfig): Promise<void>;
    pick(options?: PickOptions): Promise<PickResult>;
}
