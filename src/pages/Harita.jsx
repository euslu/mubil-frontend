import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertTriangle, MapPin, Eye } from 'lucide-react';

import { useMaster } from '../hooks/useMaster.js';
import { fetchMapKayitlar } from '../api/olay.js';
import HaritaFiltreleri, { HARITA_EMPTY_FILTERS } from '../components/olay/HaritaFiltreleri.jsx';
import { MUGLA_CENTER, MUGLA_ZOOM, resolveKayitKoord } from '../lib/ilceCoords.js';
import {
  OLAY_TURU_LABEL, DURUM_LABEL,
  formatTarih,
} from '../lib/olayLabels.js';

// Leaflet'in default marker icon'u Vite'la sorun çıkarır — biz CircleMarker kullanıyoruz
// ama yine de güvenli tarafta ikonu manuel sıfırlayalım
delete L.Icon.Default.prototype._getIconUrl;

// Kategori → renk fallback (master'da renk yoksa)
const DEFAULT_KATEGORI_RENK = '#DC2626';

// Bbox: Muğla sınırları (kabaca)
const MUGLA_BOUNDS = [
  [36.30, 27.20], // güneybatı
  [37.55, 29.40], // kuzeydoğu
];

function HaritaIcerik({ kayitlar }) {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(MUGLA_BOUNDS);
    map.options.minZoom = 8;
  }, [map]);

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={60}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
    >
      {kayitlar.map((k) => {
        const kk = resolveKayitKoord(k);
        if (!kk) return null;

        const renk = k.mudahaleKategori?.renk || DEFAULT_KATEGORI_RENK;
        const opacity = kk.approximate ? 0.45 : 0.95;
        const radius  = kk.approximate ? 6 : 8;

        return (
          <CircleMarker
            key={k.id}
            center={[kk.enlem, kk.boylam]}
            radius={radius}
            pathOptions={{
              color: renk,
              fillColor: renk,
              fillOpacity: opacity,
              opacity: opacity,
              weight: 1.5,
            }}
          >
            <Popup closeButton>
              <div className="text-sm">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Kayıt #{k.id}
                </div>
                <div className="mt-0.5 font-semibold text-slate-900">
                  {k.mudahaleKategori?.ad}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  <strong>{k.ilce?.ad}</strong>{' · '}{k.mahalleLokasyon}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                    {OLAY_TURU_LABEL[k.olayTuru] || k.olayTuru}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                    {formatTarih(k.tarih)}
                  </span>
                  {k.durum && k.durum !== 'TAMAMLANDI' && (
                    <span className="rounded bg-mubil-50 px-1.5 py-0.5 font-medium text-mubil-700">
                      {DURUM_LABEL[k.durum] || k.durum}
                    </span>
                  )}
                </div>
                {kk.approximate && (
                  <div className="mt-1 text-[10px] italic text-slate-400">
                    Yaklaşık konum (ilçe merkezi)
                  </div>
                )}
                <a
                  href={`/olay/${k.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-mubil-600 hover:underline"
                >
                  <Eye className="h-3 w-3" />
                  Detayı Gör
                </a>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MarkerClusterGroup>
  );
}

function KategoriLegend({ kategoriler }) {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] max-w-[260px] rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-md backdrop-blur">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Kategori
      </div>
      <div className="space-y-1">
        {kategoriler.map((k) => (
          <div key={k.id} className="flex items-center gap-2">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: k.renk || DEFAULT_KATEGORI_RENK }}
            />
            <span className="truncate text-slate-700">{k.ad}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] text-slate-400">
        {`Şeffaf marker'lar yaklaşık konumdur (ilçe merkezi)`}
      </div>
    </div>
  );
}

function IstatistikKarti({ toplam, gercek, yaklasik, aktif }) {
  return (
    <div className="absolute right-4 top-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-xs shadow-md backdrop-blur">
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-slate-500">Toplam: </span>
          <strong className="text-slate-900">{toplam}</strong>
        </div>
        <div>
          <span className="text-slate-500">Gerçek konum: </span>
          <strong className="text-emerald-700">{gercek}</strong>
        </div>
        <div>
          <span className="text-slate-500">Yaklaşık: </span>
          <strong className="text-slate-600">{yaklasik}</strong>
        </div>
        {aktif > 0 && (
          <div className="border-t border-slate-200 pt-1">
            <span className="text-slate-500">Aktif: </span>
            <strong className="text-mubil-700">{aktif}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Harita() {
  const { ilceler, kategoriler, loading: masterLoading, error: masterError } = useMaster();

  const [filters, setFilters] = useState(HARITA_EMPTY_FILTERS);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMapKayitlar(filters)
      .then((r) => { if (!cancelled) setData(r); })
      .catch((e) => { if (!cancelled) setError(e?.response?.data?.error || e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.ilceId, filters.kategoriId,
    filters.olayTuru, filters.durum, filters.hasarDurumu,
    filters.tarihBas, filters.tarihSon,
  ]);

  // İstatistikler
  const stats = useMemo(() => {
    if (!data?.kayitlar) return { toplam: 0, gercek: 0, yaklasik: 0, aktif: 0 };
    let gercek = 0, yaklasik = 0, aktif = 0, mappedToplam = 0;
    for (const k of data.kayitlar) {
      const kk = resolveKayitKoord(k);
      if (!kk) continue;
      mappedToplam++;
      if (kk.approximate) yaklasik++;
      else gercek++;
      if (k.durum === 'ACIK' || k.durum === 'MUDAHALEDE') aktif++;
    }
    return { toplam: mappedToplam, gercek, yaklasik, aktif };
  }, [data]);

  if (masterLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Veriler yükleniyor…
      </div>
    );
  }
  if (masterError) {
    return (
      <div className="rounded-lg border border-mubil-200 bg-mubil-50 p-4 text-mubil-800">
        Master veriler yüklenemedi: {masterError}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Harita Görünümü</h1>
          <p className="text-sm text-slate-500">
            <MapPin className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
            Olayları konum bazında haritada görüntüleyin
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <HaritaFiltreleri
        filters={filters}
        setFilters={setFilters}
        ilceler={ilceler}
        kategoriler={kategoriler}
      />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Harita */}
      <div className="relative h-[calc(100vh-280px)] min-h-[500px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-mubil-card">
        {loading && (
          <div className="absolute right-4 top-4 z-[1001] flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm text-slate-700 shadow-md">
            <Loader2 className="h-4 w-4 animate-spin" />
            Yükleniyor…
          </div>
        )}

        <MapContainer
          center={MUGLA_CENTER}
          zoom={MUGLA_ZOOM}
          minZoom={8}
          maxBounds={MUGLA_BOUNDS}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {data?.kayitlar?.length > 0 && (
            <HaritaIcerik kayitlar={data.kayitlar} />
          )}
        </MapContainer>

        {/* Üzerlik bilgi kartları */}
        <KategoriLegend kategoriler={kategoriler} />
        {data && <IstatistikKarti {...stats} />}
      </div>

      <div className="text-xs text-slate-400">
        Haritada gösterilen kayıt sayısı maksimum 5000 ile sınırlıdır.
        Daha fazla kayıt için tarih veya ilçe filtresi kullanın.
      </div>
    </div>
  );
}
