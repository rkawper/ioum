/**
 * Generic Storage Repository Interface (SOLID: DIP, ISP)
 * Defines the contract for asynchronous CRUD persistence.
 */
export interface IStorageRepository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  save(item: T): Promise<T>;
  saveBatch(items: T[]): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
