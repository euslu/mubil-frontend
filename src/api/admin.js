import api from '../lib/api';

export async function fetchRoller() {
  const { data } = await api.get('/mubil/admin/roller');
  return data;
}

export async function fetchRol(username) {
  const { data } = await api.get(`/mubil/admin/roller/${encodeURIComponent(username)}`);
  return data;
}

export async function upsertRol(username, payload) {
  const { data } = await api.put(`/mubil/admin/roller/${encodeURIComponent(username)}`, payload);
  return data;
}

export async function deactivateRol(username) {
  const { data } = await api.delete(`/mubil/admin/roller/${encodeURIComponent(username)}`);
  return data;
}

export async function bulkAtama(payload) {
  const { data } = await api.post('/mubil/admin/roller/bulk', payload);
  return data;
}

export async function searchUsers(q, limit = 20) {
  if (!q || q.length < 2) return { kayitlar: [] };
  const { data } = await api.get('/mubil/admin/users/search', { params: { q, limit } });
  return data;
}

export async function fetchUsersByDepartment({ directorate, department }) {
  const { data } = await api.get('/mubil/admin/users/by-department', {
    params: { directorate, department },
  });
  return data;
}

export async function fetchDepartments() {
  const { data } = await api.get('/mubil/admin/departments');
  return data;
}
