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
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(isoString: string): string {
  if (!isoString) return '';
  const target = new Date(isoString);
  const now = new Date();
  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(isoString);
}

export function getDueDateStatus(dueDateStr?: string): {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean;
} | null {
  if (!dueDateStr) return null;
  const target = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
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
    label: `Due ${formatDate(dueDateStr)}`,
    isOverdue: false,
    isDueSoon: false,
  };
}
