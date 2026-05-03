// src/components/dashboard/HaritaInline.jsx
// Anasayfada gömülü, küçük (380px) harita. "Tam ekran" linki var.
// Mevcut Harita.jsx'ten ayrılmış basitleştirilmiş versiyon.
//
// NOT: Bu component lazy import edilir (App.jsx'te değil, Dashboard'da).
// Harita kütüphaneleri (Leaflet) ana bundle'a sızmaz.

import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

// Recharts ve Leaflet gibi heavy deps lazy chunk'ta
const LeafletInline = lazy(() => import('./LeafletInline.jsx'));

function PlaceLoader({ message = 'Harita yükleniyor…' }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm text-slate-500">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {message}
    </div>
  );
}

export default function HaritaInline() {
  const [olaylar, setOlaylar] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/mubil/olay/map')
      .then(({ data }) => {
        if (cancelled) return;
        setOlaylar(data?.kayitlar || data || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.response?.data?.error || e.message || 'Harita verisi alınamadı');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="card-mubil p-0 overflow-hidden">
      {/* Üst başlık + tam ekran linki */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div>
          <h3 className="text-sm font-medium text-slate-900">Olay Haritası</h3>
          <p className="text-xs text-slate-500">
            {olaylar ? `${olaylar.length} kayıt` : '…'} · Muğla geneli
          </p>
        </div>
        <Link
          to="/harita"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          title="Haritayı tam ekran aç"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Tam Ekran
        </Link>
      </div>

      {/* Harita alanı */}
      <div className="relative" style={{ height: 380 }}>
        {error ? (
          <div className="flex h-full items-center justify-center p-4 text-sm text-mubil-700">
            <AlertTriangle className="mr-2 h-4 w-4" />
            {error}
          </div>
        ) : olaylar === null ? (
          <PlaceLoader />
        ) : olaylar.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Haritada gösterilecek kayıt yok
          </div>
        ) : (
          <Suspense fallback={<PlaceLoader />}>
            <LeafletInline olaylar={olaylar} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
