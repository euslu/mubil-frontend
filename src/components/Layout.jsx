import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ROL_ETIKET = {
  admin:         'Admin',
  daire_baskani: 'Daire Başkanı',
  sef:           'Şef',
  personel:      'Personel',
  user:          'Kullanıcı',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-mubil-600 to-warning-600">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight text-slate-900">MUBİL</div>
              <div className="text-[11px] leading-tight text-slate-500">Muğla Afet Bilgi Sistemi</div>
            </div>
          </Link>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mubil-100 text-mubil-700">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium text-slate-900">{user?.displayName || user?.username}</div>
                <div className="text-[11px] text-slate-500">{ROL_ETIKET[user?.mubilRole] || user?.mubilRole}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2">
                  <div className="text-sm font-medium text-slate-900">{user?.displayName}</div>
                  <div className="text-xs text-slate-500">{user?.username}</div>
                  {user?.directorate && (
                    <div className="mt-1 text-[11px] leading-snug text-slate-400">{user.directorate}</div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-mubil-700 hover:bg-mubil-50"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
