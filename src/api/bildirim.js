import api from '../lib/api';

export async function fetchBildirimAyar() {
  const { data } = await api.get('/mubil/bildirim/ayar');
  return data;
}

export async function updateBildirimAyar(payload) {
  const { data } = await api.put('/mubil/bildirim/ayar', payload);
  return data;
}

export async function fetchBildirimGonderim(params = {}) {
  const { data } = await api.get('/mubil/bildirim/gonderim', { params });
  return data;
}

export async function fetchBildirimOzet() {
  const { data } = await api.get('/mubil/bildirim/ozet');
  return data;
}

export async function testBildirim(payload) {
  const { data } = await api.post('/mubil/bildirim/test', payload);
  return data;
}
