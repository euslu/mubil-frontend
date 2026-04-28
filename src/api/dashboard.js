import api from '../lib/api';

export async function fetchDashboardOzet(aralik = 'tum') {
  const { data } = await api.get('/mubil/dashboard/ozet', { params: { aralik } });
  return data; // { aralik, toplam, aktif, hasarli, bugun }
}

export async function fetchDashboardZamanSerisi(aralik = 'tum', granularity = 'auto') {
  const { data } = await api.get('/mubil/dashboard/zaman-serisi', {
    params: { aralik, granularity },
  });
  return data; // { aralik, granularity, seri: [{tarih, sayi}] }
}
