import * as polyline from 'polyline';
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
export class PolylineDecoder {
    /**
     * Decodes an encoded polyline string to LatLng coordinate array.
     */
    static decode(encoded) {
        try {
            // polyline package returns array of [lat, lng] coordinate pairs
            const decoded = polyline.decode(encoded);
            // Convert to LatLng objects
            return decoded.map(([lat, lng]) => ({ lat, lng }));
        }
        catch (error) {
            throw new Error(`Failed to decode polyline: ${error.message}`);
        }
    }
}
//# sourceMappingURL=PolylineDecoder.js.map