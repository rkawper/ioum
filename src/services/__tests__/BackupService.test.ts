import { describe, expect, it } from 'vitest';
import { BackupService, DEFAULT_CURRENCIES } from '../backup/BackupService';

describe('BackupService', () => {
  it('generates valid backup structure', () => {
    const { persons, transactions } = BackupService.getSampleData();
    const backup = BackupService.generateBackup(persons, transactions, DEFAULT_CURRENCIES[0]);

    expect(backup.version).toBe('1.0.0');
    expect(backup.persons.length).toBeGreaterThan(0);
    expect(backup.transactions.length).toBeGreaterThan(0);
    expect(backup.currency.code).toBe('USD');
  });

  it('validates and parses correct JSON backup', () => {
    const { persons, transactions } = BackupService.getSampleData();
    const backup = BackupService.generateBackup(persons, transactions, DEFAULT_CURRENCIES[0]);
    const jsonStr = JSON.stringify(backup);

    const parsed = BackupService.parseAndValidateBackup(jsonStr);
    expect(parsed.persons).toHaveLength(persons.length);
    expect(parsed.transactions).toHaveLength(transactions.length);
  });

  it('throws error for invalid JSON string or corrupted schema', () => {
    expect(() => BackupService.parseAndValidateBackup('invalid json string')).toThrow(
      'Invalid JSON format'
    );

    expect(() =>
      BackupService.parseAndValidateBackup(JSON.stringify({ persons: 'not-an-array' }))
    ).toThrow('"persons" must be an array');
  });
});
