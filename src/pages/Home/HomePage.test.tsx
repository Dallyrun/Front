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
  it('온보딩 히어로를 렌더한다', () => {
    renderHomePage();

    expect(screen.getByRole('heading', { level: 1, name: /러닝의 모든 순간/ })).toBeInTheDocument();
    expect(screen.getByText(/DALLYRUN WEB/)).toBeInTheDocument();
  });

  it('로그인 / 시작하기 / 둘러보기 CTA 링크를 렌더한다', () => {
    renderHomePage();

    expect(screen.getByRole('link', { name: /로그인/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '시작하기' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /기능 둘러보기/ })).toBeInTheDocument();
  });

  it('각 CTA 는 올바른 경로로 연결된다', () => {
    renderHomePage();

    expect(screen.getByRole('link', { name: /로그인/ })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: '시작하기' })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /기능 둘러보기/ })).toHaveAttribute('href', '/home');
  });
});
