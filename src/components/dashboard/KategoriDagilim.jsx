// src/components/dashboard/KategoriDagilim.jsx
// Kategori bazlı bar chart, tıklayınca drilldown ile alt türlere iner.
// Recharts lazy chunk'ta zaten (ZamanSerisiChart ile aynı bundle).

import { useEffect, useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { fetchKategoriDagilim } from '../../api/dashboard.js';
import KategoriDagilimChart from './KategoriDagilimChart.jsx';

export default function KategoriDagilim({ aralik = 'tum' }) {
  const [data, setData]       = useState(null);
  const [drillKat, setDrillKat] = useState(null); // { id, ad }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  async function load(kategoriId = null) {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchKategoriDagilim(aralik, kategoriId);
      setData(r);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  // Aralık değişirse yeniden yükle, drilldown'dan çık
  useEffect(() => {
    setDrillKat(null);
    load(null);
  }, [aralik]);

  function handleBarClick(item) {
    if (data?.mode !== 'kategori') return;
    setDrillKat({ id: item.kategoriId, ad: item.kategoriAd });
    load(item.kategoriId);
  }

  function exitDrill() {
    setDrillKat(null);
    load(null);
  }

  return (
    <div className="card-mubil">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {drillKat && (
            <button
              onClick={exitDrill}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
              title="Geri"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h3 className="font-medium text-slate-900">
              {drillKat ? `${drillKat.ad} — Alt Türler` : 'Olay Türleri Dağılımı'}
            </h3>
            <p className="text-xs text-slate-500">
              {drillKat
                ? 'Kategoriye geri dönmek için sol oka basın'
                : 'Detay için bir kategoriye tıklayın'}
            </p>
          </div>
        </div>
        {data && (
          <span className="text-xs text-slate-400">
            {data.kayitlar.length} öğe
          </span>
        )}
      </div>

      <div className="mt-3">
        {loading && !data ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Yükleniyor…
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center text-sm text-mubil-700">
            {error}
          </div>
        ) : !data?.kayitlar?.length ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Kayıt yok
          </div>
        ) : (
          <KategoriDagilimChart
            data={data.kayitlar}
            mode={data.mode}
            onBarClick={handleBarClick}
          />
        )}
      </div>
    </div>
  );
}
