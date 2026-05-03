import axios from 'axios';

// Aynı origin (mubil.mugla.bel.tr) → /api proxy üzerinden ana portal backend'e
// Dev modda Vite proxy yine /api'yi backend'e yönlendiriyor
const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

// İstek: token varsa Bearer header'ı ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mubil_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Refresh token ile otomatik yenileme ---
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err?.response?.status;

    // 401 ve henüz retry edilmemişse refresh dene
    if (status === 401 && !originalRequest._retry) {
      // Login sayfasındaysa veya refresh isteğiyse direkt logout
      const onLogin = window.location.pathname === '/login';
      const isRefreshReq = originalRequest.url?.includes('/auth/refresh');
      if (onLogin || isRefreshReq) {
        return Promise.reject(err);
      }

      const storedRefreshToken = localStorage.getItem('mubil_refresh_token');
      if (!storedRefreshToken) {
        doLogout();
        return Promise.reject(err);
      }

      if (isRefreshing) {
        // Başka bir refresh zaten devam ediyor — sıraya ekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: storedRefreshToken,
        });
        localStorage.setItem('mubil_token', data.token);
        localStorage.setItem('mubil_refresh_token', data.refreshToken);
        if (data.user) {
          localStorage.setItem('mubil_user', JSON.stringify(data.user));
        }
        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        doLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

function doLogout() {
  localStorage.removeItem('mubil_token');
  localStorage.removeItem('mubil_user');
  localStorage.removeItem('mubil_refresh_token');
  const next = window.location.pathname + window.location.search;
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
}

export default api;
