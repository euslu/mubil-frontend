// src/components/LokasyonSecici.jsx
// Olay kayıt formuna entegrasyon. Kullanıcı kayıtlı bir POI seçince
// lat/lng + ilçe + mahalle otomatik dolar.
//
// Kullanımı:
//   <LokasyonSecici
//     ilce={form.ilce}        // mevcut ilçe ile filtreler
//     onPick={(loc) => {
//       setForm({
//         ...form,
//         ilce: loc.ilce || form.ilce,
//         mahalle: loc.mahalle || '',
//         lat: loc.lat,
//         lng: loc.lng,
//       });
//     }}
//   />

import { useEffect, useState } from 'react';
import { MapPin, ChevronDown, X, Loader2 } from 'lucide-react';
import { fetchLokasyonSecim } from '../api/ayarlar.js';

export default function LokasyonSecici({ ilce, onPick, secili }) {
  const [open, setOpen]       = useState(false);
  const [kayitlar, setKayitlar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [arama, setArama]     = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLokasyonSecim(ilce)
      .then((d) => {
        if (cancelled) return;
        setKayitlar(d.kayitlar || []);
      })
      .catch(() => { if (!cancelled) setKayitlar([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ilce, open]);

  const filtered = arama
    ? kayitlar.filter(k => {
        const q = arama.toLocaleLowerCase('tr');
        return (k.ad || '').toLocaleLowerCase('tr').includes(q)
            || (k.mahalle || '').toLocaleLowerCase('tr').includes(q)
            || (k.ilce || '').toLocaleLowerCase('tr').includes(q);
      })
    : kayitlar;

  if (kayitlar.length === 0 && !loading && !open) return null; // hiç POI yoksa gösterme

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <MapPin className="h-4 w-4 text-mubil-600" />
        Kayıtlı Lokasyon Seç
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <input
                type="text"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder={`${kayitlar.length} kayıt — arama yapın`}
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-mubil-300 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-4 text-xs text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor…
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {arama ? `"${arama}" için kayıt yok` : 'Kayıtlı lokasyon yok'}
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {filtered.map(loc => (
                    <li key={loc.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onPick?.(loc);
                          setOpen(false);
                          setArama('');
                        }}
                        className="flex w-full items-start gap-2 p-2 text-left transition hover:bg-mubil-50"
                      >
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {loc.ad}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {[loc.ilce, loc.mahalle].filter(Boolean).join(' / ') || '—'}
                          </div>
                          {loc.adres && (
                            <div className="truncate text-[11px] text-slate-400">
                              {loc.adres}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
