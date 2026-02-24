import { Component } from '@angular/core';
import { ExifGallery } from '@kesbyte/capacitor-exif-gallery';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    this.initializePlugin();
  }

  private async initializePlugin() {
    // Only initialize on native platforms
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    try {
      await ExifGallery.initialize({
        // locale not specified - automatically detects system language
        requestPermissionsUpfront: false, // Request permissions JIT
      });
    } catch (error) {
      console.error('[AppComponent] Failed to initialize ExifGallery:', error);
    }
  }
}
