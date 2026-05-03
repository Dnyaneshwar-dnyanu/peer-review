import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeacherDashboard from '../pages/TeacherDashboard';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('Dashboard flows', () => {
  it('renders teacher dashboard data from API', async () => {
    api.get.mockResolvedValueOnce({
      status: 200,
      data: {
        user: {
          name: 'Dr Ada Lovelace',
          roomsCreated: ['r1', 'r2']
        }
      }
    });

    render(
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Welcome back, Dr Ada/i)).toBeInTheDocument();
    expect(screen.getByText('Total Class Rooms')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
