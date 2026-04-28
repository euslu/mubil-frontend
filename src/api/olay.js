import api from '../lib/api';

export async function listOlaylar(params = {}) {
  const { data } = await api.get('/mubil/olay', { params });
  return data; // { toplam, sayfa, limit, kayitlar }
}

export async function getOlay(id) {
  const { data } = await api.get(`/mubil/olay/${id}`);
  return data;
}

export async function createOlay(payload) {
  const { data } = await api.post('/mubil/olay', payload);
  return data;
}

export async function updateOlay(id, payload) {
  const { data } = await api.put(`/mubil/olay/${id}`, payload);
  return data;
}

export async function deleteOlay(id) {
  const { data } = await api.delete(`/mubil/olay/${id}`);
  return data;
}

/**
 * Foto upload — multipart/form-data.
 * Returns: { items: [{ url, filename, ... }] }
 */
/**
 * Harita için kompakt kayıtlar (pagination yok, max 5000).
 * Backend'in /api/mubil/olay/map endpoint'i.
 */
export async function fetchMapKayitlar(filters = {}) {
  const params = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== null && v !== '' && v !== undefined) params[k] = v;
  }
  const { data } = await api.get('/mubil/olay/map', { params });
  return data; // { toplam, kayitlar, limit }
}

export async function uploadFotograflar(files, onProgress) {
  const fd = new FormData();
  for (const f of files) fd.append('fotograflar', f);
  const { data } = await api.post('/mubil/olay/foto-upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data;
}
