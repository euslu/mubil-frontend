// src/pages/ayarlar/sekmeler/FiltreYonetim.jsx

import { useEffect, useState } from 'react';
import {
  Loader2, AlertTriangle, RefreshCw, Eye, EyeOff, Filter,
} from 'lucide-react';
import { fetchFiltreler, updateFiltre } from '../../../api/ayarlar.js';

export default function FiltreYonetim() {
  const [kayitlar, setKayitlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchFiltreler();
      setKayitlar(r.kayitlar || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleAktif(f) {
    setBusy(true);
    try {
      await updateFiltre(f.anahtar, { aktif: !f.aktif });
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function siralamaDegistir(f, delta) {
    setBusy(true);
    try {
      await updateFiltre(f.anahtar, { sira: f.sira + delta });
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-mubil-600" />
          <span className="text-sm font-medium text-slate-700">Olay Listesi Filtreleri</span>
        </div>
        <button onClick={load} className="rounded-lg p-1.5 hover:bg-slate-100" title="Yenile">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Olay listesi sayfasında hangi filtre kontrollerinin görüneceğini buradan yönetebilirsiniz.
        Pasifleştirilen filtreler kullanıcılar için gizlenir. Bu ayar sistem geneli için geçerlidir
        (kullanıcı bazlı tercih değil).
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-mubil-card">
        <table className="w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2.5">Sıra</th>
              <th className="px-3 py-2.5">Filtre</th>
              <th className="px-3 py-2.5">Açıklama</th>
              <th className="px-3 py-2.5">Durum</th>
              <th className="px-3 py-2.5 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && kayitlar.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" /></td></tr>
            ) : kayitlar.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">
                Filtre tanımı yüklenemedi. Sayfayı yenileyin.
              </td></tr>
            ) : kayitlar.map((f, ix) => (
              <tr key={f.anahtar}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-slate-500">{f.sira}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => siralamaDegistir(f, -10)}
                        disabled={busy || ix === 0}
                        className="flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >▲</button>
                      <button
                        onClick={() => siralamaDegistir(f, 10)}
                        disabled={busy || ix === kayitlar.length - 1}
                        className="flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >▼</button>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className={f.aktif ? 'font-medium text-slate-900' : 'text-slate-400 line-through'}>
                    {f.etiket}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">{f.anahtar}</div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">{f.aciklama || '—'}</td>
                <td className="px-3 py-2">
                  <span className={f.aktif ? 'text-emerald-700' : 'text-slate-400'}>
                    {f.aktif ? '● Aktif' : '○ Pasif'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => toggleAktif(f)}
                      disabled={busy}
                      className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition ${
                        f.aktif
                          ? 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          : 'border border-mubil-200 bg-mubil-50 text-mubil-700 hover:bg-mubil-100'
                      }`}
                    >
                      {f.aktif ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {f.aktif ? 'Gizle' : 'Göster'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Filtreler değiştirildikten sonra olay listesi sayfasını yenileyin (F5) — frontend
        cache 60 saniyede bir tazelenir.
      </p>
    </div>
  );
}
