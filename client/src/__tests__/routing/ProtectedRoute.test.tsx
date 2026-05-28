import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from '../../routing/guards/ProtectedRoute';
import { useAuthStore } from '../../store/authStore';
import type { UserResponse } from '../../services/accountService';

const mockUser: UserResponse = {
  id: 1,
  email: 'user@test.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '',
  role: 'USER',
  createdAt: '2024-01-01',
};

function makeRouter() {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <div>Protected Content</div> }],
      },
      { path: '/login', element: <div>Login Page</div> },
    ],
    { initialEntries: ['/'] }
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('redirects an unauthenticated user to /login', () => {
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders child routes for an authenticated user', () => {
    useAuthStore.setState({ user: mockUser });
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
