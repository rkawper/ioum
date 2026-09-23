// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

describe('Theme Support (System, Light & Dark Mode)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to system theme and cycles through system -> light -> dark -> system', async () => {
    render(<App />);

    // Initial state: defaults to 'system'
    const themeBtn = screen.getByRole('button', { name: /toggle theme mode/i });
    expect(themeBtn).toBeDefined();
    expect(themeBtn.getAttribute('title')).toContain('System');

    // 1. Click toggle: cycles from system -> light
    act(() => {
      fireEvent.click(themeBtn);
    });
    expect(localStorage.getItem('ioum_theme_v1')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(themeBtn.getAttribute('title')).toContain('Light');

    // 2. Click toggle: cycles from light -> dark
    act(() => {
      fireEvent.click(themeBtn);
    });
    expect(localStorage.getItem('ioum_theme_v1')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(themeBtn.getAttribute('title')).toContain('Dark');

    // 3. Click toggle: cycles from dark -> back to system
    act(() => {
      fireEvent.click(themeBtn);
    });
    expect(localStorage.getItem('ioum_theme_v1')).toBe('system');
    expect(themeBtn.getAttribute('title')).toContain('System');
  });

  it('allows selecting System, Light, or Dark directly in Settings modal', async () => {
    render(<App />);

    // Open settings modal
    const settingsBtns = screen.getAllByRole('button', { name: /settings and backup/i });
    fireEvent.click(settingsBtns[0]);

    expect(screen.getByText('Theme Mode')).toBeDefined();

    // Click "Dark" segmented option
    const darkOption = screen.getByTitle('Always Dark');
    act(() => {
      fireEvent.click(darkOption);
    });
    expect(localStorage.getItem('ioum_theme_v1')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click "Light" segmented option
    const lightOption = screen.getByTitle('Always Light');
    act(() => {
      fireEvent.click(lightOption);
    });
    expect(localStorage.getItem('ioum_theme_v1')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click "System" segmented option
    const systemOption = screen.getByTitle('Follow system preference');
    act(() => {
      fireEvent.click(systemOption);
    });
    expect(localStorage.getItem('ioum_theme_v1')).toBe('system');
  });
});
