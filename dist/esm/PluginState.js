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
export class PluginState {
    /**
     * Private constructor to enforce singleton pattern.
     * Use getInstance() to access the singleton instance.
     */
    constructor() {
        this._initialized = false;
        this._mergedTranslations = null;
        this._pickerInProgress = false;
        this._requestPermissionsUpfront = false;
        this._photoLibraryPermissionRequested = false;
        // Private constructor prevents direct instantiation
    }
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
    static getInstance() {
        if (!PluginState.instance) {
            PluginState.instance = new PluginState();
        }
        return PluginState.instance;
    }
    /**
     * Check if plugin has been initialized.
     *
     * @returns True if initialize() has been called successfully
     */
    isInitialized() {
        return this._initialized;
    }
    /**
     * Set initialization status.
     *
     * @param value - True if plugin is initialized
     */
    setInitialized(value) {
        this._initialized = value;
    }
    /**
     * Get merged translations (defaults + custom overrides).
     *
     * @returns Merged translations or null if not initialized
     */
    getMergedTranslations() {
        return this._mergedTranslations;
    }
    /**
     * Set merged translations.
     * Creates a defensive copy to prevent external mutation.
     *
     * @param translations - Complete TranslationSet with all keys
     */
    setMergedTranslations(translations) {
        this._mergedTranslations = Object.assign({}, translations);
    }
    /**
     * Check if picker is currently in progress.
     *
     * @returns True if pick() is currently active
     */
    isPickerInProgress() {
        return this._pickerInProgress;
    }
    /**
     * Set picker progress status.
     *
     * @param value - True if picker is active
     */
    setPickerInProgress(value) {
        this._pickerInProgress = value;
    }
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
    trySetPickerInProgress() {
        if (this._pickerInProgress) {
            return false;
        }
        this._pickerInProgress = true;
        return true;
    }
    /**
     * Check if requestPermissionsUpfront is enabled.
     *
     * @returns True if permissions should be requested upfront
     */
    getRequestPermissionsUpfront() {
        return this._requestPermissionsUpfront;
    }
    /**
     * Set requestPermissionsUpfront flag.
     *
     * @param value - True if permissions should be requested upfront
     */
    setRequestPermissionsUpfront(value) {
        this._requestPermissionsUpfront = value;
    }
    /**
     * Check if Photo Library permission has been requested.
     * Used to prevent duplicate permission requests.
     *
     * @returns True if permission was already requested
     */
    isPhotoLibraryPermissionRequested() {
        return this._photoLibraryPermissionRequested;
    }
    /**
     * Mark Photo Library permission as requested.
     * Prevents duplicate permission requests.
     */
    setPhotoLibraryPermissionRequested(value) {
        this._photoLibraryPermissionRequested = value;
    }
    /**
     * Reset all state to initial values.
     * Primarily used for testing.
     */
    reset() {
        this._initialized = false;
        this._mergedTranslations = null;
        this._pickerInProgress = false;
        this._requestPermissionsUpfront = false;
        this._photoLibraryPermissionRequested = false;
    }
}
//# sourceMappingURL=PluginState.js.map