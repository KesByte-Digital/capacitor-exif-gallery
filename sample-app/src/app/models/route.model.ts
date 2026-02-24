/**
 * Route Model
 * Defines the structure for international routes used in polyline filters
 */

export interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface Route {
  name: string;
  region: string;
  points: RoutePoint[];
  defaultTolerance: number;
}

export interface RouteMap {
  [key: string]: Route;
}
