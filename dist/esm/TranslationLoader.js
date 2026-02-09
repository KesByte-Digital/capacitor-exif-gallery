// Import translation files
import deTranslations from './translations/de.json';
import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';
import frTranslations from './translations/fr.json';
/**
 * Translation loader utility for language detection and merging.
 *
 * Handles:
 * - System language detection via navigator.language
 * - Default translation loading
 * - Custom translation merging
 * - Validation of locale and custom keys
 *
 * @internal
 */
export class TranslationLoader {
    /**
     * Detect system language from navigator.language.
     *
     * Logic:
     * 1. Get navigator.language (e.g., 'de-DE', 'fr-FR', 'en-US')
     * 2. Extract language code (first 2 chars: 'de', 'fr', 'en')
     * 3. Check if supported ('en' | 'de' | 'fr' | 'es')
     * 4. Fallback to 'en' if not supported
     *
     * @returns Detected SupportedLocale, fallback to 'en'
     *
     * @example
     * ```typescript
     * // navigator.language = 'de-DE'
     * detectSystemLanguage(); // 'de'
     *
     * // navigator.language = 'ja-JP' (not supported)
     * detectSystemLanguage(); // 'en' (fallback)
     * ```
     */
    static detectSystemLanguage() {
        const browserLang = navigator.language || 'en';
        const langCode = browserLang.split('-')[0].toLowerCase();
        const supportedLocales = ['en', 'de', 'fr', 'es'];
        if (supportedLocales.includes(langCode)) {
            return langCode;
        }
        return 'en'; // Fallback to English
    }
    /**
     * Load default translations for a given locale.
     *
     * @param locale - The locale to load translations for
     * @returns TranslationSet with all 18 keys
     *
     * @example
     * ```typescript
     * const translations = TranslationLoader.loadDefaults('de');
     * console.log(translations.galleryTitle); // 'Bilder auswählen'
     * ```
     */
    static loadDefaults(locale) {
        return Object.assign({}, this.DEFAULT_TRANSLATIONS[locale]);
    }
    /**
     * Validate that a locale is supported.
     *
     * @param locale - The locale to validate
     * @throws {Error} If locale is not a SupportedLocale
     *
     * @example
     * ```typescript
     * TranslationLoader.validateLocale('en'); // OK
     * TranslationLoader.validateLocale('ja'); // Error: Invalid locale 'ja'
     * ```
     */
    static validateLocale(locale) {
        const supportedLocales = ['en', 'de', 'fr', 'es'];
        if (!supportedLocales.includes(locale)) {
            throw new Error(`Invalid locale '${locale}'. Supported locales: ${supportedLocales.join(', ')}`);
        }
    }
    /**
     * Validate that custom text keys match TranslationSet keys.
     *
     * @param customTexts - Partial custom overrides
     * @throws {Error} If any key in customTexts is not a valid TranslationSet key
     *
     * @example
     * ```typescript
     * TranslationLoader.validateCustomTexts({ galleryTitle: 'Custom' }); // OK
     * TranslationLoader.validateCustomTexts({ invalidKey: 'X' }); // Error
     * ```
     */
    static validateCustomTexts(customTexts) {
        const invalidKeys = Object.keys(customTexts).filter((key) => !this.REQUIRED_KEYS.includes(key));
        if (invalidKeys.length > 0) {
            throw new Error(`Invalid customTexts keys: ${invalidKeys.join(', ')}. ` + `Valid keys: ${this.REQUIRED_KEYS.join(', ')}`);
        }
    }
    /**
     * Merge custom overrides on top of default translations.
     *
     * Creates a defensive copy to prevent mutation.
     *
     * @param defaults - Default TranslationSet
     * @param customTexts - Partial custom overrides
     * @returns Merged TranslationSet with all 18 keys
     *
     * @example
     * ```typescript
     * const defaults = TranslationLoader.loadDefaults('en');
     * const merged = TranslationLoader.merge(defaults, {
     *   galleryTitle: 'My Custom Title',
     * });
     * console.log(merged.galleryTitle); // 'My Custom Title'
     * console.log(merged.selectButton); // 'Select' (from defaults)
     * ```
     */
    static merge(defaults, customTexts) {
        if (!customTexts) {
            return Object.assign({}, defaults);
        }
        return Object.assign(Object.assign({}, defaults), customTexts);
    }
    /**
     * Load and merge translations based on configuration.
     *
     * This is the main entry point for translation loading.
     *
     * Logic:
     * 1. If locale provided: validate and use it
     * 2. Else: detect system language (fallback to 'en')
     * 3. Load default translations for locale
     * 4. If customTexts provided: validate and merge
     * 5. Return merged TranslationSet
     *
     * @param locale - Optional explicit locale ('en' | 'de' | 'fr' | 'es')
     * @param customTexts - Optional custom text overrides
     * @returns Merged TranslationSet with all 18 keys
     * @throws {Error} If locale is invalid or customTexts has invalid keys
     *
     * @example
     * ```typescript
     * // System language detection
     * const t1 = TranslationLoader.loadTranslations();
     *
     * // Explicit locale
     * const t2 = TranslationLoader.loadTranslations('de');
     *
     * // Explicit locale + custom overrides
     * const t3 = TranslationLoader.loadTranslations('en', {
     *   galleryTitle: 'Pick Photos',
     * });
     *
     * // System language + custom overrides
     * const t4 = TranslationLoader.loadTranslations(undefined, {
     *   confirmButton: 'Done',
     * });
     * ```
     */
    static loadTranslations(locale, customTexts) {
        // Determine locale to use
        let targetLocale;
        if (locale !== undefined) {
            this.validateLocale(locale);
            targetLocale = locale;
        }
        else {
            targetLocale = this.detectSystemLanguage();
        }
        // Load default translations
        const defaults = this.loadDefaults(targetLocale);
        // Validate and merge custom overrides
        if (customTexts !== undefined) {
            this.validateCustomTexts(customTexts);
            return this.merge(defaults, customTexts);
        }
        return defaults;
    }
}
/**
 * All required keys in a valid TranslationSet.
 * Used for validation of custom overrides.
 */
TranslationLoader.REQUIRED_KEYS = [
    'galleryTitle',
    'selectButton',
    'cancelButton',
    'selectAllButton',
    'deselectAllButton',
    'selectionCounter',
    'confirmButton',
    'filterDialogTitle',
    'radiusLabel',
    'startDateLabel',
    'endDateLabel',
    'loadingMessage',
    'emptyMessage',
    'errorMessage',
    'retryButton',
    'initializationError',
    'permissionError',
    'filterError',
];
/**
 * Default translations by locale.
 */
TranslationLoader.DEFAULT_TRANSLATIONS = {
    en: enTranslations,
    de: deTranslations,
    fr: frTranslations,
    es: esTranslations,
};
//# sourceMappingURL=TranslationLoader.js.map