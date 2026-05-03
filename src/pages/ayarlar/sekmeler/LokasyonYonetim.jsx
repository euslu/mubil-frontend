// src/pages/ayarlar/sekmeler/LokasyonYonetim.jsx

import { useEffect, useState } from 'react';
import {
  Loader2, AlertTriangle, Plus, Pencil, Check, X, RefreshCw,
  Eye, EyeOff, Trash2, MapPin,
} from 'lucide-react';
import {
  fetchLokasyonlar, createLokasyon, updateLokasyon, deleteLokasyon,
} from '../../../api/ayarlar.js';
import MahalleAutocomplete from '../../../components/MahalleAutocomplete.jsx';

// Ortak ilçe listesi
const ILCELER = [
  'Bodrum','Datça','Fethiye','Kavaklıdere','Köyceğiz','Marmaris','Menteşe',
  'Milas','Ortaca','Seydikemer','Ula','Yatağan','Dalaman',
];

const VARSAYILAN_FORM = {
  ad: '', aciklama: '', ilce: '', mahalle: '', adres: '',
  lat: '', lng: '', etiketler: '',
};

export default function LokasyonYonetim() {
  const [kayitlar, setKayitlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [yeni, setYeni] = useState(null); // { ...VARSAYILAN_FORM }
  const [silOnay, setSilOnay] = useState(null);
  const [showInactive, setShowInactive] = useState(true);
  const [filterIlce, setFilterIlce] = useState('');
  const [arama, setArama] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchLokasyonlar({ includeInactive: true });
      setKayitlar(r.kayitlar || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openYeni() {
    setYeni({ ...VARSAYILAN_FORM });
    setError(null);
  }

  async function saveYeni() {
    if (!yeni.ad || yeni.ad.trim().length < 2) return setError('Lokasyon adı en az 2 karakter');
    const lat = Number(yeni.lat);
    const lng = Number(yeni.lng);
    if (!lat || !lng) return setError('Lat/lng zorunlu');

    setBusy(true);
    try {
      await createLokasyon({
        ad: yeni.ad,
        aciklama: yeni.aciklama || null,
        ilce: yeni.ilce || null,
        mahalle: yeni.mahalle || null,
        adres: yeni.adres || null,
        lat, lng,
        etiketler: yeni.etiketler ? yeni.etiketler.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      setYeni(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editing.ad || editing.ad.trim().length < 2) return setError('Lokasyon adı en az 2 karakter');
    const lat = Number(editing.lat);
    const lng = Number(editing.lng);

    setBusy(true);
    try {
      await updateLokasyon(editing.id, {
        ad: editing.ad,
        aciklama: editing.aciklama,
        ilce: editing.ilce,
        mahalle: editing.mahalle,
        adres: editing.adres,
        lat, lng,
        etiketler: typeof editing.etiketler === 'string'
          ? editing.etiketler.split(',').map(s => s.trim()).filter(Boolean)
          : editing.etiketler,
      });
      setEditing(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleAktif(loc) {
    setBusy(true);
    try {
      await updateLokasyon(loc.id, { aktif: !loc.aktif });
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!silOnay) return;
    setBusy(true);
    try {
      await deleteLokasyon(silOnay.id);
      setSilOnay(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  let filtered = showInactive ? kayitlar : kayitlar.filter(l => l.aktif);
  if (filterIlce) filtered = filtered.filter(l => l.ilce === filterIlce);
  if (arama) {
    const q = arama.toLocaleLowerCase('tr');
    filtered = filtered.filter(l =>
      (l.ad || '').toLocaleLowerCase('tr').includes(q) ||
      (l.adres || '').toLocaleLowerCase('tr').includes(q) ||
      (l.mahalle || '').toLocaleLowerCase('tr').includes(q)
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openYeni} disabled={!!yeni} className="btn-mubil-primary text-sm">
            <Plus className="h-4 w-4" />
            Yeni Lokasyon
          </button>
          <select value={filterIlce} onChange={(e) => setFilterIlce(e.target.value)} className="input-mubil bg-white py-1.5 text-sm">
            <option value="">Tüm ilçeler</option>
            {ILCELER.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Ara…"
            className="input-mubil py-1.5 text-sm sm:max-w-xs"
          />
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

      {/* Yeni form (popover) */}
      {yeni && (
        <div className="card-mubil border-mubil-200 bg-mubil-50/30">
          <h3 className="mb-3 text-sm font-medium text-slate-900">Yeni Lokasyon</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Ad *</label>
              <input type="text" value={yeni.ad}
                onChange={(e) => setYeni({ ...yeni, ad: e.target.value })}
                placeholder="Örn: Marmaris Marina" autoFocus
                className="input-mubil py-1.5 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">İlçe / Mahalle</label>
              <div className="flex gap-2">
                <select value={yeni.ilce} onChange={(e) => setYeni({ ...yeni, ilce: e.target.value, mahalle: '' })} className="input-mubil bg-white py-1.5 text-sm w-1/2">
                  <option value="">İlçe seçiniz</option>
                  {ILCELER.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <div className="w-1/2">
                  <MahalleAutocomplete
                    ilce={yeni.ilce}
                    value={yeni.mahalle}
                    onChange={(v) => setYeni({ ...yeni, mahalle: v })}
                    placeholder="Mahalle adı"
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Adres / Açıklama</label>
              <input type="text" value={yeni.adres}
                onChange={(e) => setYeni({ ...yeni, adres: e.target.value })}
                placeholder="Açık adres veya tarif"
                className="input-mubil py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Enlem (lat) *</label>
              <input type="number" step="any" value={yeni.lat}
                onChange={(e) => setYeni({ ...yeni, lat: e.target.value })}
                placeholder="36.8550"
                className="input-mubil py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Boylam (lng) *</label>
              <input type="number" step="any" value={yeni.lng}
                onChange={(e) => setYeni({ ...yeni, lng: e.target.value })}
                placeholder="28.2738"
                className="input-mubil py-1.5 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Etiketler (virgülle ayır)</label>
              <input type="text" value={yeni.etiketler}
                onChange={(e) => setYeni({ ...yeni, etiketler: e.target.value })}
                placeholder="liman, turistik"
                className="input-mubil py-1.5 text-sm" />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setYeni(null)} className="btn-mubil-secondary text-sm">Vazgeç</button>
            <button onClick={saveYeni} disabled={busy} className="btn-mubil-primary text-sm">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-mubil-card">
        <table className="w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2.5">Ad</th>
              <th className="px-3 py-2.5">Konum</th>
              <th className="px-3 py-2.5">Koordinat</th>
              <th className="px-3 py-2.5">Durum</th>
              <th className="px-3 py-2.5 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-slate-400">
                <MapPin className="mx-auto mb-2 h-8 w-8 opacity-40" />
                Lokasyon yok
              </td></tr>
            ) : filtered.map(loc => {
              const isEdit = editing?.id === loc.id;
              return (
                <tr key={loc.id} className={isEdit ? 'bg-mubil-50/40' : ''}>
                  <td className="px-3 py-2">
                    {isEdit ? (
                      <input type="text" value={editing.ad}
                        onChange={(e) => setEditing({ ...editing, ad: e.target.value })}
                        className="input-mubil py-1.5 text-sm" />
                    ) : (
                      <div>
                        <div className={loc.aktif ? 'font-medium text-slate-900' : 'text-slate-400 line-through'}>
                          {loc.ad}
                        </div>
                        {loc.adres && <div className="text-xs text-slate-500">{loc.adres}</div>}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {isEdit ? (
                      <div className="flex gap-1">
                        <select value={editing.ilce || ''}
                          onChange={(e) => setEditing({ ...editing, ilce: e.target.value, mahalle: '' })}
                          className="input-mubil bg-white py-1.5 text-xs w-1/2">
                          <option value="">İlçe</option>
                          {ILCELER.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                        <div className="w-1/2">
                          <MahalleAutocomplete
                            ilce={editing.ilce}
                            value={editing.mahalle || ''}
                            onChange={(v) => setEditing({ ...editing, mahalle: v })}
                            placeholder="Mahalle"
                          />
                        </div>
                      </div>
                    ) : (
                      [loc.ilce, loc.mahalle].filter(Boolean).join(' / ') || '—'
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    {isEdit ? (
                      <div className="flex gap-1">
                        <input type="number" step="any" value={editing.lat || ''}
                          onChange={(e) => setEditing({ ...editing, lat: e.target.value })}
                          className="input-mubil py-1.5 text-xs w-24" />
                        <input type="number" step="any" value={editing.lng || ''}
                          onChange={(e) => setEditing({ ...editing, lng: e.target.value })}
                          className="input-mubil py-1.5 text-xs w-24" />
                      </div>
                    ) : (
                      `${loc.lat?.toFixed(4)}, ${loc.lng?.toFixed(4)}`
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={loc.aktif ? 'text-emerald-700' : 'text-slate-400'}>
                      {loc.aktif ? '● Aktif' : '○ Pasif'}
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
                            onClick={() => setEditing({
                              ...loc,
                              etiketler: (loc.etiketler || []).join(', '),
                            })}
                            className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                            title="Düzenle"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleAktif(loc)}
                            disabled={busy}
                            className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                            title={loc.aktif ? 'Pasifleştir' : 'Aktifleştir'}
                          >
                            {loc.aktif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setSilOnay(loc)}
                            className="flex h-8 w-8 items-center justify-center rounded text-mubil-700 hover:bg-mubil-50"
                            title="Sil (kalıcı)"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Sil onay modal */}
      {silOnay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => !busy && setSilOnay(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mubil-100 text-mubil-700">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Lokasyonu sil</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    <strong>{silOnay.ad}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <button onClick={() => setSilOnay(null)} disabled={busy} className="btn-mubil-secondary">Vazgeç</button>
              <button onClick={confirmDelete} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-mubil-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-mubil-700 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Lokasyonlar olay kayıt formunda dropdown'dan seçilince koordinat otomatik dolar.
        Pasifleştirilen lokasyonlar dropdown'da gözükmez ama silinmemiş olur — istenirse
        tekrar aktifleştirilebilir.
      </p>
    </div>
  );
}
