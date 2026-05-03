// src/pages/Dashboard.jsx
// v12: Modüller grid'i kaldırıldı (sidebar'a taşındı). Anasayfa daha kompakt.

import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Database, Activity, AlertTriangle, Calendar,
  Loader2, ListPlus, Map,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDashboardOzet, fetchDashboardZamanSerisi } from '../api/dashboard.js';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import AralikToggle from '../components/dashboard/AralikToggle.jsx';
import ZamanSerisiChart from '../components/dashboard/ZamanSerisiChart.jsx';
import KategoriDagilim from '../components/dashboard/KategoriDagilim.jsx';

const HaritaInline = lazy(() => import('../components/dashboard/HaritaInline.jsx'));

function HaritaSkeleton() {
  return (
    <div className="card-mubil flex h-[440px] items-center justify-center text-sm text-slate-500">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Harita yükleniyor…
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [aralik, setAralik]   = useState('tum');
  const [ozet, setOzet]       = useState(null);
  const [seri, setSeri]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchDashboardOzet(aralik),
      fetchDashboardZamanSerisi(aralik, 'auto'),
    ])
      .then(([o, s]) => {
        if (cancelled) return;
        setOzet(o); setSeri(s);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.response?.data?.error || e.message || 'Veriler yüklenemedi');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [aralik]);

  return (
    <div className="space-y-6">
      {/* ÜST: Hoş geldiniz + hızlı eylem butonları */}
      <div className="card-mubil bg-gradient-to-br from-mubil-600 to-warning-600 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium uppercase tracking-wider text-white/80">Hoş geldiniz</div>
            <div className="mt-1 text-2xl font-semibold">{user?.displayName}</div>
            {user?.directorate && (
              <div className="mt-1 text-sm text-white/80">{user.directorate}</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/olay/yeni"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
            >
              <ListPlus className="h-4 w-4" />
              Yeni Olay
            </Link>
            <Link
              to="/harita"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
            >
              <Map className="h-4 w-4" />
              Harita
            </Link>
          </div>
        </div>
      </div>

      {/* Aralık + metrikler */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">Özet</h2>
        <AralikToggle value={aralik} onChange={setAralik} />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Toplam Kayıt" value={ozet?.toplam} icon={Database} loading={loading} />
        <MetricCard label="Aktif Olaylar" value={ozet?.aktif} icon={Activity}
          iconBg="bg-warning-500/10" iconText="text-warning-700" hint="Açık + Müdahalede" loading={loading} />
        <MetricCard label="Hasarlı Kayıt" value={ozet?.hasarli} icon={AlertTriangle}
          iconBg="bg-mubil-100" iconText="text-mubil-700" hint="Maddi/Araç/Can" loading={loading} />
        <MetricCard label="Bugün" value={ozet?.bugun} icon={Calendar}
          iconBg="bg-emerald-50" iconText="text-emerald-700" hint="Aralıktan bağımsız" loading={loading} />
      </div>

      {/* Harita */}
      <Suspense fallback={<HaritaSkeleton />}>
        <HaritaInline />
      </Suspense>

      {/* Grafikler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card-mubil">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900">Kayıt Yoğunluğu</h3>
            <span className="text-xs text-slate-400">
              {seri?.granularity === 'gun' ? 'Günlük' : 'Aylık'}
            </span>
          </div>
          <div className="mt-3">
            {loading && !seri ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />Yükleniyor…
              </div>
            ) : (
              <ZamanSerisiChart seri={seri?.seri} granularity={seri?.granularity} loading={false} />
            )}
          </div>
        </div>
        <KategoriDagilim aralik={aralik} />
      </div>

    </div>
  );
}
