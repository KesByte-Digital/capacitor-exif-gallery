import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  features = [
    {
      icon: 'navigate-circle',
      title: 'Location-Based Filtering',
      description:
        'Filter photos by GPS coordinates with radius or polyline. Find all images taken near a specific location with precision.',
      color: 'primary',
    },
    {
      icon: 'calendar',
      title: 'Time-Range Filtering',
      description:
        'Select photos from specific date ranges. Search by timestamps to find images from particular moments in time.',
      color: 'secondary',
    },
    {
      icon: 'image',
      title: 'EXIF Metadata Extraction',
      description: 'Extract GPS coordinates, timestamps, and comprehensive metadata from your photos automatically.',
      color: 'tertiary',
    },
  ];

  constructor() {}
}
