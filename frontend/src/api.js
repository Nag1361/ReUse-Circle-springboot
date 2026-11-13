// All API configuration and token handling stays here.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
const SESSION_KEY = 'reusecircle-session';

export function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!session?.token || !session?.user?.id) return null;
    const payload = JSON.parse(atob(session.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session) {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

export async function api(path, options = {}) {
  const session = readSession();
  const headers = { ...options.headers };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (session) headers.Authorization = `Bearer ${session.token}`;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the server. Check that the Spring Boot backend is running.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      saveSession(null);
      window.dispatchEvent(new Event('session-expired'));
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}
