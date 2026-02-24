import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { GeolocationService } from '../services/geolocation.service';
import { Capacitor } from '@capacitor/core';

/**
 * Onboarding Page
 *
 * Single-screen permission request for photo library access and location services.
 * Shows on first app launch, then navigates to main app after completion.
 */
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: false,
})
export class OnboardingPage {
  constructor(
    private router: Router,
    private storage: StorageService,
    private geolocationService: GeolocationService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

  /**
   * Request photo library and location permissions and complete onboarding
   */
  async requestPermissions() {
    try {
      // Track permission states
      let photoGranted = false;
      let locationGranted = false;

      // Check if running on native platform
      const isNative = Capacitor.isNativePlatform();

      // 1. Request Photo Library Access
      if (isNative) {
        // TODO: Replace with actual ExifGallery.requestPermissions() when available
        // For now, simulate permission grant on native platforms
        // const result = await ExifGallery.requestPermissions();
        photoGranted = true; // Simulate grant for now
      } else {
        // On web platform, photo permissions are handled by browser
        photoGranted = true;
      }

      // 2. Request Location Services
      try {
        const locationPermission = await this.geolocationService.requestPermissions();
        locationGranted = locationPermission === 'granted';
      } catch (error) {
        console.error('[Onboarding] Location permission request failed:', error);
        locationGranted = false;
      }

      // 3. Handle permission results
      if (photoGranted && locationGranted) {
        // Both permissions granted - success
        await this.showSuccessToast('All permissions granted!');
        await this.completeOnboarding();
      } else if (photoGranted && !locationGranted) {
        // Photo granted, location denied - warning but continue
        await this.showWarningToast('Location access denied. "Use My Location" feature will be limited.');
        await this.completeOnboarding();
      } else {
        // Photo permission denied - cannot continue
        await this.showPermissionDeniedAlert();
      }
    } catch (error) {
      console.error('[Onboarding] Permission request failed:', error);
      await this.showErrorAlert(error);
    }
  }

  /**
   * Complete onboarding and navigate to app
   */
  private async completeOnboarding() {
    await this.storage.set('onboarding_complete', true);
    this.router.navigate(['/tabs/home'], { replaceUrl: true });
  }

  /**
   * Show success toast
   */
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle',
    });

    await toast.present();
  }

  /**
   * Show warning toast
   */
  private async showWarningToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'bottom',
      color: 'warning',
      icon: 'warning',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }

  /**
   * Show alert when photo library permission is denied
   */
  private async showPermissionDeniedAlert() {
    const alert = await this.alertController.create({
      header: 'Photo Access Required',
      message: 'Photo library access is required to use this app. Please enable it in Settings to continue.',
      buttons: [
        {
          text: 'Try Again',
          handler: () => {
            // Allow user to retry
            this.requestPermissions();
          },
        },
        {
          text: 'Exit',
          role: 'cancel',
          handler: () => {
            // Stay on onboarding page
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Show generic error alert
   */
  private async showErrorAlert(error: any) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: error?.message || 'An error occurred while requesting permissions.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // Allow user to continue despite error
            this.skipOnboarding();
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Skip onboarding and show warning
   */
  async skipOnboarding() {
    // Mark onboarding as complete
    await this.storage.set('onboarding_complete', true);

    // Show warning toast
    const toast = await this.toastController.create({
      message: 'Permissions not granted. Photo library and location features will be limited.',
      duration: 3000,
      position: 'bottom',
      color: 'warning',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });

    await toast.present();

    // Navigate to main app
    this.router.navigate(['/tabs/home'], { replaceUrl: true });
  }
}
