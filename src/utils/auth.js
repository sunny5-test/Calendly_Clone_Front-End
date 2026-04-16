/**
 * Authentication utility functions.
 * Manages JWT token storage and user state via localStorage.
 */

const TOKEN_KEY = 'token';

/**
 * Get the stored JWT token.
 * @returns {string|null}
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store a JWT token.
 * @param {string} token
 */
export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the stored JWT token (logout).
 */
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if the user is authenticated (has a valid, non-expired token).
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = decodeToken(token);
    // Check expiry (exp is in seconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    removeToken();
    return false;
  }
}

/**
 * Decode a JWT token payload without verification.
 * (Verification is done server-side; client just reads the claims.)
 *
 * @param {string} token
 * @returns {object} Decoded payload
 */
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

/**
 * Get the current user's info from the stored token.
 * @returns {{ userId: number, email: string, name: string, avatar: string|null } | null}
 */
export function getUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = decodeToken(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name || null,
      avatar: payload.avatar || null,
    };
  } catch {
    return null;
  }
}

/**
 * Logout: remove token and redirect to login page.
 */
export function logout() {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
