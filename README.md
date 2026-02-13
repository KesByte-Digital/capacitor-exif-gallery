# capacitor-exif-gallery

Capacitor plugin for filtering and selecting images by location and time using EXIF data

[![CI/CD Pipeline](https://github.com/KesByte-Digital/capacitor-image-gallery/workflows/PR%20Tests/badge.svg)](https://github.com/KesByte-Digital/capacitor-image-gallery/actions)

## ⚠️ Work In Progress

This plugin is currently under active development. The API documentation below is a template and will be replaced with actual plugin methods in upcoming releases.

For the planned API and features, see the [Product Requirements Document](../../_bmad-output/planning-artifacts/prd.md).

**Current Status:**
- ✅ **Epic 1-3:** License System Foundation - COMPLETE
- 🔄 **Epic 9:** Example App Modernization - IN PROGRESS (Phase 4 Complete)
- ⏳ **Gallery Features:** Planned for future releases

## CI/CD Pipeline

This project uses GitHub Actions for automated testing on every Pull Request:
- ✅ TypeScript tests (ESLint, Prettier, type checking, Jest)
- ✅ Android tests (JUnit, Lint, Gradle build)
- ✅ iOS tests (XCTest, Swift build, code coverage)
- ✅ SwiftLint code style checks

For details, see [CI/CD Documentation](.github/workflows/README.md).

## Security

This plugin implements build hardening and license validation to protect against reverse engineering. For details about security measures and limitations, see [SECURITY.md](SECURITY.md).

## Development Setup - Test Licenses

This plugin uses license validation to protect against unauthorized use. For development and testing, test licenses are available.

### Generating Test Licenses

Test licenses are used for development and CI/CD without hitting production servers.

**First time setup:**

```bash
# 1. Generate private key (one-time)
openssl rand -hex 32 > .secrets/license-test-private-key.hex

# 2. Generate test licenses
node scripts/generate-test-licenses.js

# 3. Verify .env.local was created
cat .env.local
```

**Verifying test licenses:**

```bash
# Validate generated licenses
node scripts/verify-test-licenses.js
```

### Using Test Licenses in Local Builds

**iOS:**
- Copy `LICENSE_TEST_IOS` from `.env.local` to `ios/App/App/Info.plist`
- Add as string value under key `LicenseKey`

**Android:**
- Copy `LICENSE_TEST_ANDROID` from `.env.local` to `android/app/src/main/AndroidManifest.xml`
- Add as meta-data under application tag:
  ```xml
  <meta-data android:name="license_key" android:value="LICENSE_TEST_ANDROID_VALUE_HERE" />
  ```

### Using Test Licenses in CI/CD

GitHub Actions workflows automatically inject test licenses during builds.

**Setup GitHub Secrets:**

1. Go to repository Settings → Secrets and variables → Actions
2. Add two repository secrets:
   - Name: `LICENSE_TEST_IOS`
   - Value: Copy from `.env.local` (entire Base64 string)

   - Name: `LICENSE_TEST_ANDROID`
   - Value: Copy from `.env.local` (entire Base64 string)

**Workflows:**
- `ios-license-validation.yml` - Injects iOS license and runs validation tests
- `android-license-validation.yml` - Injects Android license and runs validation tests

**How it works:**
1. Workflow triggers on push to main or epic branches
2. License is injected from GitHub Secret
3. Build completes with license embedded
4. License validation tests run automatically
5. Workflow fails if license validation fails

For detailed setup instructions, see [CI/CD License Setup Guide](docs/CI-CD-SETUP.md)

### Rotating Test Licenses (Quarterly)

```bash
# Generate new private key
openssl rand -hex 32 > .secrets/license-test-private-key.hex

# Generate new test licenses
node scripts/generate-test-licenses.js

# Update CI/CD secrets in GitHub repository settings
```

### Security Notes

**Test vs. Production Licenses:**
- **Test Licenses:** Bundle ID is `com.codewave.gallery.test`, never expires, development only
- **Production Licenses:** Generated per-customer, custom expiry, sold to customers

**Important:** Never use test licenses in production builds. They won't validate for real customers.

**Private Key Security:**
- Test private key is stored in `.secrets/` (NOT committed to git)
- `.env.local` contains generated licenses (NOT committed to git)
- Both are excluded via `.gitignore`

## Testing

### QA Testing Materials

Comprehensive testing materials are available for thorough QA:
- **[QA Testing Checklist](QA-TESTING-CHECKLIST.md)** - 150+ test cases covering all features
- **[QA Report Template](QA-REPORT-TEMPLATE.md)** - Document test results
- **[Testing Guide](example-app/TESTING.md)** - Manual and automated testing instructions

### Automated Tests

Run the automated test suite in browser console:
```javascript
// Open app in browser (npx cap serve or on device via DevTools)
window.runTestSuite()

// Run specific test category
window.runTestSuite({ only: 'core' })
```

### Device Compatibility

**iOS:**
- Minimum: iOS 14.0
- Tested: iOS 14.x, 15.x, 16.x, 17.x
- Devices: iPhone SE, iPhone 14, iPhone 15 Pro Max, iPad

**Android:**
- Minimum: Android 10 (API 29)
- Tested: Android 10, 11, 12, 13, 14
- Devices: Pixel 4/5/6/7, Samsung Galaxy S21, Galaxy Tab S8

See [Testing Guide](example-app/TESTING.md) for complete testing instructions.

---

## Sample Images for Testing

Sample images are NOT committed to the repository to keep repository size small. Generate them locally for testing filtering functionality.

### Quick Start

Generate sample images (required for first-time setup):

```bash
npm run generate:samples
```

Verify EXIF data:

```bash
npm run verify:samples
```

### Features

- **10 Images:** 5 landscape + 5 portrait
- **EXIF Metadata:** GPS coordinates, timestamps, camera info
- **Locations:** Major German cities (Berlin, München, Hamburg, etc.)
- **Dates:** Distributed across 10 months (Jan-Oct 2025)
- **File Size:** ~53 KB average per image

### Documentation

For detailed information about the sample images, see [Sample Images Documentation](docs/SAMPLE_IMAGES.md).

## Usage Examples

### Location Filters

The plugin supports two formats for location-based filtering: coordinate arrays and encoded polylines.

#### Using Encoded Polylines (Google Maps Format)

The plugin supports Google's Encoded Polyline format as a compact alternative to coordinate arrays. This is ideal when integrating with mapping services like Google Maps, Mapbox, or OpenStreetMap.

**Benefits:**
- ~92% smaller payload (5KB → 400 bytes for 100 points)
- URL-safe format
- Direct compatibility with Google Maps APIs

**Example with Encoded Polyline:**
```typescript
import { ExifGallery } from 'capacitor-exif-gallery';

// Get encoded polyline from Google Directions API
const directionsResult = await fetch(
  'https://maps.googleapis.com/maps/api/directions/json?' +
  'origin=Bassum&destination=Bremen&key=YOUR_API_KEY'
);
const route = directionsResult.routes[0].overview_polyline.points;

// Use encoded polyline directly
const result = await ExifGallery.pick({
  filter: {
    location: {
      polyline: route,  // Encoded string (e.g., "_p~iF~ps|U_ulLnnqC")
      radius: 2000      // 2km corridor around route
    }
  }
});
```

**Example with Coordinate Array (still supported):**
```typescript
const result = await ExifGallery.pick({
  filter: {
    location: {
      polyline: [
        { lat: 52.8506, lng: 8.7287 },   // Bassum
        { lat: 53.0793, lng: 8.8017 }    // Bremen
      ],
      radius: 2000  // 2km corridor
    }
  }
});
```

**Polyline Format:**
- Uses Google's Polyline Encoding Algorithm (precision 5)
- Provides ±1 meter accuracy (Google Maps default)
- Higher precision polylines (6+) are also supported
- Learn more: [Google Polyline Algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)

**Limitations:**
- Max encoded string length: 50 KB
- Max decoded points: 1,000
- Minimum points: 2 (to define a path)

## Install

```bash
npm install capacitor-exif-gallery
npx cap sync
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`pick(...)`](#pick)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Main plugin interface.

### initialize(...)

```typescript
initialize(config?: InitConfig | undefined) => Promise<void>
```

Initialize the plugin with optional configuration.

Must be called before pick(). Can be called multiple times to update configuration.

**Default behavior (no config):**
- Detects system language automatically
- Uses built-in English/German/French/Spanish translations
- Requests permissions just-in-time (when pick() is called)

| Param        | Type                                              | Description                     |
| ------------ | ------------------------------------------------- | ------------------------------- |
| **`config`** | <code><a href="#initconfig">InitConfig</a></code> | - Optional configuration object |

--------------------


### pick(...)

```typescript
pick(options?: PickOptions | undefined) => Promise<PickResult>
```

Open native gallery with optional filters and return selected images.

Must call initialize() first, otherwise throws initialization_required error.

**Filter behavior:**
- If filter provided: Gallery opens with pre-configured filters
- If no filter: User can manually set filters in gallery UI
- Auto-fallback: If location filter returns &lt; fallbackThreshold images, falls back to time filter

| Param         | Type                                                | Description                          |
| ------------- | --------------------------------------------------- | ------------------------------------ |
| **`options`** | <code><a href="#pickoptions">PickOptions</a></code> | - Optional pick options with filters |

**Returns:** <code>Promise&lt;<a href="#pickresult">PickResult</a>&gt;</code>

--------------------


### Interfaces


#### InitConfig

Plugin initialization configuration.
All properties are optional.

| Prop                            | Type                                                                                            | Description                                                                                                                                                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`locale`**                    | <code><a href="#supportedlocale">SupportedLocale</a></code>                                     | Optional locale to use for UI text. If not provided, system language is detected automatically. Falls back to English if system language is not supported.                                                                                  |
| **`customTexts`**               | <code><a href="#partial">Partial</a>&lt;<a href="#translationset">TranslationSet</a>&gt;</code> | Optional custom text overrides. Merges on top of default translations for the selected locale. Partial object - only override the keys you need.                                                                                            |
| **`requestPermissionsUpfront`** | <code>boolean</code>                                                                            | Whether to request photo library permissions immediately during initialization. Default: false (permissions requested just-in-time when pick() is called) Set to true if you want to request permissions upfront (e.g., during onboarding). |


#### TranslationSet

Complete set of UI text keys used by the plugin.
All keys are required for a complete translation.

| Prop                      | Type                | Description                                            |
| ------------------------- | ------------------- | ------------------------------------------------------ |
| **`galleryTitle`**        | <code>string</code> | Gallery screen title                                   |
| **`selectButton`**        | <code>string</code> | "Select" button text                                   |
| **`cancelButton`**        | <code>string</code> | "Cancel" button text                                   |
| **`selectAllButton`**     | <code>string</code> | "Select All" button text                               |
| **`deselectAllButton`**   | <code>string</code> | "Deselect All" button text                             |
| **`selectionCounter`**    | <code>string</code> | Selection counter text. Placeholders: {count}, {total} |
| **`confirmButton`**       | <code>string</code> | "Confirm" button text                                  |
| **`filterDialogTitle`**   | <code>string</code> | Filter dialog title                                    |
| **`radiusLabel`**         | <code>string</code> | "Radius (meters)" label                                |
| **`startDateLabel`**      | <code>string</code> | "Start <a href="#date">Date</a>" label                 |
| **`endDateLabel`**        | <code>string</code> | "End <a href="#date">Date</a>" label                   |
| **`loadingMessage`**      | <code>string</code> | "Loading images..." message                            |
| **`emptyMessage`**        | <code>string</code> | "No images found" message                              |
| **`errorMessage`**        | <code>string</code> | "An error occurred" message                            |
| **`retryButton`**         | <code>string</code> | "Retry" button text                                    |
| **`initializationError`** | <code>string</code> | "Plugin not initialized" error                         |
| **`permissionError`**     | <code>string</code> | "Permission denied" error                              |
| **`filterError`**         | <code>string</code> | "Invalid filter parameters" error                      |


#### PickResult

Result from pick() method.

| Prop            | Type                       | Description                                                                                                      |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`images`**    | <code>ImageResult[]</code> | Array of selected images. Empty if user cancelled or no images matched filters.                                  |
| **`cancelled`** | <code>boolean</code>       | True if user explicitly cancelled the selection. False if user confirmed selection (even if no images selected). |


#### ImageResult

Single image result from pick().

| Prop             | Type                                            | Description                                                                                                                         |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`uri`**        | <code>string</code>                             | File URI for the image (file:// path). Can be used to display or upload the image.                                                  |
| **`exif`**       | <code><a href="#imageexif">ImageExif</a></code> | EXIF metadata if available. May be undefined if image has no EXIF data.                                                             |
| **`filteredBy`** | <code>'time' \| 'location'</code>               | How this image was filtered. - 'location': Matched location filter - 'time': Matched time filter (or fallback from location filter) |


#### ImageExif

EXIF metadata extracted from an image.

| Prop            | Type                                  | Description                                         |
| --------------- | ------------------------------------- | --------------------------------------------------- |
| **`lat`**       | <code>number</code>                   | Latitude from GPS EXIF data (if available)          |
| **`lng`**       | <code>number</code>                   | Longitude from GPS EXIF data (if available)         |
| **`timestamp`** | <code><a href="#date">Date</a></code> | Timestamp from EXIF DateTimeOriginal (if available) |


#### Date

Enables basic storage and retrieval of dates and times.

| Method                 | Signature                                                                                                    | Description                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **toString**           | () =&gt; string                                                                                              | Returns a string representation of a date. The format of the string depends on the locale.                                              |
| **toDateString**       | () =&gt; string                                                                                              | Returns a date as a string value.                                                                                                       |
| **toTimeString**       | () =&gt; string                                                                                              | Returns a time as a string value.                                                                                                       |
| **toLocaleString**     | () =&gt; string                                                                                              | Returns a value as a string value appropriate to the host environment's current locale.                                                 |
| **toLocaleDateString** | () =&gt; string                                                                                              | Returns a date as a string value appropriate to the host environment's current locale.                                                  |
| **toLocaleTimeString** | () =&gt; string                                                                                              | Returns a time as a string value appropriate to the host environment's current locale.                                                  |
| **valueOf**            | () =&gt; number                                                                                              | Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC.                                                      |
| **getTime**            | () =&gt; number                                                                                              | Gets the time value in milliseconds.                                                                                                    |
| **getFullYear**        | () =&gt; number                                                                                              | Gets the year, using local time.                                                                                                        |
| **getUTCFullYear**     | () =&gt; number                                                                                              | Gets the year using Universal Coordinated Time (UTC).                                                                                   |
| **getMonth**           | () =&gt; number                                                                                              | Gets the month, using local time.                                                                                                       |
| **getUTCMonth**        | () =&gt; number                                                                                              | Gets the month of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                             |
| **getDate**            | () =&gt; number                                                                                              | Gets the day-of-the-month, using local time.                                                                                            |
| **getUTCDate**         | () =&gt; number                                                                                              | Gets the day-of-the-month, using Universal Coordinated Time (UTC).                                                                      |
| **getDay**             | () =&gt; number                                                                                              | Gets the day of the week, using local time.                                                                                             |
| **getUTCDay**          | () =&gt; number                                                                                              | Gets the day of the week using Universal Coordinated Time (UTC).                                                                        |
| **getHours**           | () =&gt; number                                                                                              | Gets the hours in a date, using local time.                                                                                             |
| **getUTCHours**        | () =&gt; number                                                                                              | Gets the hours value in a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                       |
| **getMinutes**         | () =&gt; number                                                                                              | Gets the minutes of a <a href="#date">Date</a> object, using local time.                                                                |
| **getUTCMinutes**      | () =&gt; number                                                                                              | Gets the minutes of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                           |
| **getSeconds**         | () =&gt; number                                                                                              | Gets the seconds of a <a href="#date">Date</a> object, using local time.                                                                |
| **getUTCSeconds**      | () =&gt; number                                                                                              | Gets the seconds of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                           |
| **getMilliseconds**    | () =&gt; number                                                                                              | Gets the milliseconds of a <a href="#date">Date</a>, using local time.                                                                  |
| **getUTCMilliseconds** | () =&gt; number                                                                                              | Gets the milliseconds of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                      |
| **getTimezoneOffset**  | () =&gt; number                                                                                              | Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC).                             |
| **setTime**            | (time: number) =&gt; number                                                                                  | Sets the date and time value in the <a href="#date">Date</a> object.                                                                    |
| **setMilliseconds**    | (ms: number) =&gt; number                                                                                    | Sets the milliseconds value in the <a href="#date">Date</a> object using local time.                                                    |
| **setUTCMilliseconds** | (ms: number) =&gt; number                                                                                    | Sets the milliseconds value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                              |
| **setSeconds**         | (sec: number, ms?: number \| undefined) =&gt; number                                                         | Sets the seconds value in the <a href="#date">Date</a> object using local time.                                                         |
| **setUTCSeconds**      | (sec: number, ms?: number \| undefined) =&gt; number                                                         | Sets the seconds value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                   |
| **setMinutes**         | (min: number, sec?: number \| undefined, ms?: number \| undefined) =&gt; number                              | Sets the minutes value in the <a href="#date">Date</a> object using local time.                                                         |
| **setUTCMinutes**      | (min: number, sec?: number \| undefined, ms?: number \| undefined) =&gt; number                              | Sets the minutes value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                   |
| **setHours**           | (hours: number, min?: number \| undefined, sec?: number \| undefined, ms?: number \| undefined) =&gt; number | Sets the hour value in the <a href="#date">Date</a> object using local time.                                                            |
| **setUTCHours**        | (hours: number, min?: number \| undefined, sec?: number \| undefined, ms?: number \| undefined) =&gt; number | Sets the hours value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                     |
| **setDate**            | (date: number) =&gt; number                                                                                  | Sets the numeric day-of-the-month value of the <a href="#date">Date</a> object using local time.                                        |
| **setUTCDate**         | (date: number) =&gt; number                                                                                  | Sets the numeric day of the month in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                        |
| **setMonth**           | (month: number, date?: number \| undefined) =&gt; number                                                     | Sets the month value in the <a href="#date">Date</a> object using local time.                                                           |
| **setUTCMonth**        | (month: number, date?: number \| undefined) =&gt; number                                                     | Sets the month value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                     |
| **setFullYear**        | (year: number, month?: number \| undefined, date?: number \| undefined) =&gt; number                         | Sets the year of the <a href="#date">Date</a> object using local time.                                                                  |
| **setUTCFullYear**     | (year: number, month?: number \| undefined, date?: number \| undefined) =&gt; number                         | Sets the year value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                      |
| **toUTCString**        | () =&gt; string                                                                                              | Returns a date converted to a string using Universal Coordinated Time (UTC).                                                            |
| **toISOString**        | () =&gt; string                                                                                              | Returns a date as a string value in ISO format.                                                                                         |
| **toJSON**             | (key?: any) =&gt; string                                                                                     | Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. |


#### PickOptions

Options for the pick() method.

| Prop                        | Type                                                  | Description                                                                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`filter`**                | <code><a href="#filterconfig">FilterConfig</a></code> | Optional filter configuration to pre-configure the gallery. If not provided, user can manually set filters in the gallery UI.                                                                                     |
| **`fallbackThreshold`**     | <code>number</code>                                   | Minimum number of results required before automatic fallback to time filter. If location filter returns fewer images than this threshold, the plugin automatically falls back to time-based filtering. Default: 5 |
| **`allowManualAdjustment`** | <code>boolean</code>                                  | Whether to allow user to manually adjust filters in the gallery UI. Default: true Set to false if you want to enforce the provided filter configuration.                                                          |


#### FilterConfig

Combined filter configuration for location and/or time.

| Prop            | Type                                                        | Description                                                                                           |
| --------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **`location`**  | <code><a href="#locationfilter">LocationFilter</a></code>   | Optional location-based filter. If provided with timeRange, both filters are applied (AND condition). |
| **`timeRange`** | <code><a href="#timerangefilter">TimeRangeFilter</a></code> | Optional time range filter. If provided with location, both filters are applied (AND condition).      |


#### LocationFilter

Location-based filter configuration.

| Prop              | Type                  | Description                                                                                                                             |
| ----------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`polyline`**    | <code>LatLng[]</code> | GPS track as array of coordinates (e.g., from a recorded route). Images within `radius` meters of any point on the polyline will match. |
| **`coordinates`** | <code>LatLng[]</code> | Individual coordinate points (e.g., from map markers). Images within `radius` meters of any coordinate will match.                      |
| **`radius`**      | <code>number</code>   | Search radius in meters. Default: 100                                                                                                   |


#### LatLng

Geographic coordinate with latitude and longitude.

| Prop      | Type                | Description                  |
| --------- | ------------------- | ---------------------------- |
| **`lat`** | <code>number</code> | Latitude in decimal degrees  |
| **`lng`** | <code>number</code> | Longitude in decimal degrees |


#### TimeRangeFilter

Time range filter configuration.

| Prop        | Type                                  | Description                                                                    |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| **`start`** | <code><a href="#date">Date</a></code> | Start date/time for the filter. Images taken at or after this time will match. |
| **`end`**   | <code><a href="#date">Date</a></code> | End date/time for the filter. Images taken at or before this time will match.  |


### Type Aliases


#### SupportedLocale

Supported languages for built-in translations.

<code>'en' | 'de' | 'fr' | 'es'</code>


#### Partial

Make all properties in T optional

<code>{ [P in keyof T]?: T[P]; }</code>

</docgen-api>
