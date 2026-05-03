import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnterRoom from '../components/EnterRoom';
import api from '../api/axios';

const mockNavigate = vi.fn();

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn()
  }
}));

describe('Room flows', () => {
  it('submits room code and navigates on success', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        roomID: 'room123'
      }
    });

    render(
      <MemoryRouter>
        <EnterRoom toggleModal={vi.fn()} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Room Code');
    fireEvent.change(input, { target: { value: 'ABC123' } });

    const button = screen.getByRole('button', { name: /join room/i });
    fireEvent.click(button);

    expect(api.post).toHaveBeenCalledWith('/api/student/room/ABC123/join');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student/room/abc123/room123');
    });
  });
});
