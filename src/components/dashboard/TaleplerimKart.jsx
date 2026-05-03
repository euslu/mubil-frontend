// src/components/dashboard/TaleplerimKart.jsx
// Anasayfada "Geliştirme Talepleri" kartı:
// - Son 5 talep
// - Hızlı özet (açık / yeni / tamamlandı)
// - "Yeni Talep" ve "Tümü" butonları

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Plus, ArrowRight, Loader2, Bug, Sparkles, Wrench } from 'lucide-react';
import { fetchSonTalepler, fetchTalepOzet } from '../../api/talep.js';
import { TipBadge, DurumBadge, TIP_ETIKET } from '../../lib/talepLabels.jsx';

const TIP_ICON = {
  bug:          Bug,
  feature:      Sparkles,
  iyilestirme:  Wrench,
};

export default function TaleplerimKart() {
  const [talepler, setTalepler] = useState(null);
  const [ozet, setOzet]         = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchSonTalepler(5),
      fetchTalepOzet(),
    ])
      .then(([t, o]) => {
        if (cancelled) return;
        setTalepler(t.kayitlar || []);
        setOzet(o);
      })
      .catch(() => {
        if (cancelled) return;
        setTalepler([]);
        setOzet({ acik: 0, yeni: 0, tamamlandi: 0 });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="card-mubil flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-mubil-600" />
            <h3 className="font-medium text-slate-900">Geliştirme Talepleri</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Hata bildir veya yeni özellik iste</p>
        </div>
        <Link
          to="/talepler/yeni"
          className="inline-flex items-center gap-1.5 rounded-lg bg-mubil-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-mubil-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </Link>
      </div>

      {/* Mini özet */}
      {ozet && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-blue-50 p-2">
            <div className="text-lg font-semibold text-blue-700">{ozet.yeni}</div>
            <div className="text-[10px] uppercase tracking-wider text-blue-700/70">Yeni</div>
          </div>
          <div className="rounded-lg bg-warning-500/10 p-2">
            <div className="text-lg font-semibold text-warning-700">{ozet.acik}</div>
            <div className="text-[10px] uppercase tracking-wider text-warning-700/70">Açık</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <div className="text-lg font-semibold text-emerald-700">{ozet.tamamlandi}</div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-700/70">Bitti</div>
          </div>
        </div>
      )}

      {/* Son 5 talep */}
      <div className="mt-3 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-xs text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Yükleniyor…
          </div>
        ) : talepler?.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-500">Henüz talebiniz yok</p>
            <Link
              to="/talepler/yeni"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-mubil-700 hover:underline"
            >
              İlk talebinizi oluşturun
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {talepler.map(t => {
              const Icon = TIP_ICON[t.tip] || Wrench;
              return (
                <li key={t.id}>
                  <Link
                    to={`/talepler/${t.id}`}
                    className="flex items-start gap-2 py-2 transition hover:bg-slate-50/50"
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {t.baslik}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <DurumBadge durum={t.durum} />
                        <span className="text-[10px] text-slate-400">
                          #{t.id} · {TIP_ETIKET[t.tip]}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Tümünü gör */}
      <Link
        to="/talepler"
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Tüm Taleplerim
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
