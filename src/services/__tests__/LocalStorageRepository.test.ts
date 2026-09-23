import { describe, expect, it } from 'vitest';
import { LocalStorageRepository } from '../storage/LocalStorageRepository';

interface TestItem {
  id: string;
  name: string;
}

describe('LocalStorageRepository', () => {
  it('saves, retrieves, and deletes items using memory cache fallback', async () => {
    const repo = new LocalStorageRepository<TestItem>('test-items-key');

    const item1 = { id: '1', name: 'Item One' };
    const item2 = { id: '2', name: 'Item Two' };

    await repo.save(item1);
    await repo.save(item2);

    const all = await repo.getAll();
    expect(all).toHaveLength(2);

    const found = await repo.getById('1');
    expect(found?.name).toBe('Item One');

    await repo.delete('1');
    const afterDelete = await repo.getAll();
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0].id).toBe('2');

    await repo.clear();
    const afterClear = await repo.getAll();
    expect(afterClear).toHaveLength(0);
  });
});
