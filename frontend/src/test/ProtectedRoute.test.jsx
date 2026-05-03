import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('ProtectedRoute', () => {
  it('renders children for allowed roles', async () => {
    api.get.mockResolvedValueOnce({ data: { auth: true, user: { role: 'student' } } });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when role is not allowed', async () => {
    api.get.mockResolvedValueOnce({ data: { auth: true, user: { role: 'student' } } });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Login')).toBeInTheDocument();
  });
});
