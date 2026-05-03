import api from '../lib/api';

export async function fetchTalepler(params = {}) {
  const { data } = await api.get('/mubil/talep', { params });
  return data;
}

export async function fetchSonTalepler(limit = 5) {
  const { data } = await api.get('/mubil/talep/son', { params: { limit } });
  return data;
}

export async function fetchTalepOzet() {
  const { data } = await api.get('/mubil/talep/ozet/sayilar');
  return data;
}

export async function fetchTalep(id) {
  const { data } = await api.get(`/mubil/talep/${id}`);
  return data;
}

export async function createTalep(payload) {
  const { data } = await api.post('/mubil/talep', payload);
  return data;
}

export async function updateTalep(id, payload) {
  const { data } = await api.patch(`/mubil/talep/${id}`, payload);
  return data;
}

export async function deleteTalep(id) {
  const { data } = await api.delete(`/mubil/talep/${id}`);
  return data;
}
