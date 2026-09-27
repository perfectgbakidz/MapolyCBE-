import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface RouteMatch {
  path: string;
  params: Record<string, string>;
}

interface RouterContextType {
  currentPath: string;
  locationState: unknown;
  navigate: (to: string, state?: unknown) => void;
  matchRoute: (pattern: string) => RouteMatch | null;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Pattern matcher supporting :param dynamic segments
function matchPath(pattern: string, pathname: string): RouteMatch | null {
  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pattern === '*' || pattern === '') {
    return { path: pathname, params: {} };
  }

  if (pattern === '/' && pathname === '/') {
    return { path: '/', params: {} };
  }

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const pSeg = patternSegments[i];
    const aSeg = pathSegments[i];

    if (pSeg.startsWith(':')) {
      const paramName = pSeg.slice(1);
      params[paramName] = decodeURIComponent(aSeg);
    } else if (pSeg !== aSeg) {
      return null;
    }
  }

  return { path: pathname, params };
}

function extractCurrentPath(): string {
  if (typeof window === 'undefined') return '/';

  // 1. Check hash routing fallback (e.g., #/admin/login or #admin/login or #/results)
  if (window.location.hash) {
    const rawHash = window.location.hash.replace(/^#\/?/, '/');
    if (rawHash && rawHash !== '/') {
      return normalizePath(rawHash);
    }
  }

  // 2. Check query param routing fallback (e.g., ?page=admin/login or ?route=/admin/login or ?admin=true)
  const searchParams = new URLSearchParams(window.location.search);
  const pageParam = searchParams.get('page') || searchParams.get('route') || searchParams.get('p');
  if (pageParam) {
    const formatted = pageParam.startsWith('/') ? pageParam : `/${pageParam}`;
    return normalizePath(formatted);
  }
  if (searchParams.has('admin') || searchParams.has('admin_login')) {
    return '/admin/login';
  }
  if (
    searchParams.has('forgot') ||
    searchParams.has('forgot_password') ||
    searchParams.has('forget_password') ||
    searchParams.has('reset_password')
  ) {
    return '/forgot-password';
  }
  if (searchParams.has('profile') || searchParams.has('student_profile')) {
    return '/profile';
  }

  // 3. Standard pathname
  return normalizePath(window.location.pathname);
}

function normalizePath(p: string): string {
  if (!p) return '/';
  const clean = p.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(extractCurrentPath());
  const [locationState, setLocationState] = useState<unknown>(
    typeof window !== 'undefined' ? window.history.state?.usr : undefined
  );

  useEffect(() => {
    const handleNavigationChange = (e?: PopStateEvent) => {
      setCurrentPath(extractCurrentPath());
      if (e) {
        setLocationState(e.state?.usr || undefined);
      }
    };

    window.addEventListener('popstate', handleNavigationChange);
    window.addEventListener('hashchange', handleNavigationChange);
    return () => {
      window.removeEventListener('popstate', handleNavigationChange);
      window.removeEventListener('hashchange', handleNavigationChange);
    };
  }, []);

  const navigate = useCallback((to: string, state?: unknown) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ usr: state }, '', to);
      const normalizedTo = normalizePath(to);
      setCurrentPath(normalizedTo);
      setLocationState(state);
      window.scrollTo(0, 0);
    }
  }, []);

  const matchRoute = useCallback(
    (pattern: string): RouteMatch | null => {
      return matchPath(pattern, currentPath);
    },
    [currentPath]
  );

  return (
    <RouterContext.Provider value={{ currentPath, locationState, navigate, matchRoute, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export function useLocationState<T = unknown>(): T | undefined {
  const { locationState } = useRouter();
  return locationState as T | undefined;
}

export function useParams(): Record<string, string> {
  const { currentPath } = useRouter();
  const params: Record<string, string> = {};

  // Extract query parameters if present
  if (currentPath.includes('?')) {
    const searchPart = currentPath.split('?')[1];
    const searchParams = new URLSearchParams(searchPart);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  // Match current path against known parameterized routes
  const pathWithoutQuery = currentPath.split('?')[0];
  const knownPatterns = [
    '/exam/:examId/start',
    '/exam/:examId/take',
    '/exam/:examId/submitted',
    '/admin/exams/:examId/questions',
    '/admin/questions/:examId',
    '/results/:resultId',
  ];

  for (const pattern of knownPatterns) {
    const match = matchPath(pattern, pathWithoutQuery);
    if (match) {
      return { ...params, ...match.params };
    }
  }

  return params;
}
