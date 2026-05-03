// src/pages/talepler/TalepListesi.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, Plus, Loader2, AlertTriangle, RefreshCw, Filter,
} from 'lucide-react';
import { fetchTalepler } from '../../api/talep.js';
import { TipBadge, OncelikBadge, DurumBadge, TIP_ETIKET, ONCELIK_ETIKET, DURUM_ETIKET } from '../../lib/talepLabels.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../../lib/rolLabels.jsx';

export default function TalepListesi() {
  const { user } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  const isMudur = myLevel >= ROL_SEVIYE.mudur;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);

  const [filtre, setFiltre] = useState({
    durum: '',
    tip: '',
    oncelik: '',
    kendi: !isMudur, // personel için zaten backend zorunluyor
  });
  const [filtreOpen, setFiltreOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, pageSize: 25 };
      if (filtre.durum)   params.durum = filtre.durum;
      if (filtre.tip)     params.tip = filtre.tip;
      if (filtre.oncelik) params.oncelik = filtre.oncelik;
      if (filtre.kendi)   params.kendi = '1';
      const r = await fetchTalepler(params);
      setData(r);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, filtre]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-mubil-600" />
            <h1 className="text-xl font-semibold text-slate-900">Geliştirme Talepleri</h1>
          </div>
          <p className="text-sm text-slate-500">Hata bildir veya yeni özellik iste</p>
        </div>
        <Link to="/talepler/yeni" className="btn-mubil-primary">
          <Plus className="h-4 w-4" />
          Yeni Talep
        </Link>
      </div>

      {/* Filtre satırı */}
      <div className="card-mubil">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setFiltreOpen(o => !o)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" />
            Filtreler
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {data && <span>{data.toplam} kayıt</span>}
            <button onClick={load} className="rounded-lg p-1.5 hover:bg-slate-100" title="Yenile">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {filtreOpen && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Durum</label>
              <select
                value={filtre.durum}
                onChange={(e) => { setFiltre({ ...filtre, durum: e.target.value }); setPage(1); }}
                className="input-mubil bg-white py-1.5 text-sm"
              >
                <option value="">Hepsi</option>
                {Object.entries(DURUM_ETIKET).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Tip</label>
              <select
                value={filtre.tip}
                onChange={(e) => { setFiltre({ ...filtre, tip: e.target.value }); setPage(1); }}
                className="input-mubil bg-white py-1.5 text-sm"
              >
                <option value="">Hepsi</option>
                {Object.entries(TIP_ETIKET).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Öncelik</label>
              <select
                value={filtre.oncelik}
                onChange={(e) => { setFiltre({ ...filtre, oncelik: e.target.value }); setPage(1); }}
                className="input-mubil bg-white py-1.5 text-sm"
              >
                <option value="">Hepsi</option>
                {Object.entries(ONCELIK_ETIKET).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {isMudur && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Kapsam</label>
                <label className="flex items-center gap-2 pt-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={filtre.kendi}
                    onChange={(e) => { setFiltre({ ...filtre, kendi: e.target.checked }); setPage(1); }}
                    className="h-4 w-4 rounded border-slate-300 text-mubil-600 focus:ring-mubil-500"
                  />
                  Sadece kendim
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Liste */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Yükleniyor…
        </div>
      ) : data?.kayitlar?.length === 0 ? (
        <div className="card-mubil flex h-48 items-center justify-center text-slate-400">
          Bu filtrelerle eşleşen talep yok
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-mubil-card">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left">
              <tr className="text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Başlık</th>
                <th className="px-3 py-2.5">Tip</th>
                <th className="px-3 py-2.5">Öncelik</th>
                <th className="px-3 py-2.5">Durum</th>
                <th className="px-3 py-2.5">Açan</th>
                <th className="px-3 py-2.5">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.kayitlar?.map(t => (
                <tr key={t.id} className="cursor-pointer transition hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                    <Link to={`/talepler/${t.id}`}>#{t.id}</Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link to={`/talepler/${t.id}`} className="font-medium text-slate-900 hover:text-mubil-700">
                      {t.baslik}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5"><TipBadge tip={t.tip} /></td>
                  <td className="px-3 py-2.5"><OncelikBadge oncelik={t.oncelik} /></td>
                  <td className="px-3 py-2.5"><DurumBadge durum={t.durum} /></td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {t.olusturanDisplayName || t.olusturanUsername}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.toplam > 25 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Sayfa {page} / {Math.ceil(data.toplam / 25)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-mubil-secondary disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 25 >= data.toplam}
              className="btn-mubil-secondary disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
