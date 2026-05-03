import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Layout from './components/Layout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

const OlayKayit     = lazy(() => import('./pages/olay/OlayKayit.jsx'));
const OlayListesi   = lazy(() => import('./pages/olay/OlayListesi.jsx'));
const OlayDetay     = lazy(() => import('./pages/olay/OlayDetay.jsx'));
const Harita        = lazy(() => import('./pages/Harita.jsx'));
const YetkiYonetimi = lazy(() => import('./pages/yonetim/YetkiYonetimi.jsx'));

// v10
const TalepListesi  = lazy(() => import('./pages/talepler/TalepListesi.jsx'));
const TalepKayit    = lazy(() => import('./pages/talepler/TalepKayit.jsx'));
const TalepDetay    = lazy(() => import('./pages/talepler/TalepDetay.jsx'));
const IslemGecmisi  = lazy(() => import('./pages/IslemGecmisi.jsx'));

// v11
const Ayarlar       = lazy(() => import('./pages/ayarlar/Ayarlar.jsx'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Yükleniyor…
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/olay" element={<Suspense fallback={<PageLoader />}><OlayListesi /></Suspense>} />
        <Route path="/olay/yeni" element={<Suspense fallback={<PageLoader />}><OlayKayit /></Suspense>} />
        <Route path="/olay/:id" element={<Suspense fallback={<PageLoader />}><OlayDetay /></Suspense>} />
        <Route path="/olay/:id/duzenle" element={<Suspense fallback={<PageLoader />}><OlayKayit /></Suspense>} />

        <Route path="/harita" element={<Suspense fallback={<PageLoader />}><Harita /></Suspense>} />

        <Route path="/talepler" element={<Suspense fallback={<PageLoader />}><TalepListesi /></Suspense>} />
        <Route path="/talepler/yeni" element={<Suspense fallback={<PageLoader />}><TalepKayit /></Suspense>} />
        <Route path="/talepler/:id" element={<Suspense fallback={<PageLoader />}><TalepDetay /></Suspense>} />

        <Route path="/islem-gecmisi" element={<Suspense fallback={<PageLoader />}><IslemGecmisi /></Suspense>} />

        <Route
          path="/yonetim/yetkiler"
          element={
            <PrivateRoute minRole="mudur">
              <Suspense fallback={<PageLoader />}><YetkiYonetimi /></Suspense>
            </PrivateRoute>
          }
        />

        {/* v11 */}
        <Route
          path="/ayarlar"
          element={
            <PrivateRoute minRole="mudur">
              <Suspense fallback={<PageLoader />}><Ayarlar /></Suspense>
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
