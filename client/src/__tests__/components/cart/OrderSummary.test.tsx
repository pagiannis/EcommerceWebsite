import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import OrderSummary from '../../../components/cart/OrderSummary';

function renderOrderSummary(subtotal: number) {
  return render(
    <MemoryRouter>
      <OrderSummary subtotal={subtotal} />
    </MemoryRouter>
  );
}

describe('OrderSummary', () => {
  it('displays subtotal, delivery fee, and total', () => {
    renderOrderSummary(100);
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$15')).toBeInTheDocument();
    expect(screen.getByText('$115')).toBeInTheDocument();
  });

  it('applies SHOP20 promo code (20% off) and updates total', async () => {
    const user = userEvent.setup();
    renderOrderSummary(100);
    await user.type(screen.getByPlaceholderText('Add promo code'), 'SHOP20');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Code "SHOP20" applied!')).toBeInTheDocument();
    expect(screen.getByText('-$20')).toBeInTheDocument();
    // 100 - 20 + 15 = 95
    expect(screen.getByText('$95')).toBeInTheDocument();
  });

  it('applies SAVE10 promo code (10% off) and updates total', async () => {
    const user = userEvent.setup();
    renderOrderSummary(200);
    await user.type(screen.getByPlaceholderText('Add promo code'), 'SAVE10');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Code "SAVE10" applied!')).toBeInTheDocument();
    // 200 - 20 + 15 = 195
    expect(screen.getByText('$195')).toBeInTheDocument();
  });

  it('shows an error for an invalid promo code', async () => {
    const user = userEvent.setup();
    renderOrderSummary(100);
    await user.type(screen.getByPlaceholderText('Add promo code'), 'INVALID');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Invalid promo code.')).toBeInTheDocument();
  });

  it('clears the error when the input is changed after a failed attempt', async () => {
    const user = userEvent.setup();
    renderOrderSummary(100);
    await user.type(screen.getByPlaceholderText('Add promo code'), 'INVALID');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Invalid promo code.')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Add promo code'), 'X');
    expect(screen.queryByText('Invalid promo code.')).toBeNull();
  });
});
