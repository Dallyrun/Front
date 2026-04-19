import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders the Dallyrun title', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: /Dallyrun/i })).toBeInTheDocument();
  });
});
