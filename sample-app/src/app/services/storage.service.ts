import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Storage Service
 *
 * Wraps Capacitor Preferences API for simple key-value storage.
 * Used for persisting app state like onboarding completion.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Store a value with the given key
   */
  async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  /**
   * Retrieve a value by key
   * Returns null if key doesn't exist
   */
  async get(key: string): Promise<any> {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  }

  /**
   * Remove a value by key
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Clear all stored values
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
