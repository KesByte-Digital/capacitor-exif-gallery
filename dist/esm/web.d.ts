import { WebPlugin } from '@capacitor/core';
import type { ExifGalleryPlugin, InitConfig, PickOptions, PickResult } from './definitions';
export declare class ExifGalleryPluginWeb extends WebPlugin implements ExifGalleryPlugin {
    initialize(config?: InitConfig): Promise<void>;
    pick(options?: PickOptions): Promise<PickResult>;
}
