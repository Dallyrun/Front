import '@testing-library/jest-dom/vitest';

// jsdom 은 URL.createObjectURL / revokeObjectURL 을 구현하지 않음.
// 파일 업로드 미리보기를 쓰는 컴포넌트 테스트 시 필요.
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', {
    value: () => 'blob:mock',
    writable: true,
  });
}
if (typeof URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: () => undefined,
    writable: true,
  });
}
