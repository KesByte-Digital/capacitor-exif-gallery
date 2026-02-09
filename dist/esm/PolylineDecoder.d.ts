import type { LatLng } from './definitions';
/**
 * Decodes Google's Encoded Polyline format to coordinate array.
 *
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 *
 * Precision: Uses precision 5 (Google Maps default, ±1 meter accuracy).
 * Higher precision polylines (precision 6+) are also supported automatically.
 *
 * @param encoded - Encoded polyline string (e.g., "_p~iF~ps|U_ulLnnqC")
 * @returns Array of LatLng coordinates
 * @throws Error if encoded string is malformed or exceeds limits
 *
 * @example
 * const coords = PolylineDecoder.decode("_p~iF~ps|U_ulLnnqC");
 * // Returns: [{ lat: 38.5, lng: -120.2 }, { lat: 40.7, lng: -120.95 }, ...]
 */
export declare class PolylineDecoder {
    /**
     * Decodes an encoded polyline string to LatLng coordinate array.
     */
    static decode(encoded: string): LatLng[];
}
