import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import AdminRoute from '../../routing/guards/AdminRoute';
import { useAuthStore } from '../../store/authStore';
import type { UserResponse } from '../../services/accountService';

const regularUser: UserResponse = {
  id: 1,
  email: 'user@test.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '',
  role: 'USER',
  createdAt: '2024-01-01',
};

const adminUser: UserResponse = {
  id: 2,
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  phone: '',
  role: 'ADMIN',
  createdAt: '2024-01-01',
};

function makeRouter() {
  return createMemoryRouter(
    [
      {
        path: '/admin',
        element: <AdminRoute />,
        children: [{ index: true, element: <div>Admin Content</div> }],
      },
      { path: '/login', element: <div>Login Page</div> },
      { path: '/', element: <div>Home Page</div> },
    ],
    { initialEntries: ['/admin'] }
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('redirects an unauthenticated user to /login', () => {
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects a non-admin user to the home page', () => {
    useAuthStore.setState({ user: regularUser });
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders admin content for a user with the ADMIN role', () => {
    useAuthStore.setState({ user: adminUser });
    render(<RouterProvider router={makeRouter()} />);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
