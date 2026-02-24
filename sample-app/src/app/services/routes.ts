import { Injectable } from '@angular/core';
import { Route, RouteMap, RoutePoint } from '../models/route.model';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  private readonly INTERNATIONAL_ROUTES: RouteMap = {
    germanyClassic: {
      name: 'Germany Classic (Berlin → Munich → Zugspitze)',
      region: 'Europe',
      points: [
        { lat: 52.5163, lng: 13.3777, label: 'Berlin' },
        { lat: 48.1374, lng: 11.5755, label: 'Munich' },
        { lat: 47.4211, lng: 10.9853, label: 'Zugspitze' },
      ],
      defaultTolerance: 10,
    },
    usEastCoast: {
      name: 'US East Coast (NYC → Philadelphia → DC)',
      region: 'North America',
      points: [
        { lat: 40.7128, lng: -74.006, label: 'New York City' },
        { lat: 39.9526, lng: -75.1652, label: 'Philadelphia' },
        { lat: 38.9072, lng: -77.0369, label: 'Washington DC' },
      ],
      defaultTolerance: 15,
    },
    usWestCoast: {
      name: 'US West Coast (LA → San Diego → Tijuana)',
      region: 'North America',
      points: [
        { lat: 34.0522, lng: -118.2437, label: 'Los Angeles' },
        { lat: 32.7157, lng: -117.1611, label: 'San Diego' },
        { lat: 32.5149, lng: -117.0382, label: 'Tijuana' },
      ],
      defaultTolerance: 12,
    },
    japanTokaido: {
      name: 'Japan Tokaido (Tokyo → Yokohama → Mt. Fuji)',
      region: 'Asia',
      points: [
        { lat: 35.6895, lng: 139.6917, label: 'Tokyo' },
        { lat: 35.4437, lng: 139.638, label: 'Yokohama' },
        { lat: 35.3606, lng: 138.7278, label: 'Mt. Fuji' },
      ],
      defaultTolerance: 8,
    },
    singaporeMalaysia: {
      name: 'Singapore → Malaysia (SG → JB → KL)',
      region: 'Asia',
      points: [
        { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
        { lat: 1.4927, lng: 103.7414, label: 'Johor Bahru' },
        { lat: 3.139, lng: 101.6869, label: 'Kuala Lumpur' },
      ],
      defaultTolerance: 10,
    },
    australiaEast: {
      name: 'Australia East (Sydney → Newcastle → Brisbane)',
      region: 'Oceania',
      points: [
        { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
        { lat: -32.9267, lng: 151.7817, label: 'Newcastle' },
        { lat: -27.4698, lng: 153.0251, label: 'Brisbane' },
      ],
      defaultTolerance: 20,
    },
    argentinaRoute: {
      name: 'Argentina (Buenos Aires → La Plata → Mar del Plata)',
      region: 'South America',
      points: [
        { lat: -34.6037, lng: -58.3816, label: 'Buenos Aires' },
        { lat: -34.9215, lng: -57.9545, label: 'La Plata' },
        { lat: -38.0055, lng: -57.5426, label: 'Mar del Plata' },
      ],
      defaultTolerance: 15,
    },
    ukLondonMidlands: {
      name: 'UK (London → Birmingham → Manchester)',
      region: 'Europe',
      points: [
        { lat: 51.5074, lng: -0.1278, label: 'London' },
        { lat: 52.4862, lng: -1.8904, label: 'Birmingham' },
        { lat: 53.4808, lng: -2.2426, label: 'Manchester' },
      ],
      defaultTolerance: 12,
    },
    franceParis: {
      name: 'France (Paris → Lyon → Marseille)',
      region: 'Europe',
      points: [
        { lat: 48.8566, lng: 2.3522, label: 'Paris' },
        { lat: 45.764, lng: 4.8357, label: 'Lyon' },
        { lat: 43.2965, lng: 5.3698, label: 'Marseille' },
      ],
      defaultTolerance: 15,
    },
    southAfricaCape: {
      name: 'South Africa (Cape Town → Stellenbosch → Hermanus)',
      region: 'Africa',
      points: [
        { lat: -33.9249, lng: 18.4241, label: 'Cape Town' },
        { lat: -33.9322, lng: 18.8602, label: 'Stellenbosch' },
        { lat: -34.4187, lng: 19.2345, label: 'Hermanus' },
      ],
      defaultTolerance: 10,
    },
  };

  constructor() {}

  getRouteById(routeId: string): Route | null {
    return this.INTERNATIONAL_ROUTES[routeId] || null;
  }

  getAllRoutes(): RouteMap {
    return this.INTERNATIONAL_ROUTES;
  }

  getAllRouteIds(): string[] {
    return Object.keys(this.INTERNATIONAL_ROUTES);
  }

  getRoutesByRegion(): { [region: string]: Array<Route & { id: string }> } {
    const grouped: { [region: string]: Array<Route & { id: string }> } = {};

    Object.entries(this.INTERNATIONAL_ROUTES).forEach(([id, route]) => {
      if (!grouped[route.region]) {
        grouped[route.region] = [];
      }
      grouped[route.region].push({ id, ...route });
    });

    return grouped;
  }

  routeToPolyline(route: Route): Array<{ lat: number; lng: number }> {
    if (!route || !route.points) {
      return [];
    }
    return route.points.map((point) => ({
      lat: point.lat,
      lng: point.lng,
    }));
  }
}
