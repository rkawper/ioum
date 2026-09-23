import type { Currency } from '../types';

/**
 * DRY Formatter Utilities
 */

export function formatCurrency(amount: number, currency: Currency): string {
  const rounded = Math.round((Math.abs(amount) + Number.EPSILON) * 100) / 100;
  const formattedNumber = rounded.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency.symbol}${formattedNumber}`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Formats a Date or ISO date string to "YYYY-MM-DDTHH:mm" for <input type="datetime-local" />
 * in the user's local timezone.
 */
export function toDateTimeLocalString(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Returns the current date and time formatted as "YYYY-MM-DDTHH:mm" for <input type="datetime-local" />
 */
export function getCurrentDateTimeLocal(): string {
  return toDateTimeLocalString(new Date());
}

export function formatRelativeDate(isoString: string): string {
  if (!isoString) return '';
  const target = new Date(isoString);
  if (isNaN(target.getTime())) return '';
  const now = new Date();
  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

  return formatDateTime(isoString);
}

export function getDueDateStatus(dueDateStr?: string): {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean;
} | null {
  if (!dueDateStr) return null;
  const target = new Date(dueDateStr);
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetMidnight = new Date(target);
  targetMidnight.setHours(0, 0, 0, 0);

  const diffTime = targetMidnight.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`,
      isOverdue: true,
      isDueSoon: false,
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isDueSoon: true,
    };
  }
  if (diffDays <= 3) {
    return {
      label: `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`,
      isOverdue: false,
      isDueSoon: true,
    };
  }

  return {
    label: `Due ${formatDateTime(dueDateStr)}`,
    isOverdue: false,
    isDueSoon: false,
  };
}
