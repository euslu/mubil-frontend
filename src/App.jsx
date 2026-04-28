import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import OlayKayit   from './pages/olay/OlayKayit.jsx';
import OlayListesi from './pages/olay/OlayListesi.jsx';
import OlayDetay   from './pages/olay/OlayDetay.jsx';
import Layout from './components/Layout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/"                  element={<Dashboard />} />
        <Route path="/olay"              element={<OlayListesi />} />
        <Route path="/olay/yeni"         element={<OlayKayit />} />
        <Route path="/olay/:id"          element={<OlayDetay />} />
        <Route path="/olay/:id/duzenle"  element={<OlayKayit />} />
        {/* İleride:
            <Route path="/harita"   element={<Harita />} />
            <Route path="/raporlar" element={<Raporlar />} />
            <Route path="/yonetim"  element={<PrivateRoute minRole="sef"><Yonetim/></PrivateRoute>} />
        */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
