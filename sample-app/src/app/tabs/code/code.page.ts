import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CodeExamples } from '../../services/code-examples';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';

// Register languages
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('bash', bash);

interface CodeExample {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  code: string;
}

@Component({
  selector: 'app-code',
  templateUrl: './code.page.html',
  styleUrls: ['./code.page.scss'],
  standalone: false,
})
export class CodePage implements OnInit, AfterViewInit {
  codeExamples: CodeExample[] = [];
  filteredExamples: CodeExample[] = [];
  searchTerm = '';
  selectedCategory = 'all';

  categories = [
    { value: 'all', label: 'All' },
    { value: 'setup', label: 'Setup' },
    { value: 'basic', label: 'Basic' },
    { value: 'filters', label: 'Filters' },
    { value: 'advanced', label: 'Advanced' },
  ];

  constructor(
    private codeExamplesService: CodeExamples,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.initializeExamples();
    this.filteredExamples = this.codeExamples;
  }

  ngAfterViewInit() {
    this.highlightCode();
  }

  private highlightCode() {
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 0);
  }

  private initializeExamples() {
    this.codeExamples = [
      {
        id: 'installation',
        category: 'setup',
        title: 'Installation',
        description: 'Install the plugin and sync with native projects',
        icon: 'download-outline',
        code: this.codeExamplesService.getInstallationExample(),
      },
      {
        id: 'import',
        category: 'setup',
        title: 'Import & Types',
        description: 'Import the plugin and TypeScript types',
        icon: 'code-outline',
        code: this.codeExamplesService.getImportExample(),
      },
      {
        id: 'permissions',
        category: 'setup',
        title: 'Permissions Setup',
        description: 'Configure iOS and Android permissions',
        icon: 'shield-checkmark-outline',
        code: this.codeExamplesService.getPermissionsExample(),
      },
      {
        id: 'configuration',
        category: 'setup',
        title: 'Configuration',
        description: 'Configure the plugin in capacitor.config.ts',
        icon: 'settings-outline',
        code: this.codeExamplesService.getConfigurationExample(),
      },
      {
        id: 'basic',
        category: 'basic',
        title: 'Basic Image Picker',
        description: 'Pick all images from the gallery',
        icon: 'images-outline',
        code: this.codeExamplesService.getBasicExample(),
      },
      {
        id: 'location',
        category: 'filters',
        title: 'Location Filter',
        description: 'Find images near a specific location',
        icon: 'location-outline',
        code: this.codeExamplesService.getLocationFilterExample(52.52, 13.405, 10),
      },
      {
        id: 'polyline',
        category: 'filters',
        title: 'Polyline Filter (Coordinates)',
        description: 'Find images along a route using coordinate array',
        icon: 'git-network-outline',
        code: this.codeExamplesService.getPolylineFilterExample(
          'Berlin to Hamburg',
          [
            { lat: 52.520008, lng: 13.404954, label: 'Berlin' },
            { lat: 52.373801, lng: 9.738012, label: 'Hannover' },
            { lat: 53.551086, lng: 9.993682, label: 'Hamburg' },
          ],
          5,
        ),
      },
      {
        id: 'encoded-polyline',
        category: 'filters',
        title: 'Polyline Filter (Encoded)',
        description: 'Find images along a route using Google encoded polyline',
        icon: 'code-working-outline',
        code: this.codeExamplesService.getEncodedPolylineExample(),
      },
      {
        id: 'timerange',
        category: 'filters',
        title: 'Time Range Filter',
        description: 'Find images within a date range',
        icon: 'time-outline',
        code: this.codeExamplesService.getTimeRangeFilterExample(new Date('2024-01-01'), new Date('2024-12-31')),
      },
      {
        id: 'error-handling',
        category: 'advanced',
        title: 'Error Handling',
        description: 'Proper error handling and user feedback',
        icon: 'warning-outline',
        code: this.codeExamplesService.getErrorHandlingExample(),
      },
      {
        id: 'advanced',
        category: 'advanced',
        title: 'Advanced Combinations',
        description: 'Combine multiple filters and process results',
        icon: 'options-outline',
        code: this.codeExamplesService.getAdvancedExample(),
      },
      {
        id: 'types',
        category: 'advanced',
        title: 'TypeScript Interfaces',
        description: 'Complete type definitions for the plugin',
        icon: 'terminal-outline',
        code: this.codeExamplesService.getTypesExample(),
      },
    ];
  }

  async copyCode(code: string, title: string) {
    try {
      await navigator.clipboard.writeText(code);

      const toast = await this.toastController.create({
        message: `${title} copied to clipboard!`,
        duration: 2000,
        position: 'bottom',
        color: 'success',
        icon: 'checkmark-circle-outline',
      });

      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to copy to clipboard',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
        icon: 'close-circle-outline',
      });

      await toast.present();
    }
  }

  filterExamples() {
    let filtered = this.codeExamples;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter((ex) => ex.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.title.toLowerCase().includes(term) ||
          ex.description.toLowerCase().includes(term) ||
          ex.code.toLowerCase().includes(term),
      );
    }

    this.filteredExamples = filtered;

    // Re-apply syntax highlighting after filtering
    setTimeout(() => this.highlightCode(), 0);
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterExamples();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.filterExamples();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterExamples();
  }
}
