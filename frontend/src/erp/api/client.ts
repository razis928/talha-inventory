const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    if (typeof body === 'object' && body && 'detail' in body) {
      const raw = (body as { detail: unknown }).detail;
      if (typeof raw === 'string') detail = raw;
      else if (Array.isArray(raw)) detail = raw.map((item) => JSON.stringify(item)).join('; ');
      else if (raw != null) detail = String(raw);
    }
    throw new ApiError(detail, response.status);
  }

  return body as T;
}
