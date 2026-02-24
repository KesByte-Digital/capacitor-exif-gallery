import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonContent,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Gallery, PickResult } from '../../services/gallery';
import { RoutesService } from '../../services/routes';
import { CodeExamples } from '../../services/code-examples';
import { Route, RoutePoint } from '../../models/route.model';
import { GeolocationService } from '../../services/geolocation.service';
import { CodeModalComponent } from '../../components/code-modal/code-modal.component';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
  standalone: false,
})
export class FiltersPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Location filter state
  radiusKm = 10;
  locationLatitude = 52.52; // Berlin (default)
  locationLongitude = 13.405;
  isLoadingLocation = false;

  // Polyline filter state
  toleranceKm = 10;
  selectedRouteId = 'germanyClassic';
  selectedRoute: Route | null = null;

  // Time range filter state
  startDate: string;
  endDate: string;

  // Results state
  showResults = false;
  resultImages: Array<{ uri: string }> = [];
  resultCount = 0;
  resultTime = 0;
  resultFilterName = '';

  // Loading state
  isLoading = false;

  constructor(
    private galleryService: Gallery,
    private routesService: RoutesService,
    private codeExamplesService: CodeExamples,
    private geolocationService: GeolocationService,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
  ) {
    // Set default date range (last 3 months)
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    this.startDate = threeMonthsAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Load selected route
    this.loadSelectedRoute();
  }

  /**
   * Load selected route from service
   */
  private loadSelectedRoute() {
    this.selectedRoute = this.routesService.getRouteById(this.selectedRouteId);
    if (!this.selectedRoute) {
      // Fallback to first route
      const firstRouteId = this.routesService.getAllRouteIds()[0];
      this.selectedRouteId = firstRouteId;
      this.selectedRoute = this.routesService.getRouteById(firstRouteId);
    }
  }

  /**
   * Use current device location
   */
  async useMyLocation() {
    if (!this.geolocationService.isAvailable()) {
      await this.showError('Geolocation is not available on this device');
      return;
    }

    this.isLoadingLocation = true;

    try {
      const position = await this.geolocationService.getCurrentPosition();

      // Update latitude and longitude inputs
      this.locationLatitude = position.coords.latitude;
      this.locationLongitude = position.coords.longitude;

      // Format coordinates for display (4 decimal places)
      const latFormatted = position.coords.latitude.toFixed(4);
      const lngFormatted = position.coords.longitude.toFixed(4);

      await this.showToast(`Location updated: ${latFormatted}, ${lngFormatted}`, 'success');
    } catch (error: any) {
      console.error('Geolocation error:', error);
      await this.showError(error.message || 'Failed to get your location');
    } finally {
      this.isLoadingLocation = false;
    }
  }

  /**
   * Update radius value display
   */
  onRadiusChange(event: any) {
    this.radiusKm = event.detail.value;
  }

  /**
   * Update tolerance value display
   */
  onToleranceChange(event: any) {
    this.toleranceKm = event.detail.value;
  }

  /**
   * Run location filter
   */
  async runLocationFilter() {
    if (!this.galleryService.isAvailable()) {
      await this.showError('Gallery plugin is not available');
      return;
    }

    try {
      // Native gallery opens (has its own loading indicator)
      const result = await this.galleryService.pickWithLocationFilter(
        this.locationLatitude,
        this.locationLongitude,
        this.radiusKm,
      );

      if (result.cancelled) {
        return;
      }

      // Show loading indicator while processing selected images
      const loading = await this.loadingController.create({
        message: `Processing ${result.images.length} image${result.images.length !== 1 ? 's' : ''}...`,
        spinner: 'circular',
      });
      await loading.present();

      try {
        // Use filter execution time from plugin result, fallback to 0 if not available
        const executionTime = Math.round(result.filterExecutionTimeMs || 0);

        await this.displayResults(result, executionTime, `Location Filter (${this.radiusKm}km)`);

        // Auto-scroll to results
        await this.scrollToResults();
      } finally {
        await loading.dismiss();
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Run polyline filter
   */
  async runPolylineFilter() {
    if (!this.galleryService.isAvailable()) {
      await this.showError('Gallery plugin is not available');
      return;
    }

    if (!this.selectedRoute) {
      await this.showError('Please select a route first');
      return;
    }

    try {
      const points = this.routesService.routeToPolyline(this.selectedRoute);

      // Native gallery opens (has its own loading indicator)
      const result = await this.galleryService.pickWithPolylineFilter(points, this.toleranceKm);

      if (result.cancelled) {
        return;
      }

      // Show loading indicator while processing selected images
      const loading = await this.loadingController.create({
        message: `Processing ${result.images.length} image${result.images.length !== 1 ? 's' : ''}...`,
        spinner: 'circular',
      });
      await loading.present();

      try {
        // Use filter execution time from plugin result, fallback to 0 if not available
        const executionTime = Math.round(result.filterExecutionTimeMs || 0);

        await this.displayResults(result, executionTime, `Polyline Filter (${this.toleranceKm}km)`);

        // Auto-scroll to results
        await this.scrollToResults();
      } finally {
        await loading.dismiss();
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Run time range filter
   */
  async runTimeRangeFilter() {
    if (!this.galleryService.isAvailable()) {
      await this.showError('Gallery plugin is not available');
      return;
    }

    try {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      // Native gallery opens (has its own loading indicator)
      const result = await this.galleryService.pickWithTimeRangeFilter(start, end);

      if (result.cancelled) {
        return;
      }

      // Show loading indicator while processing selected images
      const loading = await this.loadingController.create({
        message: `Processing ${result.images.length} image${result.images.length !== 1 ? 's' : ''}...`,
        spinner: 'circular',
      });
      await loading.present();

      try {
        // Use filter execution time from plugin result, fallback to 0 if not available
        const executionTime = Math.round(result.filterExecutionTimeMs || 0);

        const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        await this.displayResults(result, executionTime, `Time Range (${startFormatted} - ${endFormatted})`);

        // Auto-scroll to results
        await this.scrollToResults();
      } finally {
        await loading.dismiss();
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Open route selector action sheet
   */
  async openRouteSelector() {
    const routesByRegion = this.routesService.getRoutesByRegion();
    const regionOrder = ['Europe', 'North America', 'Asia', 'Oceania', 'South America', 'Africa'];

    const buttons: any[] = [];

    // Add routes grouped by region
    regionOrder.forEach((region) => {
      if (routesByRegion[region]) {
        routesByRegion[region].forEach((route) => {
          buttons.push({
            text: route.name,
            icon: route.id === this.selectedRouteId ? 'checkmark-circle' : 'navigate-outline',
            handler: () => {
              this.selectRoute(route.id);
            },
          });
        });
      }
    });

    // Add cancel button
    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      icon: 'close',
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Route',
      subHeader: `Current: ${this.selectedRoute?.name || 'None'}`,
      buttons: buttons,
      cssClass: 'route-selector-action-sheet',
    });

    await actionSheet.present();
  }

  /**
   * Select a route
   */
  private selectRoute(routeId: string) {
    this.selectedRouteId = routeId;
    this.selectedRoute = this.routesService.getRouteById(routeId);
  }

  /**
   * View code example for location filter
   */
  async viewLocationCode() {
    const code = this.codeExamplesService.getLocationFilterExample(
      this.locationLatitude,
      this.locationLongitude,
      this.radiusKm,
    );
    await this.showCodeModal('Location Filter', code);
  }

  /**
   * View code example for polyline filter
   */
  async viewPolylineCode() {
    if (!this.selectedRoute) {
      await this.showError('Please select a route first');
      return;
    }

    const code = this.codeExamplesService.getPolylineFilterExample(
      this.selectedRoute.name,
      this.selectedRoute.points,
      this.toleranceKm,
    );
    await this.showCodeModal('Polyline Filter', code);
  }

  /**
   * View code example for time range filter
   */
  async viewTimeRangeCode() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    const code = this.codeExamplesService.getTimeRangeFilterExample(start, end);
    await this.showCodeModal('Time Range Filter', code);
  }

  /**
   * Display filter results
   */
  private displayResults(result: PickResult, executionTime: number, filterName: string) {
    this.resultImages = result.images || [];
    this.resultCount = this.resultImages.length;
    this.resultTime = executionTime;
    this.resultFilterName = filterName;
    this.showResults = true;

    if (this.resultImages.length > 0) {
      const firstImage = this.resultImages[0];
    }

    if (this.resultCount === 0) {
      this.showToast('No images found matching filter criteria', 'warning');
    }
  }

  /**
   * Clear results
   */
  clearResults() {
    this.showResults = false;
    this.resultImages = [];
    this.resultCount = 0;
    this.resultTime = 0;
    this.resultFilterName = '';
  }

  /**
   * Format date string for display in buttons
   * Uses readable format: "Nov 14, 2025" instead of "14.11.2025"
   */
  formatDateForDisplay(dateString: string): string {
    if (!dateString) {
      return 'Select Date';
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Select Date';
    }
  }

  /**
   * Get web-safe image source for display.
   *
   * Uses webPath if available (already converted by native side),
   * otherwise falls back to manual conversion for backward compatibility.
   *
   * @param image - Image object with uri and optional webPath
   * @returns Web-safe URL for <img> src
   */
  getImageSrc(image: any): string {
    // Prefer webPath if available (native side already converted it)
    if (image.webPath) {
      return image.webPath;
    }

    // Fallback: Manual conversion for backward compatibility
    const uri = image.uri || image;

    if (Capacitor.getPlatform() === 'web') {
      // Web platform already has https:// URLs
      return uri;
    }

    // Convert native file URIs (ph://, file://) to web-safe blob URLs
    const converted = Capacitor.convertFileSrc(uri);
    return converted;
  }

  /**
   * Preview an image (opens in new window)
   */
  previewImage(image: any) {
    // Convert URI for native platforms before opening
    const safeUri = this.getImageSrc(image);
    window.open(safeUri, '_blank');
  }

  /**
   * Show code modal
   */
  private async showCodeModal(title: string, code: string) {
    const modal = await this.modalController.create({
      component: CodeModalComponent,
      componentProps: {
        title: title,
        code: code,
      },
      cssClass: 'code-modal',
    });

    await modal.present();
  }

  /**
   * Show error toast
   */
  private async showError(message: string) {
    await this.showToast(message, 'danger');
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  /**
   * Handle errors
   */
  private async handleError(error: any) {
    console.error('Filter error:', error);

    let message = 'An error occurred while running the filter';

    if (error?.message) {
      if (error.message.includes('permission')) {
        message = 'Photo library permission denied. Please enable in Settings.';
      } else if (error.message.includes('filter')) {
        message = 'Invalid filter parameters. Please try different values.';
      } else {
        message = error.message;
      }
    }

    await this.showError(message);
  }

  /**
   * Scroll to results section
   */
  private async scrollToResults() {
    // Wait a bit for the DOM to update
    setTimeout(async () => {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement && this.content) {
        const yOffset = resultsElement.offsetTop;
        await this.content.scrollToPoint(0, yOffset, 500);
      }
    }, 100);
  }
}
