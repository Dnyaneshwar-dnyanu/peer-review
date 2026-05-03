import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const SimpleTest = () => <h1>Frontend Test</h1>;

describe('Simple Frontend Test', () => {
  it('should render the test heading', () => {
    render(<SimpleTest />);
    expect(screen.getByText('Frontend Test')).toBeInTheDocument();
  });
});
