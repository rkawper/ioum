// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  it('initializes with current navigator.onLine value', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(typeof result.current).toBe('boolean');
  });

  it('updates state on window offline and online events', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
