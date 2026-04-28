import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database, Activity, AlertTriangle, Calendar,
  ListPlus, Map, BarChart3, Settings, Clock, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDashboardOzet, fetchDashboardZamanSerisi, fetchIlceDagilimi } from '../api/dashboard.js';
import MetricCard from '../components/dashboard/MetricCard.jsx';
import AralikToggle from '../components/dashboard/AralikToggle.jsx';
import ZamanSerisiChart from '../components/dashboard/ZamanSerisiChart.jsx';
import IlcePieChart from '../components/dashboard/IlcePieChart.jsx';

const MODULLER = [
  { ad: 'Olay Kayıt',     aciklama: 'Yeni afet olayı kaydı oluştur',         ikon: ListPlus,   href: '/olay/yeni' },
  { ad: 'Olay Listesi',   aciklama: 'Geçmiş ve aktif olayları görüntüle',    ikon: Database,   href: '/olay' },
  { ad: 'Harita Görünümü',aciklama: 'Olayları konum bazında haritada gör',   ikon: Map,        href: '/harita' },
  { ad: 'Raporlar',       aciklama: 'Kategori, birim ve hasar raporları',    ikon: BarChart3,  yakinda: true },
  { ad: 'Geçmiş Veriler', aciklama: '2025-2026 tarihsel kayıtlar',           ikon: Clock,      href: '/olay?eski=1' },
  { ad: 'Yönetim',        aciklama: 'Kullanıcı, kategori, birim',            ikon: Settings,   yakinda: true, minRole: 'sef' },
];

function ModulCard({ m }) {
  const Icon = m.ikon;
  const interactive = !!m.href;
  return (
    <div className={`card-mubil transition ${interactive ? 'cursor-pointer border-slate-200 hover:border-mubil-300 hover:shadow-md' : 'cursor-not-allowed opacity-70 hover:opacity-100'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${interactive ? 'bg-mubil-100 text-mubil-700' : 'bg-mubil-50 text-mubil-700'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{m.ad}</span>
            {m.yakinda && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-700">
                Yakında
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{m.aciklama}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [aralik, setAralik] = useState('90g');

  const [ozet,    setOzet]    = useState(null);
  const [seri,    setSeri]    = useState(null);
  const [ilceDag, setIlceDag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchDashboardOzet(aralik),
      fetchDashboardZamanSerisi(aralik, 'auto'),
      fetchIlceDagilimi(aralik),
    ])
      .then(([o, s, d]) => {
        if (cancelled) return;
        setOzet(o);
        setSeri(s);
        setIlceDag(d);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.response?.data?.error || e.message || 'Veriler yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [aralik]);

  return (
    <div className="space-y-6">
      {/* Hoş geldin kartı */}
      <div className="card-mubil bg-gradient-to-br from-mubil-600 to-warning-600 text-white">
        <div className="text-sm font-medium uppercase tracking-wider text-white/80">Hoş geldiniz</div>
        <div className="mt-1 text-2xl font-semibold">{user?.displayName}</div>
        {user?.directorate && (
          <div className="mt-1 text-sm text-white/80">{user.directorate}</div>
        )}
      </div>

      {/* Aralık toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Özet
        </h2>
        <AralikToggle value={aralik} onChange={setAralik} />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrik kartları */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Toplam Kayıt"
          value={ozet?.toplam}
          icon={Database}
          loading={loading}
        />
        <MetricCard
          label="Aktif Olaylar"
          value={ozet?.aktif}
          icon={Activity}
          iconBg="bg-warning-500/10"
          iconText="text-warning-700"
          hint="Açık + Müdahalede"
          loading={loading}
        />
        <MetricCard
          label="Hasarlı Kayıt"
          value={ozet?.hasarli}
          icon={AlertTriangle}
          iconBg="bg-mubil-100"
          iconText="text-mubil-700"
          hint="Maddi/Araç/Can"
          loading={loading}
        />
        <MetricCard
          label="Bugün"
          value={ozet?.bugun}
          icon={Calendar}
          iconBg="bg-emerald-50"
          iconText="text-emerald-700"
          hint="Aralıktan bağımsız"
          loading={loading}
        />
      </div>

      {/* Zaman serisi */}
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
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Yükleniyor…
            </div>
          ) : (
            <ZamanSerisiChart
              seri={seri?.seri}
              granularity={seri?.granularity}
              loading={false}
            />
          )}
        </div>
      </div>

      {/* İlçe dağılımı pie chart */}
      <div className="card-mubil">
        <h3 className="font-medium text-slate-900">İlçe Dağılımı</h3>
        <div className="mt-3">
          {loading && !ilceDag ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Yükleniyor…
            </div>
          ) : (
            <IlcePieChart
              dagilim={ilceDag?.dagilim}
              loading={false}
            />
          )}
        </div>
      </div>

      {/* Modüller */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">
          Modüller
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULLER.map((m) => (
            m.href
              ? <Link key={m.ad} to={m.href} className="block"><ModulCard m={m} /></Link>
              : <div key={m.ad}><ModulCard m={m} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}
