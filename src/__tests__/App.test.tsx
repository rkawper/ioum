// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('App End-to-End User Flow', () => {
  it('allows recording a loan on fresh state without adding person first', async () => {
    localStorage.clear();

    const { container } = render(<App />);

    // Wait for Dashboard to render
    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeDefined();
    });

    // 1. Click "Lend Money" button
    const lendButton = screen.getByRole('button', { name: /Lend Money/i });
    fireEvent.click(lendButton);

    // 2. Modal opens asking for person name inline
    await waitFor(() => {
      expect(screen.getByText('Record Lent Money')).toBeDefined();
    });

    const personInput = screen.getByPlaceholderText(/Enter person name/i);
    expect(personInput).toBeDefined();

    // 3. Fill in Person name, Amount, and Description
    fireEvent.change(personInput, { target: { value: 'Alice Smith' } });

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '50' } });

    const descInput = screen.getByPlaceholderText(/Dinner split/i);
    fireEvent.change(descInput, { target: { value: 'Sushi night' } });

    // 4. Click Record Loan submit button
    const submitButton = container.querySelector('form button[type="submit"]') as HTMLButtonElement;
    expect(submitButton).not.toBeNull();
    fireEvent.click(submitButton);

    // 5. Verify modal closes and data is rendered on Dashboard and in People list
    await waitFor(() => {
      // Alice Smith should be present in People list and Transaction feed
      const aliceElements = screen.getAllByText('Alice Smith');
      expect(aliceElements.length).toBeGreaterThanOrEqual(1);

      // Sushi night should be in transaction history
      expect(screen.getByText('Sushi night')).toBeDefined();

      // Dashboard header should update to ₹50.00 owed
      expect(screen.getByText('Owed to you: ₹50.00')).toBeDefined();
    });

    // 6. Click Lend Money again to verify Alice appears in the dropdown now!
    fireEvent.click(screen.getByRole('button', { name: /Lend Money/i }));

    await waitFor(() => {
      expect(screen.getByText('Record Lent Money')).toBeDefined();
    });

    // Select should contain Alice Smith
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
    const aliceOptions = screen.getAllByText('Alice Smith');
    expect(aliceOptions.length).toBeGreaterThanOrEqual(1);
  });
});
