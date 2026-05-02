import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import PasswordResetPage from './PasswordResetPage';

function renderPasswordResetPage() {
  return render(
    <MemoryRouter>
      <PasswordResetPage />
    </MemoryRouter>,
  );
}

describe('PasswordResetPage', () => {
  it('비밀번호 재설정 흐름과 5규칙 체크리스트를 렌더한다', () => {
    renderPasswordResetPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /비밀번호를 잊어도/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '비밀번호 재설정' })).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toHaveValue('runner@dallyrun.kr');
    expect(screen.getByLabelText('새 비밀번호')).toHaveValue('mockpassword');

    const rules = [
      '8자 이상 30자 이하',
      '영문 포함',
      '숫자 포함',
      '특수기호 포함',
      '허용 문자만 사용',
    ];
    for (const rule of rules) {
      expect(screen.getByText(new RegExp(rule))).toBeInTheDocument();
    }
  });
});
