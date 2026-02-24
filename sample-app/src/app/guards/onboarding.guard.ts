import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

/**
 * Onboarding Guard
 *
 * Protects routes from being accessed before onboarding is complete.
 * Redirects to onboarding screen if user hasn't completed it yet.
 */
@Injectable({
  providedIn: 'root',
})
export class OnboardingGuard implements CanActivate {
  constructor(
    private storage: StorageService,
    private router: Router,
  ) {}

  async canActivate(): Promise<boolean> {
    const completed = await this.storage.get('onboarding_complete');

    if (!completed) {
      // Redirect to onboarding if not completed
      this.router.navigate(['/onboarding']);
      return false;
    }

    // Allow access if onboarding is complete
    return true;
  }
}
