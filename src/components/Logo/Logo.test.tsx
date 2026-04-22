import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Logo from './Logo';

describe('Logo', () => {
  it('기본 size 로 Dallyrun wordmark 를 heading 으로 렌더한다', () => {
    render(<Logo />);
    expect(screen.getByRole('heading', { level: 1, name: /Dallyrun/ })).toBeInTheDocument();
  });

  it('withTagline=false 이면 tagline 이 렌더되지 않는다', () => {
    render(<Logo withTagline={false} />);
    expect(screen.queryByText(/달리는 즐거움/)).not.toBeInTheDocument();
  });

  it('as="h2" 로 heading level 을 바꿀 수 있다', () => {
    render(<Logo as="h2" />);
    expect(screen.getByRole('heading', { level: 2, name: /Dallyrun/ })).toBeInTheDocument();
  });
});
