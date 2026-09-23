// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

describe('Theme Toggle (Light & Dark Mode)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('toggles dark mode class on documentElement and saves preference in localStorage', async () => {
    render(<App />);

    // Initial state: not dark (or matches system)
    const initialIsDark = document.documentElement.classList.contains('dark');

    // Find the theme toggle button in Navbar
    const themeBtn = screen.getByTitle(/Switch to (Dark|Light) Mode/i);
    expect(themeBtn).toBeDefined();

    // Click to toggle
    act(() => {
      fireEvent.click(themeBtn);
    });

    const toggledIsDark = document.documentElement.classList.contains('dark');
    expect(toggledIsDark).toBe(!initialIsDark);

    const savedTheme = localStorage.getItem('ioum_theme_v1');
    expect(savedTheme).toBe(toggledIsDark ? 'dark' : 'light');

    // Click again to toggle back
    act(() => {
      fireEvent.click(themeBtn);
    });

    expect(document.documentElement.classList.contains('dark')).toBe(initialIsDark);
    expect(localStorage.getItem('ioum_theme_v1')).toBe(initialIsDark ? 'dark' : 'light');
  });
});
