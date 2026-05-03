// src/pages/IslemGecmisi.jsx — tam işlem geçmişi sayfası

import { useEffect, useState } from 'react';
import {
  History, Loader2, AlertTriangle, RefreshCw, Filter,
} from 'lucide-react';
import { fetchLoglar } from '../api/log.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../lib/rolLabels.jsx';

const ISLEM_OPSIYON = [
  { value: '',                       label: 'Tüm işlemler' },
  { value: 'olay_olustur',           label: 'Olay Oluşturma' },
  { value: 'olay_guncelle',          label: 'Olay Güncelleme' },
  { value: 'olay_sil',               label: 'Olay Silme' },
  { value: 'olay_durum_degistir',    label: 'Olay Durum Değişikliği' },
  { value: 'rol_ata',                label: 'Rol Atama' },
  { value: 'rol_kaldir',             label: 'Rol Kaldırma' },
  { value: 'rol_bulk_atama',         label: 'Toplu Rol Ataması' },
  { value: 'talep_olustur',          label: 'Talep Oluşturma' },
  { value: 'talep_durum_degistir',   label: 'Talep Durum Değişikliği' },
];

export default function IslemGecmisi() {
  const { user } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  const isMudur = myLevel >= ROL_SEVIYE.mudur;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const [filtre, setFiltre] = useState({
    islem: '',
    username: '',
    from: '',
    to: '',
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, pageSize: 50 };
      if (filtre.islem)    params.islem = filtre.islem;
      if (filtre.username && isMudur) params.username = filtre.username;
      if (filtre.from)     params.from = filtre.from;
      if (filtre.to)       params.to = filtre.to;
      const r = await fetchLoglar(params);
      setData(r);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, filtre]);

  const kapsamMetni = (() => {
    if (myLevel >= ROL_SEVIYE.admin) return 'Tüm sistem geneli görüntüleniyor';
    if (myLevel === ROL_SEVIYE.daire_baskani) return 'Daire başkanlığınız geneli';
    if (myLevel === ROL_SEVIYE.mudur) return 'Departmanınız geneli';
    return 'Kendi işlemleriniz';
  })();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-mubil-600" />
          <h1 className="text-xl font-semibold text-slate-900">İşlem Geçmişi</h1>
        </div>
        <p className="text-sm text-slate-500">{kapsamMetni}</p>
      </div>

      {/* Filtreler */}
      <div className="card-mubil">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">İşlem Tipi</label>
            <select
              value={filtre.islem}
              onChange={(e) => { setFiltre({ ...filtre, islem: e.target.value }); setPage(1); }}
              className="input-mubil bg-white py-1.5 text-sm"
            >
              {ISLEM_OPSIYON.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {isMudur && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Kullanıcı</label>
              <input
                type="text"
                value={filtre.username}
                onChange={(e) => { setFiltre({ ...filtre, username: e.target.value }); }}
                onBlur={() => setPage(1)}
                placeholder="username"
                className="input-mubil py-1.5 text-sm"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Başlangıç</label>
            <input
              type="date"
              value={filtre.from}
              onChange={(e) => { setFiltre({ ...filtre, from: e.target.value }); setPage(1); }}
              className="input-mubil py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Bitiş</label>
            <input
              type="date"
              value={filtre.to}
              onChange={(e) => { setFiltre({ ...filtre, to: e.target.value }); setPage(1); }}
              className="input-mubil py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">{data ? `${data.toplam} kayıt` : '…'}</span>
          <button onClick={load} className="rounded-lg p-1.5 hover:bg-slate-100" title="Yenile">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tablo */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Yükleniyor…
        </div>
      ) : data?.kayitlar?.length === 0 ? (
        <div className="card-mubil flex h-32 items-center justify-center text-slate-400">
          Bu filtrelerle eşleşen kayıt yok
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-mubil-card">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left">
              <tr className="text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2.5">Tarih</th>
                <th className="px-3 py-2.5">Kullanıcı</th>
                <th className="px-3 py-2.5">İşlem</th>
                <th className="px-3 py-2.5">Açıklama</th>
                <th className="px-3 py-2.5">Hedef</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.kayitlar?.map(l => (
                <tr key={l.id}>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(l.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-slate-900">{l.displayName || l.username}</div>
                    {l.department && <div className="text-xs text-slate-400">{l.department}</div>}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {l.islemEtiket}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-700">{l.aciklama}</td>
                  <td className="px-3 py-2 text-xs font-mono text-slate-500">
                    {l.hedefTip && l.hedefId ? `${l.hedefTip}#${l.hedefId}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.toplam > 50 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Sayfa {page} / {Math.ceil(data.toplam / 50)}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-mubil-secondary disabled:opacity-50">Önceki</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= data.toplam}
              className="btn-mubil-secondary disabled:opacity-50">Sonraki</button>
          </div>
        </div>
      )}
    </div>
  );
}
