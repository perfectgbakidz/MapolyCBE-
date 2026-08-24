/**
 * MapolyCBE Secure Computer-Based Examination Engine — Central API Client
 * Moshood Abiola Polytechnic
 */

export const BASE_URL: string =
  ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'https://ceb-backend-chph.onrender.com';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
}

export interface ApiStructuredError {
  status: number;
  data: any;
  message: string;
  fieldErrors?: Record<string, string>;
}

/**
 * 4.1 Base setup: apiRequest
 * Central HTTP client communicating with backend endpoints.
 * Handles query parameter serialization, Bearer auth tokens, JSON headers, and status code mapping.
 */
export async function apiRequest<T = any>(
  path: string,
  { method = 'GET', body, token, params, headers }: ApiRequestOptions = {}
): Promise<T> {
  // If BASE_URL is set, format full URL, else use relative path
  let targetUrl: string;
  if (BASE_URL) {
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(cleanBase + cleanPath);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) url.searchParams.set(k, String(v));
      });
    }
    targetUrl = url.toString();
  } else {
    const url = new URL(path, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) url.searchParams.set(k, String(v));
      });
    }
    targetUrl = url.pathname + url.search;
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(targetUrl, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // 4.3 Central error handling: map backend status codes to structured UI error object
    const structuredError: ApiStructuredError = {
      status: res.status,
      data,
      message: extractErrorMessage(res.status, data),
      fieldErrors: data?.errors || (data?.detail && Array.isArray(data.detail) ? mapFastApiErrors(data.detail) : undefined),
    };

    // Central 401 handling for expired/invalid tokens (unless it's an initial login call)
    if (res.status === 401 && !path.includes('/login')) {
      handleUnauthorizedSession();
    }

    throw structuredError;
  }

  return data as T;
}

/**
 * Maps status codes to UI friendly error messages per Section 4.3
 */
function extractErrorMessage(status: number, data: any): string {
  if (data?.message) return data.message;
  if (data?.detail && typeof data.detail === 'string') return data.detail;

  switch (status) {
    case 401:
      return 'Invalid credentials or session expired.';
    case 403:
      return "You don't have access to this resource.";
    case 404:
      return 'The requested resource could not be found.';
    case 409:
      return 'Conflict: Duplicate registration or exam already submitted.';
    case 422:
      return 'Validation error: Please verify your input fields.';
    case 423:
      return 'Account temporarily locked due to repeated failed attempts. Please wait 15 minutes.';
    case 429:
      return 'Too many requests. Please slow down and wait a moment.';
    case 500:
    case 502:
    case 503:
      return 'Something went wrong on the server, please try again.';
    default:
      return `Request failed with HTTP ${status}.`;
  }
}

function mapFastApiErrors(details: Array<{ loc: string[]; msg: string }>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const item of details) {
    const field = item.loc[item.loc.length - 1] || 'field';
    result[field] = item.msg;
  }
  return result;
}

/**
 * Handles clearing invalid/expired tokens and redirecting appropriately
 */
function handleUnauthorizedSession() {
  const isCandidateRoute = window.location.pathname.startsWith('/exam') || window.location.pathname === '/dashboard' || window.location.pathname === '/results';
  const isAdminRoute = window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login';

  if (isAdminRoute) {
    localStorage.removeItem('mapolycbe_admin_token_v1');
    localStorage.removeItem('mapolycbe_admin_user_v1');
    window.location.href = '/admin/login';
  } else if (isCandidateRoute) {
    localStorage.removeItem('mapolycbe_candidate_token_v1');
    localStorage.removeItem('mapolycbe_candidate_user_v1');
    window.location.href = '/login';
  }
}

/**
 * 4.4 Endpoint reference helper modules
 */

// Auth Endpoints
export const authApi = {
  candidateRegister: (body: { matric_no: string; email: string; full_name: string; password: string }) =>
    apiRequest<{ access_token: string; token_type: string; role: 'candidate'; user: any }>('/auth/candidate/register', {
      method: 'POST',
      body,
    }),

  candidateLogin: (body: { identifier: string; password?: string }) =>
    apiRequest<{ access_token: string; token_type: string; role: 'candidate'; user: any }>('/auth/candidate/login', {
      method: 'POST',
      body,
    }),

  adminRegister: (body: { username: string; email: string; password: string }) =>
    apiRequest<{ access_token: string; token_type: string; role: 'admin'; user: any }>('/auth/admin/register', {
      method: 'POST',
      body,
    }),

  adminLogin: (body: { identifier: string; password?: string }) =>
    apiRequest<{ access_token: string; token_type: string; role: 'admin'; user: any }>('/auth/admin/login', {
      method: 'POST',
      body,
    }),
};

// Exams & Questions Endpoints
export const examsApi = {
  getExams: () => apiRequest<any[]>('/exams', { method: 'GET' }),

  getExam: (examId: string) => apiRequest<any>(`/exams/${examId}`, { method: 'GET' }),

  createExam: (body: { title: string; description?: string; duration_minutes: number }, token: string) =>
    apiRequest<any>('/exams', {
      method: 'POST',
      body,
      token,
    }),

  addQuestion: (
    examId: string,
    body: { text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_option: string },
    token: string
  ) =>
    apiRequest<any>(`/exams/${examId}/questions`, {
      method: 'POST',
      body,
      token,
    }),

  getExamQuestionsAdmin: (examId: string, token: string) =>
    apiRequest<any[]>(`/exams/${examId}/questions/admin`, {
      method: 'GET',
      token,
    }),

  getExamQuestions: (examId: string, token?: string) =>
    apiRequest<any[]>(`/exams/${examId}/questions`, {
      method: 'GET',
      token,
    }),
};

// Responses & Results Endpoints
export const responsesApi = {
  submitResponse: (
    examId: string,
    body: { question_id: string; selected_option: string; session_id?: string },
    token: string
  ) =>
    apiRequest<{ id: string; question_id: string; selected_option: string; checksum: string }>(
      `/exams/${examId}/responses`,
      {
        method: 'POST',
        body,
        token,
      }
    ),

  getMyResponses: (examId: string, token: string) =>
    apiRequest<any[]>(`/exams/${examId}/responses/me`, {
      method: 'GET',
      token,
    }),

  submitExam: (examId: string, token: string) =>
    apiRequest<{ id: string; exam_id: string; score: number; total_questions: number; submitted_at: string; checksum: string }>(
      `/exams/${examId}/submit`,
      {
        method: 'POST',
        token,
      }
    ),

  getMyResults: (token: string) =>
    apiRequest<any[]>('/results/me', {
      method: 'GET',
      token,
    }),
};

// Security Monitoring Endpoints
export const securityApi = {
  getSecurityLogs: (params: { limit?: number; event_type?: string } = {}, token: string) =>
    apiRequest<any[]>('/security/logs', {
      method: 'GET',
      params,
      token,
    }),

  verifyResponse: (responseId: string, token: string) =>
    apiRequest<{ record_id: string; table: string; stored_checksum: string; recomputed_checksum: string; intact: boolean }>(
      `/security/verify/response/${responseId}`,
      {
        method: 'GET',
        token,
      }
    ),

  verifyResult: (resultId: string, token: string) =>
    apiRequest<{ record_id: string; table: string; stored_checksum: string; recomputed_checksum: string; intact: boolean }>(
      `/security/verify/result/${resultId}`,
      {
        method: 'GET',
        token,
      }
    ),
};

// Health Check Endpoint
export const healthApi = {
  checkHealth: () => apiRequest<{ status: string; timestamp?: string }>('/health', { method: 'GET' }),
};
