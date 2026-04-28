import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import {
  formatTarih, formatSaat, formatSure,
  OLAY_TURU_LABEL, DURUM_LABEL, DURUM_BADGE_CLASS,
  HASAR_LABEL, HASAR_BADGE_CLASS,
} from '../../lib/olayLabels.js';

export default function OlayTable({ kayitlar }) {
  const navigate = useNavigate();

  if (!kayitlar || kayitlar.length === 0) {
    return (
      <div className="card-mubil py-12 text-center text-slate-500">
        Bu kriterlere uyan kayıt bulunamadı.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-mubil-card">
      <table className="w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left">
          <tr className="text-xs font-medium uppercase tracking-wider text-slate-500">
            <th className="px-3 py-2.5">Tarih</th>
            <th className="px-3 py-2.5">İlçe / Mahalle</th>
            <th className="px-3 py-2.5">Olay</th>
            <th className="px-3 py-2.5">Müdahale</th>
            <th className="px-3 py-2.5">Birim</th>
            <th className="px-3 py-2.5">Süre</th>
            <th className="px-3 py-2.5">Durum</th>
            <th className="px-3 py-2.5">Hasar</th>
            <th className="px-3 py-2.5">Foto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {kayitlar.map((o) => {
            const fotoSayisi = Array.isArray(o.fotograflar) ? o.fotograflar.length : 0;
            return (
              <tr
                key={o.id}
                onClick={() => navigate(`/olay/${o.id}`)}
                className="cursor-pointer transition hover:bg-mubil-50/40"
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                  <div className="font-medium">{formatTarih(o.tarih)}</div>
                  {o.baslangicSaati && (
                    <div className="text-xs text-slate-500">{formatSaat(o.baslangicSaati)}</div>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="font-medium text-slate-900">{o.ilce?.ad}</div>
                  <div className="text-xs text-slate-500">{o.mahalleLokasyon}</div>
                </td>
                <td className="px-3 py-2.5 text-slate-700">
                  {OLAY_TURU_LABEL[o.olayTuru] || o.olayTuru}
                </td>
                <td className="px-3 py-2.5">
                  <div className="text-slate-900">{o.mudahaleKategori?.ad}</div>
                  {o.mudahaleTur?.ad && (
                    <div className="text-xs text-slate-500">{o.mudahaleTur.ad}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-slate-700">
                  {o.mudahaleBirim?.kisaAd || o.mudahaleBirim?.ad || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                  {formatSure(o.sureDakika)}
                </td>
                <td className="px-3 py-2.5">
                  <span className={DURUM_BADGE_CLASS[o.durum] || ''}>
                    {DURUM_LABEL[o.durum] || o.durum}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={HASAR_BADGE_CLASS[o.hasarDurumu] || ''}>
                    {HASAR_LABEL[o.hasarDurumu] || o.hasarDurumu}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-500">
                  {fotoSayisi > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      {fotoSayisi}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
