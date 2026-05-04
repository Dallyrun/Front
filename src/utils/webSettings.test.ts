import { describe, expect, it } from 'vitest';

import {
  defaultWebSettings,
  formatDistanceKm,
  formatDistanceText,
  normalizeWebSettings,
} from './webSettings';

describe('webSettings', () => {
  it('기본 웹 표시 설정을 정규화한다', () => {
    expect(normalizeWebSettings(null)).toEqual(defaultWebSettings);
  });

  it('기존 localStorage 언어/단위 값을 새 타입으로 정규화한다', () => {
    expect(
      normalizeWebSettings({
        unit: 'mile',
        language: 'English',
        notificationSocial: false,
      }),
    ).toEqual({
      ...defaultWebSettings,
      unit: 'mile',
      language: 'en',
      notificationSocial: false,
    });

    expect(normalizeWebSettings({ unit: 'km', language: '한국어' })).toMatchObject({
      unit: 'km',
      language: 'ko',
    });
  });

  it('km 거리 문자열을 mile 설정에 맞춰 변환한다', () => {
    expect(formatDistanceKm(8.2, 'mile')).toBe('5.1 mile');
    expect(formatDistanceText('10.2km / 10km', 'mile')).toBe('6.3 mile / 6.2 mile');
    expect(formatDistanceText('18.4 km', 'km')).toBe('18.4 km');
  });
});
