import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../../components/ui/Badge';

describe('Badge', () => {
  it('renders the label text', () => {
    render(<Badge label="-20%" variant="discount" />);
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('discount variant applies red styling', () => {
    const { container } = render(<Badge label="-20%" variant="discount" />);
    expect(container.firstChild).toHaveClass('text-brand-red');
    expect(container.firstChild).toHaveClass('bg-red-100');
  });

  it('new variant applies green styling', () => {
    const { container } = render(<Badge label="New" variant="new" />);
    expect(container.firstChild).toHaveClass('text-green-700');
    expect(container.firstChild).toHaveClass('bg-green-100');
  });
});
