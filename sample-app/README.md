# Capacitor EXIF Gallery - Ionic Angular Sample App

This is a proper Ionic Angular application that demonstrates the Capacitor EXIF Gallery plugin functionality. It replaces the vanilla JavaScript `example-app` with a production-ready Angular implementation.

## Features

- **Modern Ionic Framework**: Built with Ionic 8 + Angular 18
- **Tabs Navigation**: Home, Filters, and Code tabs
- **Gallery Filtering**: Location, Polyline, and Time Range filters
- **International Routes**: 10 predefined routes across 5 continents
- **Dark Mode Support**: Full theme system with dark purple accent
- **Type Safety**: Full TypeScript implementation
- **Proper Architecture**: Services, models, and component-based structure

## Prerequisites

- Node.js 18+
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)

## Installation

```bash
# Install dependencies
npm install

# Sync with native platforms
npx cap sync

# Add iOS platform (if not already added)
npx cap add ios

# Add Android platform (if not already added)
npx cap add android
```

## Development

```bash
# Serve in browser with live reload
npm start
# or
ionic serve

# Run on iOS
ionic cap run ios

# Run on Android
ionic cap run android
```

## Build

```bash
# Build for production
npm run build

# Sync native platforms
npx cap sync

# Open in Xcode
npx cap open ios

# Open in Android Studio
npx cap open android
```

## Project Structure

```
sample-app/
├── src/
│   ├── app/
│   │   ├── tabs/              # Tab pages
│   │   │   ├── home/          # Gallery home tab
│   │   │   ├── filters/       # Filters demonstration tab
│   │   │   └── code/          # Code examples tab
│   │   ├── services/          # Angular services
│   │   │   ├── gallery.service.ts
│   │   │   ├── routes.service.ts
│   │   │   └── code-examples.service.ts
│   │   ├── models/            # TypeScript models
│   │   │   └── route.model.ts
│   │   └── shared/            # Shared components
│   ├── theme/                 # SCSS theme files
│   │   └── variables.scss     # Theme variables
│   └── assets/                # Static assets
├── android/                   # Android native project
├── ios/                       # iOS native project
└── capacitor.config.ts        # Capacitor configuration
```

## Theme Customization

The app uses a custom dark purple theme matching the original example-app design:

- Primary color: `#00D4AA` (Teal)
- Secondary color: `#6C63FF` (Purple)
- Dark background: `#0A0E17`
- Surface background: `#121825`

Theme variables are defined in `src/theme/variables.scss`.

## Plugin Usage

The app demonstrates all major features of the `capacitor-exif-gallery` plugin:

### Location Filter
```typescript
import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

const result = await ExifGallery.pick({
  filter: {
    location: {
      coordinates: [{ lat: 52.52, lng: 13.40 }],
      radius: 5000
    }
  }
});
```

### Polyline Filter
```typescript
const result = await ExifGallery.pick({
  filter: {
    location: {
      polyline: [
        { lat: 52.5163, lng: 13.3777 }, // Berlin
        { lat: 48.1374, lng: 11.5755 }  // Munich
      ],
      radius: 10000
    }
  }
});
```

### Time Range Filter
```typescript
const result = await ExifGallery.pick({
  filter: {
    timeRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    }
  }
});
```

## Testing

To test the plugin functionality:

1. **Prepare Test Images**: Add photos with GPS EXIF data to your device
2. **Grant Permissions**: Allow photo library and location access when prompted
3. **Run Filters**: Test location, polyline, and time range filters
4. **Verify Results**: Check that images are correctly filtered based on criteria

## Differences from example-app

| Aspect | example-app (Vanilla JS) | sample-app (Ionic Angular) |
|--------|--------------------------|----------------------------|
| Framework | Ionic Web Components via CDN | Ionic Angular Framework |
| Language | JavaScript | TypeScript |
| Architecture | Script files | Services + Components |
| Routing | Tab switching via Ionic | Angular Router |
| State Management | Global variables | RxJS + Services |
| Safe Areas | Custom CSS hacks | Ionic built-in support |
| Build System | Vite | Angular CLI + Vite |
| Type Safety | None | Full TypeScript |

## Known Issues

None currently. Please report issues on GitHub.

## License

MIT

## Author

KesByte Digital
