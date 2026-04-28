import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Camera, Building2 } from 'lucide-react';
import {
  formatTarih, formatSaat, formatSure,
  OLAY_TURU_LABEL, DURUM_LABEL, DURUM_BADGE_CLASS,
  HASAR_LABEL, HASAR_BADGE_CLASS,
} from '../../lib/olayLabels.js';

export default function OlayCards({ kayitlar }) {
  const navigate = useNavigate();

  if (!kayitlar || kayitlar.length === 0) {
    return (
      <div className="card-mubil py-12 text-center text-slate-500">
        Bu kriterlere uyan kayıt bulunamadı.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {kayitlar.map((o) => {
        const fotoSayisi = Array.isArray(o.fotograflar) ? o.fotograflar.length : 0;
        const ilkFoto = fotoSayisi > 0 ? o.fotograflar[0]?.url : null;
        const kategoriRenk = o.mudahaleKategori?.renk || '#DC2626';

        return (
          <div
            key={o.id}
            onClick={() => navigate(`/olay/${o.id}`)}
            className="card-mubil cursor-pointer overflow-hidden p-0 transition hover:border-mubil-300 hover:shadow-md"
          >
            {/* Foto banner */}
            {ilkFoto ? (
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                <img src={ilkFoto} alt="" className="h-full w-full object-cover" loading="lazy" />
                {fotoSayisi > 1 && (
                  <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white backdrop-blur">
                    <Camera className="h-3 w-3" />
                    +{fotoSayisi - 1}
                  </div>
                )}
                <div
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ backgroundColor: kategoriRenk }}
                />
              </div>
            ) : (
              <div
                className="h-1 w-full"
                style={{ backgroundColor: kategoriRenk }}
              />
            )}

            <div className="p-4">
              {/* Üst satır */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{o.ilce?.ad}</div>
                  <div className="text-xs text-slate-500">{o.mahalleLokasyon}</div>
                </div>
                <span className={DURUM_BADGE_CLASS[o.durum] || ''}>
                  {DURUM_LABEL[o.durum] || o.durum}
                </span>
              </div>

              {/* Müdahale */}
              <div className="mt-3">
                <div className="text-sm font-medium text-slate-900">{o.mudahaleKategori?.ad}</div>
                {o.mudahaleTur?.ad && (
                  <div className="text-xs text-slate-500">{o.mudahaleTur.ad}</div>
                )}
              </div>

              {/* Meta satırı */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {OLAY_TURU_LABEL[o.olayTuru] || o.olayTuru}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTarih(o.tarih)}
                  {o.baslangicSaati && ` · ${formatSaat(o.baslangicSaati)}`}
                </span>
                {o.mudahaleBirim?.kisaAd && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {o.mudahaleBirim.kisaAd}
                  </span>
                )}
                {o.sureDakika != null && (
                  <span className="text-slate-400">{formatSure(o.sureDakika)}</span>
                )}
              </div>

              {/* Hasar badge'i sadece YOK değilse göster */}
              {o.hasarDurumu && o.hasarDurumu !== 'YOK' && (
                <div className="mt-3">
                  <span className={HASAR_BADGE_CLASS[o.hasarDurumu] || ''}>
                    {HASAR_LABEL[o.hasarDurumu]}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
