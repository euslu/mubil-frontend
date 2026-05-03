// src/components/dashboard/IslemGecmisiKart.jsx
// Anasayfada "İşlem Geçmişi" kartı — kullanıcının son işlemleri timeline.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History, ArrowRight, Loader2,
  Plus, PenLine, Trash2, UserCog, FileEdit, FilePlus,
} from 'lucide-react';
import { fetchSonLoglar } from '../../api/log.js';

const ISLEM_ICON = {
  olay_olustur:        Plus,
  olay_guncelle:       PenLine,
  olay_sil:            Trash2,
  olay_durum_degistir: PenLine,
  rol_ata:             UserCog,
  rol_kaldir:          UserCog,
  rol_bulk_atama:      UserCog,
  talep_olustur:       FilePlus,
  talep_durum_degistir: FileEdit,
};

const ISLEM_RENK = {
  olay_olustur:        'text-emerald-600 bg-emerald-50',
  olay_guncelle:       'text-blue-600 bg-blue-50',
  olay_sil:            'text-mubil-600 bg-mubil-50',
  olay_durum_degistir: 'text-amber-600 bg-amber-50',
  rol_ata:             'text-violet-600 bg-violet-50',
  rol_kaldir:          'text-mubil-600 bg-mubil-50',
  rol_bulk_atama:      'text-violet-600 bg-violet-50',
  talep_olustur:       'text-emerald-600 bg-emerald-50',
  talep_durum_degistir: 'text-blue-600 bg-blue-50',
};

function relTime(date) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'şimdi';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} gün önce`;
  return d.toLocaleDateString('tr-TR');
}

export default function IslemGecmisiKart() {
  const [loglar, setLoglar]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSonLoglar(8)
      .then((r) => {
        if (cancelled) return;
        setLoglar(r.kayitlar || []);
      })
      .catch(() => { if (!cancelled) setLoglar([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="card-mubil flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-mubil-600" />
            <h3 className="font-medium text-slate-900">İşlem Geçmişi</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">MUBİL üzerindeki son işlemleriniz</p>
        </div>
      </div>

      <div className="mt-3 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-xs text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Yükleniyor…
          </div>
        ) : loglar?.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-slate-500">Henüz işlem kaydınız yok</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {loglar.map(l => {
              const Icon = ISLEM_ICON[l.islem] || PenLine;
              const renk = ISLEM_RENK[l.islem] || 'text-slate-600 bg-slate-100';
              return (
                <li key={l.id} className="flex items-start gap-2.5">
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${renk}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-900">{l.aciklama}</div>
                    <div className="text-[11px] text-slate-400">
                      {l.islemEtiket} · {relTime(l.createdAt)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link
        to="/islem-gecmisi"
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Tüm Geçmiş
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
