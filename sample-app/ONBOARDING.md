# Onboarding System Documentation

## Overview

The sample app includes a polished onboarding/welcome screen that introduces users to EXIF Gallery and requests necessary permissions on first launch.

## Architecture

### Components

1. **OnboardingPage** (`/app/onboarding/`)
   - Main onboarding component with 3-slide carousel
   - Handles permission requests and navigation
   - Full purple gradient theme matching app design

2. **StorageService** (`/app/services/storage.service.ts`)
   - Wraps Capacitor Preferences API
   - Persists onboarding completion state
   - Simple key-value storage interface

3. **OnboardingGuard** (`/app/guards/onboarding.guard.ts`)
   - Protects main app routes
   - Redirects to onboarding if not completed
   - Allows access after onboarding completion

## Routing Flow

```
App Launch
    |
    v
/onboarding (Default Route)
    |
    +--> [Skip or Complete]
    |
    v
/tabs/home (Protected by OnboardingGuard)
```

## Slides

### Slide 1: Welcome
- App introduction
- Large icon with purple gradient background
- "Welcome to EXIF Gallery" heading
- Brief feature description

### Slide 2: Features
- Smart filters explanation
- 3 feature highlights:
  - Location-based search
  - Route corridor filtering
  - Time range queries
- Interactive list with icons

### Slide 3: Permissions
- Permission request explanation
- Privacy assurance message
- "Grant Photo Access" button
- Skip option for testing

## Features

### Navigation
- Swipe between slides (touch gestures)
- Next/Previous buttons at bottom
- Skip button (top-right)
- Pagination dots showing progress

### Permission Handling
```typescript
async requestPermissions() {
  // TODO: Implement actual plugin permission request
  // const result = await ExifGallery.requestPermissions();

  // Currently simulates success
  await this.storage.set('onboarding_complete', true);
  this.router.navigate(['/tabs/home'], { replaceUrl: true });
}
```

### Storage Management
```typescript
// Check if onboarding is complete
const completed = await storage.get('onboarding_complete');

// Mark as complete
await storage.set('onboarding_complete', true);

// Reset (for testing)
await storage.remove('onboarding_complete');
```

## Styling

### Theme
- **Background**: Purple gradient (`#6C63FF` to `#4834DF`)
- **Accent**: White text with shadows
- **Cards**: Glassmorphism effect (backdrop-blur)
- **Icons**: Large, prominent, filtered
- **Animations**: Fade-in, bounce, slide transitions

### Responsive Design
- Mobile-first approach
- Adjusts font sizes for small screens (<375px)
- Safe area insets for notched devices
- Full-height slides

## Testing

### Reset Onboarding
To test onboarding flow again:

1. **Chrome DevTools** (Web):
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Native App**:
   ```typescript
   // Add to app component or settings
   await Preferences.remove({ key: 'onboarding_complete' });
   ```

3. **Quick Skip** (Development):
   - Tap "Skip" button in top-right
   - Or tap "Skip for now" on last slide

## Future Enhancements

### TODO Items

1. **Real Permission Request**
   ```typescript
   // Replace simulation with actual plugin call
   const result = await ExifGallery.requestPermissions();
   if (result.granted) {
     // Continue
   } else {
     // Show settings alert
   }
   ```

2. **Open App Settings**
   ```typescript
   // Platform-specific settings navigation
   if (Capacitor.getPlatform() === 'ios') {
     await App.openSettings();
   } else if (Capacitor.getPlatform() === 'android') {
     // Android implementation
   }
   ```

3. **Analytics**
   - Track onboarding completion rate
   - Monitor skip vs. complete actions
   - Measure time spent on each slide

4. **A/B Testing**
   - Test different slide copy
   - Experiment with slide order
   - Measure permission grant rates

## File Structure

```
sample-app/src/app/
├── onboarding/
│   ├── onboarding.page.ts           # Component logic
│   ├── onboarding.page.html         # Template (Swiper slides)
│   ├── onboarding.page.scss         # Purple gradient styles
│   ├── onboarding.page.spec.ts      # Unit tests
│   ├── onboarding.module.ts         # Module definition
│   └── onboarding-routing.module.ts # Route configuration
├── services/
│   └── storage.service.ts           # Preferences wrapper
├── guards/
│   └── onboarding.guard.ts          # Route protection
└── app-routing.module.ts            # Updated with onboarding route
```

## Dependencies

- `@capacitor/preferences` - Key-value storage
- `swiper` - Modern slide carousel (replaces deprecated ion-slides)
- `@ionic/angular` - UI components and routing

## Notes

- Uses Swiper instead of deprecated `ion-slides` (Ionic 8+)
- Angular 20 requires `standalone: false` in component decorator
- CUSTOM_ELEMENTS_SCHEMA needed for Swiper web components
- Route guard runs on every navigation to protected routes
- Storage persists across app restarts

## Testing Checklist

- [ ] First launch shows onboarding
- [ ] Can swipe between slides
- [ ] Navigation buttons work
- [ ] Skip button jumps to last slide
- [ ] Permission button navigates to app
- [ ] Onboarding doesn't show on second launch
- [ ] Guard redirects when not complete
- [ ] Responsive on small screens
- [ ] Animations play smoothly
- [ ] Safe area insets respected
