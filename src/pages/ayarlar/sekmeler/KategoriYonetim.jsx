// src/pages/ayarlar/sekmeler/KategoriYonetim.jsx

import { useEffect, useState } from 'react';
import {
  Loader2, AlertTriangle, Plus, Pencil, Check, X, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { fetchKategoriler, createKategori, updateKategori } from '../../../api/ayarlar.js';

export default function KategoriYonetim() {
  const [kayitlar, setKayitlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null); // {id, ad, aciklama}
  const [yeni, setYeni] = useState(null); // null | {ad, aciklama}
  const [showInactive, setShowInactive] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchKategoriler(true); // hep hepsi (UI'da filtreleyeceğiz)
      setKayitlar(r.kayitlar || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveYeni() {
    if (!yeni?.ad || yeni.ad.trim().length < 2) return setError('Kategori adı en az 2 karakter');
    setBusy(true);
    try {
      await createKategori({ ad: yeni.ad, aciklama: yeni.aciklama });
      setYeni(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editing?.ad || editing.ad.trim().length < 2) return setError('Kategori adı en az 2 karakter');
    setBusy(true);
    try {
      await updateKategori(editing.id, { ad: editing.ad, aciklama: editing.aciklama });
      setEditing(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleAktif(k) {
    setBusy(true);
    try {
      await updateKategori(k.id, { aktif: !k.aktif });
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  const filtered = showInactive ? kayitlar : kayitlar.filter(k => k.aktif);

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYeni({ ad: '', aciklama: '' })}
            disabled={!!yeni}
            className="btn-mubil-primary text-sm"
          >
            <Plus className="h-4 w-4" />
            Yeni Kategori
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-mubil-600 focus:ring-mubil-500"
            />
            Pasifleri göster
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{filtered.length} / {kayitlar.length}</span>
          <button onClick={load} className="rounded-lg p-1.5 hover:bg-slate-100" title="Yenile">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-mubil-card">
        <table className="w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2.5">Ad</th>
              <th className="px-3 py-2.5">Açıklama</th>
              <th className="px-3 py-2.5">Durum</th>
              <th className="px-3 py-2.5 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Yeni satır */}
            {yeni && (
              <tr className="bg-mubil-50/40">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    autoFocus
                    value={yeni.ad}
                    onChange={(e) => setYeni({ ...yeni, ad: e.target.value })}
                    placeholder="Kategori adı"
                    className="input-mubil py-1.5 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={yeni.aciklama}
                    onChange={(e) => setYeni({ ...yeni, aciklama: e.target.value })}
                    placeholder="Açıklama (opsiyonel)"
                    className="input-mubil py-1.5 text-sm"
                  />
                </td>
                <td className="px-3 py-2 text-emerald-700">● Aktif</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button onClick={saveYeni} disabled={busy} className="flex h-8 w-8 items-center justify-center rounded text-emerald-700 hover:bg-emerald-50">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setYeni(null)} className="flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {loading && filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-500">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">Kayıt yok</td></tr>
            ) : filtered.map(k => {
              const isEdit = editing?.id === k.id;
              return (
                <tr key={k.id} className={isEdit ? 'bg-mubil-50/40' : ''}>
                  <td className="px-3 py-2">
                    {isEdit ? (
                      <input
                        type="text"
                        value={editing.ad}
                        onChange={(e) => setEditing({ ...editing, ad: e.target.value })}
                        className="input-mubil py-1.5 text-sm"
                      />
                    ) : (
                      <span className={k.aktif ? 'font-medium text-slate-900' : 'text-slate-400 line-through'}>
                        {k.ad}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {isEdit ? (
                      <input
                        type="text"
                        value={editing.aciklama || ''}
                        onChange={(e) => setEditing({ ...editing, aciklama: e.target.value })}
                        className="input-mubil py-1.5 text-sm"
                      />
                    ) : (
                      k.aciklama || '—'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={k.aktif ? 'text-emerald-700' : 'text-slate-400'}>
                      {k.aktif ? '● Aktif' : '○ Pasif'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {isEdit ? (
                        <>
                          <button onClick={saveEdit} disabled={busy} className="flex h-8 w-8 items-center justify-center rounded text-emerald-700 hover:bg-emerald-50">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button onClick={() => setEditing(null)} className="flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditing({ id: k.id, ad: k.ad, aciklama: k.aciklama || '' })}
                            className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                            title="Düzenle"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleAktif(k)}
                            disabled={busy}
                            className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                            title={k.aktif ? 'Pasifleştir' : 'Aktifleştir'}
                          >
                            {k.aktif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Pasifleştirilen kategori, yeni olay kayıtlarında görünmez. Mevcut olaylarda
        kategori bilgisi korunur.
      </p>
    </div>
  );
}
