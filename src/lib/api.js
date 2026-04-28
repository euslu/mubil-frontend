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

// Yanıt: 401 → token expire / yetkisiz, login'e at
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      const onLogin = window.location.pathname === '/login';
      if (!onLogin) {
        localStorage.removeItem('mubil_token');
        localStorage.removeItem('mubil_user');
        // Kullanıcının açık sayfasını sakla, login sonrası geri dönsün
        const next = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
      }
    }
    return Promise.reject(err);
  },
);

export default api;
