import type { TranslationSet } from './definitions';
/**
 * Singleton class for managing plugin state.
 *
 * Ensures:
 * - Plugin is initialized before pick() is called
 * - Only one picker can be open at a time
 * - Translations are consistently available across all calls
 *
 * @example
 * ```typescript
 * const state = PluginState.getInstance();
 * state.setInitialized(true);
 * if (state.isInitialized()) {
 *   // Safe to call pick()
 * }
 * ```
 */
export declare class PluginState {
    private static instance;
    private _initialized;
    private _mergedTranslations;
    private _pickerInProgress;
    private _requestPermissionsUpfront;
    private _photoLibraryPermissionRequested;
    /**
     * Private constructor to enforce singleton pattern.
     * Use getInstance() to access the singleton instance.
     */
    private constructor();
    /**
     * Get the singleton instance of PluginState.
     *
     * @returns The singleton PluginState instance
     *
     * @example
     * ```typescript
     * const state = PluginState.getInstance();
     * ```
     */
    static getInstance(): PluginState;
    /**
     * Check if plugin has been initialized.
     *
     * @returns True if initialize() has been called successfully
     */
    isInitialized(): boolean;
    /**
     * Set initialization status.
     *
     * @param value - True if plugin is initialized
     */
    setInitialized(value: boolean): void;
    /**
     * Get merged translations (defaults + custom overrides).
     *
     * @returns Merged translations or null if not initialized
     */
    getMergedTranslations(): TranslationSet | null;
    /**
     * Set merged translations.
     * Creates a defensive copy to prevent external mutation.
     *
     * @param translations - Complete TranslationSet with all keys
     */
    setMergedTranslations(translations: TranslationSet): void;
    /**
     * Check if picker is currently in progress.
     *
     * @returns True if pick() is currently active
     */
    isPickerInProgress(): boolean;
    /**
     * Set picker progress status.
     *
     * @param value - True if picker is active
     */
    setPickerInProgress(value: boolean): void;
    /**
     * Atomically check and set picker progress flag.
     * Prevents race condition where two concurrent pick() calls could both pass the check.
     *
     * @returns True if picker was NOT in progress and has been set to in progress.
     *          False if picker is already in progress.
     *
     * @example
     * ```typescript
     * if (!state.trySetPickerInProgress()) {
     *   throw new Error('picker_in_progress');
     * }
     * try {
     *   // ... picker logic ...
     * } finally {
     *   state.setPickerInProgress(false);
     * }
     * ```
     */
    trySetPickerInProgress(): boolean;
    /**
     * Check if requestPermissionsUpfront is enabled.
     *
     * @returns True if permissions should be requested upfront
     */
    getRequestPermissionsUpfront(): boolean;
    /**
     * Set requestPermissionsUpfront flag.
     *
     * @param value - True if permissions should be requested upfront
     */
    setRequestPermissionsUpfront(value: boolean): void;
    /**
     * Check if Photo Library permission has been requested.
     * Used to prevent duplicate permission requests.
     *
     * @returns True if permission was already requested
     */
    isPhotoLibraryPermissionRequested(): boolean;
    /**
     * Mark Photo Library permission as requested.
     * Prevents duplicate permission requests.
     */
    setPhotoLibraryPermissionRequested(value: boolean): void;
    /**
     * Reset all state to initial values.
     * Primarily used for testing.
     */
    reset(): void;
}
