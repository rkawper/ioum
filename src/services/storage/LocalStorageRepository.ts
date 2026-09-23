import type { IStorageRepository } from './IStorageRepository';

/**
 * LocalStorage implementation of IStorageRepository (SOLID: LSP, OCP)
 * Persists entities to browser localStorage with in-memory caching fallback.
 */
export class LocalStorageRepository<T extends { id: string }> implements IStorageRepository<T> {
  private readonly storageKey: string;
  private memoryCache: Map<string, T> = new Map();
  private isStorageAvailable: boolean;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
    this.isStorageAvailable = this.checkStorageAvailability();
    this.initCache();
  }

  private checkStorageAvailability(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__ioum_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private initCache(): void {
    if (!this.isStorageAvailable) return;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (raw) {
        const items: T[] = JSON.parse(raw);
        if (Array.isArray(items)) {
          this.memoryCache.clear();
          for (const item of items) {
            if (item && item.id) {
              this.memoryCache.set(item.id, item);
            }
          }
        }
      }
    } catch (e) {
      console.error(`Failed to load data for key "${this.storageKey}":`, e);
    }
  }

  private persist(): void {
    if (!this.isStorageAvailable) return;
    try {
      const items = Array.from(this.memoryCache.values());
      window.localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error(`Failed to persist data for key "${this.storageKey}":`, e);
    }
  }

  async getAll(): Promise<T[]> {
    return Array.from(this.memoryCache.values());
  }

  async getById(id: string): Promise<T | null> {
    return this.memoryCache.get(id) || null;
  }

  async save(item: T): Promise<T> {
    this.memoryCache.set(item.id, item);
    this.persist();
    return item;
  }

  async saveBatch(items: T[]): Promise<void> {
    for (const item of items) {
      this.memoryCache.set(item.id, item);
    }
    this.persist();
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.memoryCache.delete(id);
    if (existed) {
      this.persist();
    }
    return existed;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.isStorageAvailable) {
      try {
        window.localStorage.removeItem(this.storageKey);
      } catch (e) {
        console.error(`Failed to clear key "${this.storageKey}":`, e);
      }
    }
  }
}
