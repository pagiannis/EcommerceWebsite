import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StarRating from '../../../components/ui/StarRating';

describe('StarRating', () => {
  it('fills 80% for a rating of 4', () => {
    const { container } = render(<StarRating rating={4} />);
    const fill = container.querySelector('.text-yellow-400') as HTMLElement;
    expect(fill.style.width).toBe('80%');
  });

  it('fills 100% for a rating of 5', () => {
    const { container } = render(<StarRating rating={5} />);
    const fill = container.querySelector('.text-yellow-400') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('fills 0% for a rating of 0', () => {
    const { container } = render(<StarRating rating={0} />);
    const fill = container.querySelector('.text-yellow-400') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('clamps ratings above 5 to 100%', () => {
    const { container } = render(<StarRating rating={10} />);
    const fill = container.querySelector('.text-yellow-400') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('does not render the rating text without reviewCount', () => {
    render(<StarRating rating={3} />);
    expect(screen.queryByText(/\/5/)).toBeNull();
  });

  it('renders the rating text when reviewCount is provided', () => {
    render(<StarRating rating={4.5} reviewCount={12} />);
    expect(screen.getByText('4.5/5')).toBeInTheDocument();
  });
});
