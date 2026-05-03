// src/components/Sidebar.jsx
// Sol taraf navigasyon. Desktop'ta sabit, mobile'da overlay.

import { NavLink } from 'react-router-dom';
import {
  Home, ListPlus, Database, Map, Inbox, History,
  UserCog, SlidersHorizontal, BarChart3, X, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../lib/rolLabels.jsx';

const ANA_MODULLER = [
  { ad: 'Anasayfa',      aciklama: 'Özet ve istatistikler',       ikon: Home,     href: '/',          end: true, renk: 'bg-slate-100 text-slate-600' },
  { ad: 'Olay Kayıt',    aciklama: 'Yeni afet olayı oluştur',     ikon: ListPlus, href: '/olay/yeni', renk: 'bg-emerald-50 text-emerald-600' },
  { ad: 'Olay Listesi',  aciklama: 'Geçmiş ve aktif olaylar',     ikon: Database, href: '/olay',      end: true, renk: 'bg-blue-50 text-blue-600' },
  { ad: 'Harita',        aciklama: 'Olayları haritada görüntüle',  ikon: Map,      href: '/harita',    renk: 'bg-violet-50 text-violet-600' },
  { ad: 'Talepler',      aciklama: 'Geliştirme talepleri',         ikon: Inbox,    href: '/talepler',  renk: 'bg-amber-50 text-amber-600' },
  { ad: 'İşlem Geçmişi', aciklama: 'Sistem log kayıtları',        ikon: History,  href: '/islem-gecmisi', renk: 'bg-cyan-50 text-cyan-600' },
];

const YONETIM_MODULLER = [
  { ad: 'Raporlar',       aciklama: 'Kategori ve birim raporları', ikon: BarChart3,         disabled: true, rozet: 'Yakında', renk: 'bg-slate-100 text-slate-400' },
  { ad: 'Yetki Yönetimi', aciklama: 'Roller ve toplu atama',      ikon: UserCog,           href: '/yonetim/yetkiler', minRole: 'mudur', renk: 'bg-rose-50 text-rose-600' },
  { ad: 'Ayarlar',        aciklama: 'Türler, birimler, filtreler', ikon: SlidersHorizontal, href: '/ayarlar',          minRole: 'mudur', renk: 'bg-orange-50 text-orange-600' },
];

function NavItem({ modul, onNavigate }) {
  const Icon = modul.ikon;

  if (modul.disabled) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 opacity-60">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${modul.renk}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">{modul.ad}</span>
            {modul.rozet && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                {modul.rozet}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 truncate">{modul.aciklama}</div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={modul.href}
      end={!!modul.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
          isActive
            ? 'bg-mubil-50 ring-1 ring-mubil-200'
            : 'hover:bg-slate-50'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isActive ? 'bg-mubil-100 text-mubil-700' : modul.renk
          }`}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${isActive ? 'text-mubil-700' : 'text-slate-800'}`}>
              {modul.ad}
            </div>
            <div className={`text-xs truncate ${isActive ? 'text-mubil-500' : 'text-slate-400'}`}>
              {modul.aciklama}
            </div>
          </div>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;

  const yonetimGoster = YONETIM_MODULLER.filter(m => {
    if (!m.minRole) return true;
    const need = ROL_SEVIYE[m.minRole] || 0;
    return myLevel >= need;
  });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:inset-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3">
            <img src="/mugla-logo.svg" alt="MBB" className="h-10 w-10" />
            <div className="leading-tight">
              <div className="text-base font-bold text-slate-900">MUBİL</div>
              <div className="text-[11px] text-slate-500">Muğla Afet Bilgi Sistemi</div>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Ana Menü
          </div>
          <div className="space-y-1">
            {ANA_MODULLER.map((m) => (
              <NavItem key={m.ad} modul={m} onNavigate={onClose} />
            ))}
          </div>

          {yonetimGoster.length > 0 && (
            <>
              <div className="my-4 border-t border-slate-100" />
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Yönetim
              </div>
              <div className="space-y-1">
                {yonetimGoster.map((m) => (
                  <NavItem key={m.ad} modul={m} onNavigate={onClose} />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Alt: kullanıcı kartı */}
        {user && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mubil-100 text-sm font-bold text-mubil-700">
                {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {user.displayName || user.username}
                </div>
                {user.directorate && (
                  <div className="truncate text-xs text-slate-500">{user.directorate}</div>
                )}
                {user.mubilRole && (
                  <div className="mt-1 inline-block rounded-md bg-mubil-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-mubil-700">
                    {user.mubilRole}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
