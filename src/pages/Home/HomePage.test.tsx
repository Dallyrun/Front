import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import HomePage from './HomePage';

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('로고 heading 을 렌더한다', () => {
    renderHomePage();

    expect(screen.getByRole('heading', { level: 1, name: /Dallyrun/i })).toBeInTheDocument();
  });

  it('로그인 / 회원가입 CTA 링크를 렌더한다', () => {
    renderHomePage();

    expect(screen.getByRole('link', { name: /로그인/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /회원가입/ })).toBeInTheDocument();
  });

  it('각 CTA 는 올바른 경로로 연결된다', () => {
    renderHomePage();

    expect(screen.getByRole('link', { name: /로그인/ })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /회원가입/ })).toHaveAttribute('href', '/signup');
  });
});
