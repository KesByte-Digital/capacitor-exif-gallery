# Capacitor Image Gallery Plugin

Capacitor plugin for filtering and selecting images by location and time using EXIF data.

[![npm version](https://img.shields.io/npm/v/@kesbyte-digital/capacitor-image-gallery.svg)](https://www.npmjs.com/package/@kesbyte-digital/capacitor-image-gallery)
[![License](https://img.shields.io/badge/license-Commercial-blue.svg)](LICENSE)

## Features

- 📍 **Location-based filtering** - Filter images by GPS coordinates with radius
- 🗺️ **Route-based filtering** - Filter along a route/polyline with corridor
- ⏰ **Time-based filtering** - Filter images by date/time ranges
- 📱 **Native UI** - Smooth, native gallery experience on iOS and Android
- 🔒 **Secure** - Binary distribution protects source code
- 🎯 **EXIF Support** - Extract and filter using EXIF metadata

## Installation

```bash
npm install @kesbyte-digital/capacitor-image-gallery
npx cap sync
```

## Platform Support

| Platform | Supported | Version |
|----------|-----------|---------|
| iOS      | ✅        | 15.0+   |
| Android  | ✅        | API 26+ |
| Web      | ⏳        | Planned |

## Quick Start

```typescript
import { ImageGallery } from '@kesbyte-digital/capacitor-image-gallery';

// Initialize plugin
await ImageGallery.initialize({
  language: 'en' // optional: en, de, fr, es
});

// Pick images with location filter
const result = await ImageGallery.pick({
  maxFiles: 10,
  filter: {
    location: {
      lat: 52.5200,
      lng: 13.4050,
      radius: 5000 // 5km radius
    }
  }
});

console.log('Selected images:', result.images);
```

## Basic Usage

### Simple Image Picker

```typescript
const result = await ImageGallery.pick({
  maxFiles: 5
});
```

### Location Filter (Point + Radius)

```typescript
const result = await ImageGallery.pick({
  filter: {
    location: {
      lat: 52.5200,
      lng: 13.4050,
      radius: 2000 // 2km
    }
  }
});
```

### Route Filter (Polyline)

```typescript
// Using Google Encoded Polyline
const result = await ImageGallery.pick({
  filter: {
    location: {
      polyline: "_p~iF~ps|U_ulLnnqC", // Encoded polyline from Google Directions API
      radius: 1000 // 1km corridor
    }
  }
});

// Or using coordinate array
const result = await ImageGallery.pick({
  filter: {
    location: {
      polyline: [
        { lat: 52.5200, lng: 13.4050 },
        { lat: 52.5300, lng: 13.4150 }
      ],
      radius: 1000
    }
  }
});
```

### Time Filter

```typescript
const result = await ImageGallery.pick({
  filter: {
    time: {
      from: '2024-01-01T00:00:00Z',
      to: '2024-12-31T23:59:59Z'
    }
  }
});
```

### Combined Filters

```typescript
const result = await ImageGallery.pick({
  maxFiles: 20,
  filter: {
    location: {
      lat: 52.5200,
      lng: 13.4050,
      radius: 5000
    },
    time: {
      from: '2024-06-01T00:00:00Z',
      to: '2024-06-30T23:59:59Z'
    }
  }
});
```

## API Documentation

### `initialize(config?: InitConfig): Promise<void>`

Initialize the plugin with optional configuration.

**Parameters:**
- `config.language?` - UI language: `'en' | 'de' | 'fr' | 'es'`

### `pick(options: PickOptions): Promise<PickResult>`

Open the image gallery with optional filters.

**Parameters:**
- `options.maxFiles?` - Maximum number of images (default: 1)
- `options.filter?.location?` - Location-based filter
  - `lat`, `lng`, `radius` - Point + radius filter
  - `polyline`, `radius` - Route-based filter
- `options.filter?.time?` - Time-based filter
  - `from`, `to` - ISO 8601 date strings

**Returns:**
- `images` - Array of selected image metadata
- `cancelled` - Boolean indicating if user cancelled

## Permissions

The plugin handles permissions automatically. On first use, users will be prompted to grant photo library access.

### iOS

Add to `Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to your photo library to select images.</string>
```

### Android

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
                 android:maxSdkVersion="32" />
```

## Distribution Model

This plugin uses **binary distribution** (TransistorSoft model):

- ✅ **iOS**: `.xcframework` binary (arm64 device + arm64/x86_64 simulator)
- ✅ **Android**: `.aar` binary
- ✅ **TypeScript**: Compiled JavaScript modules
- ❌ **Source code**: Not included (protected)

### Integration

The plugin integrates seamlessly with CocoaPods and Gradle:

**iOS (CocoaPods):**
```ruby
pod 'CapacitorImageGallery'
```

**Android (Gradle):**
```gradle
implementation 'digital.kesbyte:capacitor-image-gallery:1.0.0'
```

## Binary Distribution

This plugin uses **compiled binaries** for native code protection:

- **iOS:** Distributed as `.xcframework` (~1.4 MB)
  - arm64 device + arm64/x86_64 simulator
  - No Swift source code included
- **Android:** Distributed as `.aar` (~76 KB)
  - ProGuard/R8 obfuscated
  - No Kotlin/Java source code included
- **TypeScript:** Source code included (web layer)

**Benefits:**
- ✅ Source code protection
- ✅ Simple npm installation
- ✅ CocoaPods + SPM support
- ✅ Zero compilation time for users

**TransistorSoft Model:** Public npm distribution with compiled binaries only.

## License

This is a **commercial plugin**. Contact [contact@kesbyte.digital](mailto:contact@kesbyte.digital) for licensing information.

## Support

- 📧 Email: [contact@kesbyte.digital](mailto:contact@kesbyte.digital)
- 🐛 Issues: [GitHub Issues](https://github.com/KesByte-Digital/capacitor-image-gallery-plugin/issues)
- 📖 Docs: [Full Documentation](https://github.com/KesByte-Digital/capacitor-image-gallery-plugin)

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

---

**Built with ❤️ by KesByte Digital**
