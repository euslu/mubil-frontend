import { Link } from 'react-router-dom';
import { ListPlus, Map, BarChart3, Settings, Database, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const MODULLER = [
  { ad: 'Olay Kayıt',     aciklama: 'Yeni afet olayı kaydı oluştur',         ikon: ListPlus,   href: '/olay/yeni' },
  { ad: 'Olay Listesi',   aciklama: 'Geçmiş ve aktif olayları görüntüle',    ikon: Database,   href: '/olay' },
  { ad: 'Harita Görünümü',aciklama: 'Olayları ilçe bazında haritada gör',    ikon: Map,        yakinda: true },
  { ad: 'İstatistikler',  aciklama: 'Aylık ve ilçe bazlı raporlar',          ikon: BarChart3,  yakinda: true },
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

  return (
    <div className="space-y-6">
      <div className="card-mubil bg-gradient-to-br from-mubil-600 to-warning-600 text-white">
        <div className="text-sm font-medium uppercase tracking-wider text-white/80">Hoş geldiniz</div>
        <div className="mt-1 text-2xl font-semibold">{user?.displayName}</div>
        {user?.directorate && (
          <div className="mt-1 text-sm text-white/80">{user.directorate}</div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">Modüller</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULLER.map((m) => (
            m.href
              ? <Link key={m.ad} to={m.href} className="block"><ModulCard m={m} /></Link>
              : <div key={m.ad}><ModulCard m={m} /></div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        {`Olay kayıt ve liste modülleri aktiftir. Harita, raporlar ve yönetim
        modülleri sırasıyla devreye alınacaktır.`}
      </div>
    </div>
  );
}
