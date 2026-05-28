import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField from '../../../components/ui/FormField';

describe('FormField', () => {
  it('renders the label text', () => {
    render(<FormField label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders an input element', () => {
    render(<FormField label="Email" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders hint text inside the label', () => {
    render(<FormField label="Phone" hint="(optional)" />);
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it('renders the error message when provided', () => {
    render(<FormField label="Email" error="Enter a valid email" />);
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  it('does not render an error element when error is omitted', () => {
    const { container } = render(<FormField label="Email" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('passes through placeholder to the input', () => {
    render(<FormField label="Email" placeholder="you@example.com" />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });
});
