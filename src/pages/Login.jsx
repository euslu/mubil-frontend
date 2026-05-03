import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const next     = params.get('next') || '/';
  const errParam = params.get('error');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(
    errParam === 'no_access'
      ? 'MUBİL erişim yetkiniz bulunmuyor. Afet İşleri ve Risk Yönetimi Daire Başkanlığı ile iletişime geçin.'
      : '',
  );

  // Zaten girişli ve mubilAccess varsa dashboard'a at
  useEffect(() => {
    if (ready && user?.mubilAccess) navigate(next, { replace: true });
  }, [ready, user, next, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Giriş başarısız';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      {/* SOL PANEL — marka, kırmızı/turuncu gradient */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-mubil-700 via-mubil-600 to-warning-600 p-8 text-white lg:w-1/2 lg:p-12">
        {/* Dekoratif blur lekeleri */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/mugla-logo.svg" alt="Muğla Büyükşehir Belediyesi" className="h-12 w-12 drop-shadow-md" />
          <div className="text-sm font-medium uppercase tracking-wider text-white/80">
            Muğla Büyükşehir Belediyesi
          </div>
        </div>

        <div className="relative z-10 mt-12 lg:mt-0">
          <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
            MUBİL
          </h1>
          <p className="mt-2 text-xl font-light text-white/90 lg:text-2xl">
            Muğla Afet Bilgi Sistemi
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80">
            Afet ve risk yönetiminde sahadan gelen bilgileri tek noktada toplar,
            kategorize eder, müdahale eden birimlerle koordineli takibi sağlar.
          </p>
        </div>

        <div className="relative z-10 mt-12 text-xs text-white/60 lg:mt-0">
          Afet İşleri ve Risk Yönetimi Daire Başkanlığı · {new Date().getFullYear()}
        </div>
      </div>

      {/* SAĞ PANEL — login formu */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-slate-900">Sisteme Giriş</h2>
          <p className="mt-1 text-sm text-slate-500">
            Muğla BB kurumsal hesabınız ile giriş yapabilirsiniz.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-mubil"
                placeholder="ad.soyad"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-mubil"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-mubil-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Giriş yapılıyor…
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Sorun yaşıyorsanız Bilgi İşlem Daire Başkanlığı ile iletişime geçin.
          </p>
        </div>
      </div>
    </div>
  );
}
