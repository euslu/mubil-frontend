// src/components/dashboard/LeafletInline.jsx
// HaritaInline'ın lazy-loaded gerçek render component'i.
// Leaflet ve react-leaflet sadece bu chunk'ta olur.

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { ILCE_KOORDINATLARI, jitterCoord } from '../../lib/ilceCoords.js';

// Kategori renkleri (Harita.jsx ile aynı paletten)
const KATEGORI_RENK = {
  'Yol Temizlik ve Trafik Güvenliği': '#DC2626',
  'Su Baskınları ve Drenaj':           '#2563EB',
  'Ağaç ve Yeşil Alan':                '#059669',
  'Yapısal Hasar':                     '#D97706',
  'Diğer':                             '#64748B',
};
function renkBul(kategoriAd) {
  if (!kategoriAd) return '#64748B';
  for (const [k, v] of Object.entries(KATEGORI_RENK)) {
    if (kategoriAd.includes(k)) return v;
  }
  return '#64748B';
}

// Muğla merkez koordinatları
const MERKEZ = [37.21, 28.36];
const ZOOM   = 9;

export default function LeafletInline({ olaylar = [] }) {
  return (
    <MapContainer
      center={MERKEZ}
      zoom={ZOOM}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      <MarkerClusterGroup chunkedLoading>
        {olaylar.map((o) => {
          // Koordinat: gerçek varsa kullan, yoksa ilçe merkezi + jitter
          let lat = Number(o.enlem);
          let lng = Number(o.boylam);
          let approx = false;
          const ilceAd = o.ilce?.ad || o.ilce;

          if (!lat || !lng) {
            const c = ILCE_KOORDINATLARI[ilceAd];
            if (!c) return null;
            const j = jitterCoord(c.enlem, c.boylam, o.id || 0);
            lat = j.enlem;
            lng = j.boylam;
            approx = true;
          }

          const kategoriAd = o.mudahaleKategori?.ad || o.kategoriAd;
          const renk = renkBul(kategoriAd);

          return (
            <CircleMarker
              key={o.id}
              center={[lat, lng]}
              radius={6}
              pathOptions={{
                color: renk,
                fillColor: renk,
                fillOpacity: approx ? 0.45 : 0.95,
                weight: 1,
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <div className="font-medium">
                    {ilceAd || '—'} / {o.mahalle || '—'}
                  </div>
                  <div className="text-slate-600">
                    {kategoriAd || 'Kategori yok'}
                  </div>
                  {o.tarih && (
                    <div className="text-slate-400">
                      {new Date(o.tarih).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
