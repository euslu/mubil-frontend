import api from '../lib/api';

export async function fetchLoglar(params = {}) {
  const { data } = await api.get('/mubil/log', { params });
  return data;
}

export async function fetchSonLoglar(limit = 10) {
  const { data } = await api.get('/mubil/log/son', { params: { limit } });
  return data;
}

export async function fetchHedefLoglar(tip, id) {
  const { data } = await api.get(`/mubil/log/hedef/${tip}/${id}`);
  return data;
}
