const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function headers(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      // Sesión ausente o expirada: limpiar y volver al login.
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        /* almacenamiento no disponible */
      }
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message);
  }
  return res.json() as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
};