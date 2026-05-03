// src/components/Layout.jsx
// Ana layout: solda sidebar, sağda main content + topbar.

import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Bell, AlertTriangle, Activity } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDashboardOzet } from '../api/dashboard.js';

function AktifOlayBadge() {
  const [aktif, setAktif] = useState(0);
  const [hasarli, setHasarli] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    fetchDashboardOzet('tum')
      .then(d => { setAktif(d.aktif || 0); setHasarli(d.hasarli || 0); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, [load]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hasAlert = aktif > 0;
  const hasHasar = hasarli > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition ${
          hasAlert
            ? 'text-mubil-700 hover:bg-mubil-50'
            : 'text-slate-500 hover:bg-slate-100'
        }`}
        title={`${aktif} aktif olay`}
      >
        <Bell className={`h-5 w-5 ${hasAlert ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`} />
        {hasAlert && (
          <span className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
            hasHasar ? 'bg-red-500' : 'bg-mubil-600'
          }`}>
            {aktif > 99 ? '99+' : aktif}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Aktif Olaylar</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                hasAlert ? 'bg-mubil-100 text-mubil-700' : 'bg-slate-100 text-slate-400'
              }`}>
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{aktif}</div>
                <div className="text-xs text-slate-500">Acik + Mudahalede</div>
              </div>
            </div>

            {hasHasar && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span><strong>{hasarli}</strong> hasarli olay mevcut</span>
              </div>
            )}

            {!hasAlert && (
              <div className="text-center text-sm text-slate-400 py-2">
                Aktif olay bulunmuyor
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5">
            <button
              onClick={() => { setOpen(false); navigate('/olaylar'); }}
              className="w-full rounded-lg bg-mubil-50 px-3 py-2 text-center text-sm font-medium text-mubil-700 transition hover:bg-mubil-100"
            >
              Tum olaylari gor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:pl-0">
        {/* TopBar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <AktifOlayBadge />
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900">
                {user?.displayName || user?.username}
              </div>
              {user?.department && (
                <div className="text-xs text-slate-500">{user.department}</div>
              )}
            </div>
            <button
              onClick={logout}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              title="Çıkış yap"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
