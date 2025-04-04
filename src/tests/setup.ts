import React from 'react';
import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock import.meta.env
const env = {
  VITE_API_URL: 'http://localhost:3000'
};

vi.stubGlobal('import', { meta: { env } });

// Mock API base
vi.mock('@/lib/api-base', () => ({
  default: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({})
  }
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: ReactNode }) => React.createElement(React.Fragment, null, children),
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null
    }),
    useParams: () => ({}),
    useRoutes: () => null,
    Link: ({ to, children }: { to: string, children: ReactNode }) => 
      React.createElement('a', { href: to }, children),
    Route: ({ children }: { children: ReactNode }) => React.createElement(React.Fragment, null, children)
  };
}); 