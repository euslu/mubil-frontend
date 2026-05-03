// src/pages/ayarlar/Ayarlar.jsx
// Ayarlar sayfası — kategori, tür, birim, lokasyon, filtre yönetimi.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Tag, Layers, Building, MapPin, Filter, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../../lib/rolLabels.jsx';
import KategoriYonetim from './sekmeler/KategoriYonetim.jsx';
import TurYonetim from './sekmeler/TurYonetim.jsx';
import BirimYonetim from './sekmeler/BirimYonetim.jsx';
import LokasyonYonetim from './sekmeler/LokasyonYonetim.jsx';
import FiltreYonetim from './sekmeler/FiltreYonetim.jsx';
import BildirimYonetim from './sekmeler/BildirimYonetim.jsx';

const TABS = [
  { key: 'kategori',  label: 'Kategoriler',    icon: Tag },
  { key: 'tur',       label: 'Olay Türleri',   icon: Layers },
  { key: 'birim',     label: 'Birimler',       icon: Building },
  { key: 'lokasyon',  label: 'Lokasyonlar',    icon: MapPin },
  { key: 'filtre',    label: 'Filtreler',      icon: Filter },
  { key: 'bildirim',  label: 'Bildirimler',    icon: Bell },
];

export default function Ayarlar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('kategori');

  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  if (myLevel < ROL_SEVIYE.mudur) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-mubil-600" />
          <h1 className="text-xl font-semibold text-slate-900">Ayarlar</h1>
        </div>
        <p className="text-sm text-slate-500">
          Olay türleri, birimler, lokasyonlar ve filtre ayarları.
          Silme işlemi yoktur — kullanılmayan kayıtlar pasifleştirilebilir.
        </p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'border-mubil-600 text-mubil-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {tab === 'kategori' && <KategoriYonetim />}
        {tab === 'tur'      && <TurYonetim />}
        {tab === 'birim'    && <BirimYonetim />}
        {tab === 'lokasyon' && <LokasyonYonetim />}
        {tab === 'filtre'   && <FiltreYonetim />}
        {tab === 'bildirim' && <BildirimYonetim />}
      </div>
    </div>
  );
}
