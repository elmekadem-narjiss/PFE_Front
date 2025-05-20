// src/__mocks__/server.ts
import { handlers } from './handlers';

export const server = (async () => {
  const { setupServer } = await import('msw/node');
  return setupServer(...handlers);
})();