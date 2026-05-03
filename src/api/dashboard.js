import api from '../lib/api';

export async function fetchDashboardOzet(aralik = 'tum') {
  const { data } = await api.get('/mubil/dashboard/ozet', { params: { aralik } });
  return data;
}

export async function fetchDashboardZamanSerisi(aralik = 'tum', granularity = 'auto') {
  const { data } = await api.get('/mubil/dashboard/zaman-serisi', {
    params: { aralik, granularity },
  });
  return data;
}

export async function fetchKategoriDagilim(aralik = 'tum', kategoriId = null) {
  const params = { aralik };
  if (kategoriId != null) params.kategoriId = kategoriId;
  const { data } = await api.get('/mubil/dashboard/kategori-dagilim', { params });
  return data;
}
