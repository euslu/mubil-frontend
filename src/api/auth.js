import api from '../lib/api';

/**
 * Ana portal login endpoint'ini kullanır.
 * Response içinde mubilAccess + mubilRole + refreshToken gelir.
 */
export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  if (!data?.token) {
    throw new Error('Token alınamadı');
  }
  if (!data.mubilAccess) {
    const err = new Error(
      'MUBİL erişim yetkiniz bulunmuyor. Afet İşleri ve Risk Yönetimi Daire Başkanlığı ile iletişime geçin.',
    );
    err.code = 'NO_MUBIL_ACCESS';
    throw err;
  }
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/mubil/me');
  return data;
}

export async function refreshToken(token) {
  const { data } = await api.post('/auth/refresh', { refreshToken: token });
  return data;
}
