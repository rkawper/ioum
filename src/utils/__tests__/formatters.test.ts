import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getCurrentDateTimeLocal,
  getDueDateStatus,
  toDateTimeLocalString,
} from '../formatters';

describe('formatters', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.5, { code: 'INR', symbol: '₹', name: 'Indian Rupee' })).toBe('₹1,234.50');
  });

  it('toDateTimeLocalString formats Date and ISO string correctly', () => {
    const d = new Date(2026, 8, 23, 14, 30); // Sep 23, 2026 14:30 local
    expect(toDateTimeLocalString(d)).toBe('2026-09-23T14:30');
    expect(toDateTimeLocalString(null)).toBe('');
    expect(toDateTimeLocalString('')).toBe('');
    expect(toDateTimeLocalString('invalid-date')).toBe('');
  });

  it('getCurrentDateTimeLocal returns valid YYYY-MM-DDTHH:mm pattern', () => {
    const current = getCurrentDateTimeLocal();
    expect(current).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('formatDateTime formats ISO date with time', () => {
    const iso = new Date(2026, 8, 23, 14, 30).toISOString();
    const formatted = formatDateTime(iso);
    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/14:30|2:30/);
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime('invalid')).toBe('');
  });

  it('formatDate formats ISO date without crashing on invalid', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('invalid')).toBe('');
  });

  it('getDueDateStatus handles due dates properly', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const status = getDueDateStatus(future.toISOString());
    expect(status).not.toBeNull();
    expect(status?.isOverdue).toBe(false);
    expect(status?.label).toContain('Due');
  });
});
