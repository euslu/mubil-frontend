import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Upload, ShieldCheck } from 'lucide-react';
import RollerListesi from '../../components/yonetim/RollerListesi.jsx';
import TekAtamaForm from '../../components/yonetim/TekAtamaForm.jsx';
import TopluAtamaForm from '../../components/yonetim/TopluAtamaForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../../lib/rolLabels.jsx';

const TABS = [
  { key: 'liste', label: 'Yetkili Kullanıcılar', icon: Users },
  { key: 'tek',   label: 'Tek Atama',            icon: UserPlus },
  { key: 'toplu', label: 'Toplu Atama',          icon: Upload },
];

export default function YetkiYonetimi() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('liste');
  const [refreshKey, setRefreshKey] = useState(0);

  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  if (myLevel < ROL_SEVIYE.mudur) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-mubil-600" />
          <h1 className="text-xl font-semibold text-slate-900">Yetki Yönetimi</h1>
        </div>
        <p className="text-sm text-slate-500">
          MUBİL erişim yetkilerini yönetin. Atayabileceğiniz rolleri kendi
          yetki seviyenize göre görürsünüz.
        </p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-2 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition ${
                  active ? 'border-mubil-600 text-mubil-700' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}>
                <Icon className="h-4 w-4" />{t.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="card-mubil">
        {tab === 'liste' && <RollerListesi refreshKey={refreshKey} onChanged={() => setRefreshKey(k => k + 1)} />}
        {tab === 'tek'   && <TekAtamaForm onSuccess={() => setRefreshKey(k => k + 1)} />}
        {tab === 'toplu' && <TopluAtamaForm onSuccess={() => setRefreshKey(k => k + 1)} />}
      </div>
    </div>
  );
}
