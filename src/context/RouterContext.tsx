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

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [locationState, setLocationState] = useState<unknown>(
    typeof window !== 'undefined' ? window.history.state?.usr : undefined
  );

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setCurrentPath(window.location.pathname || '/');
      setLocationState(e.state?.usr || undefined);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, state?: unknown) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ usr: state }, '', to);
      setCurrentPath(to);
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
  // Match current path against known parameterized routes
  const knownPatterns = [
    '/exam/:examId/start',
    '/exam/:examId/take',
    '/exam/:examId/submitted',
    '/admin/exams/:examId/questions',
    '/results/:resultId',
  ];

  for (const pattern of knownPatterns) {
    const match = matchPath(pattern, currentPath);
    if (match) {
      return match.params;
    }
  }

  return {};
}
