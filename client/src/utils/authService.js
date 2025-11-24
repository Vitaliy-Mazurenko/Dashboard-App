const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let logoutTimer = null;
const subscribers = new Set();

const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const getExpiration = (token) => {
  const payload = decodeToken(token);
  return payload?.exp || null;
};

const notify = () => {
  const snapshot = {
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getCurrentUser(),
  };
  subscribers.forEach((cb) => cb(snapshot));
};

const clearLogoutTimer = () => {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }
};

const scheduleAutoLogout = (token) => {
  clearLogoutTimer();
  const exp = getExpiration(token);
  if (!exp) return;
  const timeout = exp * 1000 - Date.now();
  if (timeout <= 0) {
    authService.logout({ redirect: false });
    return;
  }
  if (typeof window !== 'undefined') {
    logoutTimer = window.setTimeout(() => authService.logout({ reason: 'expired' }), timeout);
  }
};

const authService = {
  subscribe(callback) {
    subscribers.add(callback);
    callback({
      isAuthenticated: authService.isAuthenticated(),
      user: authService.getCurrentUser(),
    });
    return () => subscribers.delete(callback);
  },
  setTokens({ accessToken, refreshToken }, options = {}) {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    scheduleAutoLogout(accessToken);
    if (!options.silent) notify();
  },
  clearTokens(options = {}) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    clearLogoutTimer();
    if (!options.silent) notify();
  },
  logout({ reason, redirect = true } = {}) {
    authService.clearTokens({ silent: true });
    notify();
    if (redirect && typeof window !== 'undefined') {
      if (reason === 'expired') {
        console.warn('Session expired');
      }
      window.location.replace('/login');
    }
  },
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  isTokenExpired(token) {
    if (!token) return true;
    const exp = getExpiration(token);
    if (!exp) return false;
    return exp * 1000 <= Date.now();
  },
  isAuthenticated() {
    const token = authService.getAccessToken();
    return !!token && !authService.isTokenExpired(token);
  },
  getCurrentUser() {
    const token = authService.getAccessToken();
    const payload = decodeToken(token);
    if (!payload) return null;
    return {
      id: payload.id,
      role: payload.role,
      email: payload.email,
      exp: payload.exp,
      ...payload,
    };
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === ACCESS_TOKEN_KEY) {
      scheduleAutoLogout(event.newValue);
      notify();
    }
  });

  const existingToken = authService.getAccessToken();
  if (existingToken) {
    scheduleAutoLogout(existingToken);
  }
}

export default authService;

