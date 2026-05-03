import api from '../lib/api';

// ─── Kategoriler ───
export async function fetchKategoriler(includeInactive = false) {
  const { data } = await api.get('/mubil/ayarlar/kategoriler', {
    params: includeInactive ? { includeInactive: 1 } : {},
  });
  return data;
}

export async function createKategori(payload) {
  const { data } = await api.post('/mubil/ayarlar/kategoriler', payload);
  return data;
}

export async function updateKategori(id, payload) {
  const { data } = await api.patch(`/mubil/ayarlar/kategoriler/${id}`, payload);
  return data;
}

// ─── Türler ───
export async function fetchTurler({ kategoriId, includeInactive = false } = {}) {
  const params = {};
  if (kategoriId) params.kategoriId = kategoriId;
  if (includeInactive) params.includeInactive = 1;
  const { data } = await api.get('/mubil/ayarlar/turler', { params });
  return data;
}

export async function createTur(payload) {
  const { data } = await api.post('/mubil/ayarlar/turler', payload);
  return data;
}

export async function updateTur(id, payload) {
  const { data } = await api.patch(`/mubil/ayarlar/turler/${id}`, payload);
  return data;
}

// ─── Birimler ───
export async function fetchBirimler(includeInactive = false) {
  const { data } = await api.get('/mubil/ayarlar/birimler', {
    params: includeInactive ? { includeInactive: 1 } : {},
  });
  return data;
}

export async function createBirim(payload) {
  const { data } = await api.post('/mubil/ayarlar/birimler', payload);
  return data;
}

export async function updateBirim(id, payload) {
  const { data } = await api.patch(`/mubil/ayarlar/birimler/${id}`, payload);
  return data;
}

// ─── Lokasyonlar ───
export async function fetchLokasyonlar({ includeInactive = false, ilce } = {}) {
  const params = {};
  if (includeInactive) params.includeInactive = 1;
  if (ilce) params.ilce = ilce;
  const { data } = await api.get('/mubil/ayarlar/lokasyonlar', { params });
  return data;
}

export async function fetchLokasyonSecim(ilce = null) {
  const params = {};
  if (ilce) params.ilce = ilce;
  const { data } = await api.get('/mubil/ayarlar/lokasyonlar/secim', { params });
  return data;
}

export async function createLokasyon(payload) {
  const { data } = await api.post('/mubil/ayarlar/lokasyonlar', payload);
  return data;
}

export async function updateLokasyon(id, payload) {
  const { data } = await api.patch(`/mubil/ayarlar/lokasyonlar/${id}`, payload);
  return data;
}

export async function deleteLokasyon(id) {
  const { data } = await api.delete(`/mubil/ayarlar/lokasyonlar/${id}`);
  return data;
}

// ─── Mahalle autocomplete ───
export async function fetchMahalleler(ilce, q = '') {
  if (!ilce) return { kayitlar: [] };
  const { data } = await api.get('/mubil/ayarlar/mahalleler', {
    params: { ilce, q, limit: 20 },
  });
  return data;
}

// ─── Filtre ayarları ───
export async function fetchFiltreler() {
  const { data } = await api.get('/mubil/ayarlar/filtreler');
  return data;
}

export async function updateFiltre(anahtar, payload) {
  const { data } = await api.patch(`/mubil/ayarlar/filtreler/${anahtar}`, payload);
  return data;
}

// Public (master altında) — olay listesi UI'ı için
export async function fetchAktifFiltreler() {
  try {
    const { data } = await api.get('/mubil/master/filtreler-aktif');
    return data;
  } catch {
    return { kayitlar: [] };
  }
}
