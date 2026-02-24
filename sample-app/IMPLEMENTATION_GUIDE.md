# Implementation Guide: Complete Migration

## Executive Summary

The foundation for the Ionic Angular sample-app has been created. This document provides step-by-step instructions to complete the migration from the vanilla JavaScript example-app.

## What's Been Done

1. ✅ Project initialized with `@ionic/cli`
2. ✅ Capacitor 8.0.0 configured
3. ✅ Plugin installed (`capacitor-exif-gallery`)
4. ✅ Tab pages generated (Home, Filters, Code)
5. ✅ Services created (Routes, Gallery, CodeExamples)
6. ✅ Models defined (route.model.ts)
7. ✅ Tabs routing configured
8. ✅ RoutesService fully implemented with all 10 international routes
9. ✅ Documentation created (README.md, MIGRATION_STATUS.md)

## What Needs to Be Done

### Step 1: Update Theme Variables (30 minutes)

**File**: `src/theme/variables.scss`

Add the following at the top of the file (before existing content):

```scss
// Import DM Sans font
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

:root {
  // ==================================
  // MOCK COLOR PALETTE - Dark Theme
  // ==================================

  --mock-bg: #0A0E17;
  --mock-surface: #121825;
  --mock-card: #1A2035;
  --mock-card-hover: #1E2640;

  --mock-accent: #00D4AA;
  --mock-accent-dim: #00D4AA22;
  --mock-accent-glow: #00D4AA44;
  --mock-secondary: #6C63FF;
  --mock-secondary-dim: #6C63FF22;

  --mock-text: #E8ECF4;
  --mock-text-muted: #7A8299;
  --mock-text-dim: #4A5268;

  --mock-border: #1E2A3E;
  --mock-danger: #FF6B6B;
  --mock-warning: #FFB84D;
  --mock-success: #00D4AA;

  // ==================================
  // IONIC COLOR OVERRIDES
  // ==================================

  --ion-color-primary: #00D4AA;
  --ion-color-primary-rgb: 0, 212, 170;
  --ion-color-primary-contrast: #0A0E17;
  --ion-color-primary-contrast-rgb: 10, 14, 23;
  --ion-color-primary-shade: #00BF98;
  --ion-color-primary-tint: #1ADDB5;

  --ion-color-secondary: #6C63FF;
  --ion-color-secondary-rgb: 108, 99, 255;
  --ion-color-secondary-contrast: #ffffff;
  --ion-color-secondary-contrast-rgb: 255, 255, 255;
  --ion-color-secondary-shade: #5F57E0;
  --ion-color-secondary-tint: #7B73FF;

  // Typography
  --ion-font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  // Spacing (8px grid)
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  // Border radius
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 14px;

  // Card padding
  --card-padding: 16px;
  --card-padding-sm: 12px;
  --card-padding-lg: 20px;
}

// Dark mode (default)
.ion-color-dark {
  --ion-background-color: var(--mock-bg);
  --ion-text-color: var(--mock-text);
  --ion-card-background: var(--mock-card);
}
```

### Step 2: Implement GalleryService (45 minutes)

**File**: `src/app/services/gallery.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

export interface GalleryImage {
  uri: string;
  // Add other properties as needed
}

export interface GalleryResult {
  images: GalleryImage[];
  cancelled: boolean;
}

export interface FilterOptions {
  location?: {
    coordinates?: Array<{ lat: number; lng: number }>;
    polyline?: Array<{ lat: number; lng: number }>;
    radius?: number;
  };
  timeRange?: {
    start: Date;
    end: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async pick(options?: { filter?: FilterOptions }): Promise<GalleryResult> {
    try {
      const result = await ExifGallery.pick({
        filter: options?.filter,
        distanceUnit: 'kilometers',
        distanceStep: 5
      });

      return {
        images: result.images || [],
        cancelled: result.cancelled || false
      };
    } catch (error) {
      console.error('[GalleryService] Error picking images:', error);
      await this.showError(this.getErrorMessage(error));
      throw error;
    }
  }

  async showLoading(message: string = 'Loading...') {
    this.loading = await this.loadingCtrl.create({
      message,
      spinner: 'circular'
    });
    await this.loading.present();
  }

  async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  private async showError(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  }
}
```

### Step 3: Implement CodeExamplesService (30 minutes)

**File**: `src/app/services/code-examples.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { RoutesService } from './routes.service';

export interface CodeExample {
  title: string;
  description: string;
  category: string;
  typescript: string;
  javascript?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodeExamplesService {

  constructor(private routesService: RoutesService) {}

  getExample(exampleId: string): CodeExample | null {
    const examples: { [key: string]: CodeExample } = {
      'nearBerlin': {
        title: 'Location Filter - Near Berlin',
        description: 'Filter photos within a radius of Berlin city center',
        category: 'Location Filters',
        typescript: `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function filterNearBerlin() {
  const result = await ExifGallery.pick({
    filter: {
      location: {
        polyline: [{ lat: 52.5200, lng: 13.4050 }],
        radius: 10000 // 10km
      }
    },
    distanceUnit: 'kilometers'
  });

  console.log(\`Found \${result.images.length} images\`);
  return result.images;
}`,
        javascript: `async function filterNearBerlin() {
  const result = await ExifGallery.pick({
    filter: {
      location: {
        polyline: [{ lat: 52.5200, lng: 13.4050 }],
        radius: 10000 // 10km
      }
    },
    distanceUnit: 'kilometers'
  });

  console.log(\`Found \${result.images.length} images\`);
  return result.images;
}`
      },
      'simpleRoute': this.generatePolylineExample('germanyClassic'),
      'dateRange': {
        title: 'Time Range Filter',
        description: 'Filter photos from a specific date range',
        category: 'Time Filters',
        typescript: `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function filterByDateRange() {
  const result = await ExifGallery.pick({
    filter: {
      timeRange: {
        start: new Date(2024, 5, 1),
        end: new Date(2024, 7, 31)
      }
    }
  });

  console.log(\`Found \${result.images.length} images\`);
  return result.images;
}`
      }
    };

    return examples[exampleId] || null;
  }

  getAllExamples(): { [key: string]: CodeExample } {
    // Return all examples
    return {};
  }

  private generatePolylineExample(routeId: string): CodeExample {
    const route = this.routesService.getRouteById(routeId);
    if (!route) {
      return this.generatePolylineExample('germanyClassic');
    }

    const points = route.points.map(p =>
      `        { lat: ${p.lat}, lng: ${p.lng} }${p.label ? `  // ${p.label}` : ''}`
    ).join(',\n');

    return {
      title: `Polyline Filter (${route.name})`,
      description: `Get images along a defined route: ${route.name}`,
      category: 'Location Filters',
      typescript: `import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';

async function getImagesAlongRoute() {
  const result = await ExifGallery.pick({
    filter: {
      location: {
        polyline: [
${points}
        ],
        radius: ${route.defaultTolerance * 1000}
      }
    }
  });

  console.log(\`Found \${result.images.length} images\`);
  return result.images;
}`
    };
  }
}
```

### Step 4: Implement Home Tab (1 hour)

**File**: `src/app/tabs/home/home.page.html`

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Gallery Plugin</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="home-header">
    <div class="plugin-branding">
      <div class="brand-icon">G</div>
      <div class="brand-text">
        <div class="brand-title">Gallery Plugin</div>
        <div class="brand-subtitle">by KesByte Digital</div>
      </div>
    </div>
    <p class="plugin-description">
      Demo app to explore the Capacitor Gallery Plugin. Filter device photos by location, polyline routes, and time ranges.
    </p>
  </div>

  <div class="section-header">
    <h2 class="section-title">Setup</h2>
  </div>

  <ion-card class="setup-card permission-card">
    <ion-card-content>
      <div class="setup-card-content">
        <div class="setup-icon-wrapper">
          <div class="setup-icon">
            <ion-icon name="camera-outline"></ion-icon>
          </div>
        </div>
        <div class="setup-text">
          <h3>Use Your Photos</h3>
          <p>Grant photo and location permissions to test filters with your own images</p>
        </div>
        <div class="setup-action">
          <ion-button (click)="runNearMeFilter()">
            Allow
          </ion-button>
        </div>
      </div>
    </ion-card-content>
  </ion-card>

  <div class="section-header">
    <h2 class="section-title">Quick Test</h2>
  </div>

  <div class="quick-test-grid">
    <ion-card class="quick-test-card" (click)="runLocationFilter()">
      <ion-card-content>
        <div class="quick-test-content">
          <div class="quick-test-icon-wrapper accent-icon">
            <ion-icon name="location-outline"></ion-icon>
          </div>
          <div class="quick-test-text">
            <h3>By Location</h3>
            <p>Filter photos within a radius of a GPS coordinate</p>
          </div>
          <ion-icon name="chevron-forward-outline" class="quick-test-arrow"></ion-icon>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-card class="quick-test-card" (click)="runPolylineFilter()">
      <ion-card-content>
        <div class="quick-test-content">
          <div class="quick-test-icon-wrapper secondary-icon">
            <ion-icon name="git-network-outline"></ion-icon>
          </div>
          <div class="quick-test-text">
            <h3>By Polyline</h3>
            <p>Find photos taken along a route or path</p>
          </div>
          <ion-icon name="chevron-forward-outline" class="quick-test-arrow"></ion-icon>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-card class="quick-test-card" (click)="runTimeFilter()">
      <ion-card-content>
        <div class="quick-test-content">
          <div class="quick-test-icon-wrapper warning-icon">
            <ion-icon name="time-outline"></ion-icon>
          </div>
          <div class="quick-test-text">
            <h3>By Time Range</h3>
            <p>Get photos from a specific date range</p>
          </div>
          <ion-icon name="chevron-forward-outline" class="quick-test-arrow"></ion-icon>
        </div>
      </ion-card-content>
    </ion-card>
  </div>

  <ion-card *ngIf="results" class="results-card">
    <ion-card-header>
      <ion-card-title>Results</ion-card-title>
      <ion-button slot="end" fill="clear" (click)="clearResults()">
        <ion-icon name="close-outline"></ion-icon>
      </ion-button>
    </ion-card-header>
    <ion-card-content>
      <div class="result-stats">
        <div class="stat-item">
          <ion-icon name="image-outline"></ion-icon>
          <span>{{results.images.length}} images</span>
        </div>
        <div class="stat-item">
          <ion-icon name="time-outline"></ion-icon>
          <span>{{results.executionTime}}ms</span>
        </div>
      </div>

      <div *ngIf="results.images.length > 0" class="image-grid">
        <div *ngFor="let img of results.images.slice(0, 12)" class="grid-item">
          <img [src]="img.uri" alt="Gallery Image" loading="lazy">
        </div>
      </div>

      <div *ngIf="results.images.length === 0" class="empty-state">
        <ion-icon name="images-outline"></ion-icon>
        <h3>No Images Found</h3>
        <p>Make sure you have photos with GPS data on your device.</p>
      </div>
    </ion-card-content>
  </ion-card>
</ion-content>
```

**File**: `src/app/tabs/home/home.page.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { GalleryService, GalleryImage } from '../../services/gallery.service';
import { RoutesService } from '../../services/routes.service';

interface ResultsData {
  images: GalleryImage[];
  executionTime: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  results: ResultsData | null = null;

  constructor(
    private galleryService: GalleryService,
    private routesService: RoutesService
  ) {}

  ngOnInit() {}

  async runNearMeFilter() {
    // Implementation
  }

  async runLocationFilter() {
    const startTime = performance.now();
    await this.galleryService.showLoading('Running location filter...');

    try {
      const result = await this.galleryService.pick({
        filter: {
          location: {
            coordinates: [{ lat: 52.52, lng: 13.40 }], // Berlin
            radius: 10000
          }
        }
      });

      const executionTime = Math.round(performance.now() - startTime);
      this.results = {
        images: result.images,
        executionTime
      };
    } catch (error) {
      console.error('Error running location filter:', error);
    } finally {
      await this.galleryService.hideLoading();
    }
  }

  async runPolylineFilter() {
    const route = this.routesService.getRouteById('germanyClassic');
    if (!route) return;

    const startTime = performance.now();
    await this.galleryService.showLoading('Running polyline filter...');

    try {
      const polyline = this.routesService.routeToPolyline(route);
      const result = await this.galleryService.pick({
        filter: {
          location: {
            polyline,
            radius: 10000
          }
        }
      });

      const executionTime = Math.round(performance.now() - startTime);
      this.results = {
        images: result.images,
        executionTime
      };
    } catch (error) {
      console.error('Error running polyline filter:', error);
    } finally {
      await this.galleryService.hideLoading();
    }
  }

  async runTimeFilter() {
    const startTime = performance.now();
    await this.galleryService.showLoading('Running time filter...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.galleryService.pick({
        filter: {
          timeRange: {
            start: thirtyDaysAgo,
            end: new Date()
          }
        }
      });

      const executionTime = Math.round(performance.now() - startTime);
      this.results = {
        images: result.images,
        executionTime
      };
    } catch (error) {
      console.error('Error running time filter:', error);
    } finally {
      await this.galleryService.hideLoading();
    }
  }

  clearResults() {
    this.results = null;
  }
}
```

**File**: `src/app/tabs/home/home.page.scss`

```scss
.home-header {
  padding: var(--spacing-lg);

  .plugin-branding {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-md);
      background: var(--mock-secondary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--mock-text);
    }

    .brand-subtitle {
      font-size: 14px;
      color: var(--mock-text-muted);
    }
  }

  .plugin-description {
    font-size: 14px;
    line-height: 1.5;
    color: var(--mock-text-muted);
    margin: 0;
  }
}

.section-header {
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-md);

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--mock-text);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.setup-card {
  margin: 0 var(--spacing-lg) var(--spacing-lg);

  .setup-card-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .setup-icon-wrapper {
      flex-shrink: 0;

      .setup-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--border-radius-md);
        background: var(--mock-accent-dim);
        color: var(--mock-accent);
        display: flex;
        align-items: center;
        justify-content: center;

        ion-icon {
          font-size: 24px;
        }
      }
    }

    .setup-text {
      flex: 1;

      h3 {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
        color: var(--mock-text);
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--mock-text-muted);
        line-height: 1.4;
      }
    }
  }
}

.quick-test-grid {
  display: grid;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg) var(--spacing-lg);

  .quick-test-card {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }

    .quick-test-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .quick-test-icon-wrapper {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: var(--border-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;

        &.accent-icon {
          background: var(--mock-accent-dim);
          color: var(--mock-accent);
        }

        &.secondary-icon {
          background: var(--mock-secondary-dim);
          color: var(--mock-secondary);
        }

        &.warning-icon {
          background: rgba(255, 184, 77, 0.15);
          color: var(--mock-warning);
        }

        ion-icon {
          font-size: 24px;
        }
      }

      .quick-test-text {
        flex: 1;

        h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
          color: var(--mock-text);
        }

        p {
          margin: 0;
          font-size: 13px;
          color: var(--mock-text-muted);
          line-height: 1.4;
        }
      }

      .quick-test-arrow {
        color: var(--mock-text-dim);
        font-size: 20px;
      }
    }
  }
}

.results-card {
  margin: var(--spacing-lg);

  .result-stats {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-md);

    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 14px;
      color: var(--mock-text-muted);

      ion-icon {
        font-size: 20px;
      }
    }
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-xs);

    .grid-item {
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: var(--border-radius-sm);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl);

    ion-icon {
      font-size: 64px;
      color: var(--mock-text-dim);
      margin-bottom: var(--spacing-md);
    }

    h3 {
      margin: 0 0 var(--spacing-xs);
      font-size: 18px;
      color: var(--mock-text);
    }

    p {
      margin: 0;
      font-size: 14px;
      color: var(--mock-text-muted);
    }
  }
}
```

### Step 5: Build and Test (30 minutes)

```bash
# Build the app
cd sample-app
npm run build

# Sync with platforms
npx cap sync

# Run on iOS
ionic cap run ios

# Run on Android
ionic cap run android
```

### Step 6: Implement Filters and Code Tabs (2 hours)

Follow similar patterns as the Home tab:
- Create HTML templates matching example-app layout
- Implement TypeScript logic using services
- Port CSS styles to SCSS

## Priority Implementation Order

1. ✅ **Foundation** - Routing, services, models (DONE)
2. **Theme** - Variables.scss with purple theme (30 min)
3. **Home Tab** - Quick tests and results display (1 hour)
4. **Gallery Service** - Plugin wrapper (45 min)
5. **Test on Device** - Verify basic functionality (30 min)
6. **Filters Tab** - All filter cards (2 hours)
7. **Code Tab** - Examples and documentation (1 hour)
8. **Polish** - Animations, empty states, error handling (2 hours)

## Testing Checklist

Before considering the migration complete:

- [ ] App builds without errors
- [ ] Tabs navigate correctly
- [ ] Location filter works
- [ ] Polyline filter works with all 10 routes
- [ ] Time range filter works
- [ ] Results display correctly
- [ ] Empty states show when no results
- [ ] Error messages display properly
- [ ] Loading indicators work
- [ ] Dark mode looks correct
- [ ] Safe areas work on iPhone
- [ ] All buttons are responsive
- [ ] Code examples display correctly

## Next Actions for Developer

1. Copy theme variables to `variables.scss`
2. Implement `GalleryService.ts`
3. Implement `CodeExamplesService.ts`
4. Build Home tab (HTML, TS, SCSS)
5. Test on device
6. Continue with Filters and Code tabs

## Estimated Time to Complete

- **Remaining Core Work**: 6-8 hours
- **Testing & Refinement**: 4-6 hours
- **Total**: 10-14 hours

The foundation is solid. The remaining work is systematic porting of UI components and logic from example-app to proper Angular patterns.
