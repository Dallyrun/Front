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

// zustand persist 미들웨어가 기대하는 Storage 구현이 jsdom 기본값에서 불완전한 경우가 있어
// 확실한 인메모리 localStorage 를 주입.
if (
  typeof globalThis.localStorage === 'undefined' ||
  typeof globalThis.localStorage.setItem !== 'function'
) {
  const store = new Map<string, string>();
  const mock: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mock,
    configurable: true,
    writable: true,
  });
}
