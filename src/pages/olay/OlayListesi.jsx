import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, LayoutGrid, List as ListIcon, Loader2, AlertTriangle,
  Download,
} from 'lucide-react';
import { useMaster } from '../../hooks/useMaster.js';
import { listOlaylar } from '../../api/olay.js';
import FiltreCubugu, { EMPTY_FILTERS } from '../../components/olay/FiltreCubugu.jsx';
import OlayTable from '../../components/olay/OlayTable.jsx';
import OlayCards from '../../components/olay/OlayCards.jsx';
import Pagination from '../../components/olay/Pagination.jsx';
import { exportOlaylariExcel } from '../../lib/exportExcel.js';

const STORAGE_KEY = 'mubil_olay_listesi_view';

function useDebounced(value, delayMs = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

export default function OlayListesi() {
  const navigate = useNavigate();
  const { ilceler, birimler, kategoriler, loading: masterLoading, error: masterError } = useMaster();

  // Görünüm modu — localStorage'da sakla
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'table';
    } catch {
      return 'table';
    }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, view); } catch { /* sessizce yut */ }
  }, [view]);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sayfa,   setSayfa]   = useState(1);
  const [limit]               = useState(25);

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const [exporting, setExporting] = useState(false);
  const [exportProg, setExportProg] = useState(0);

  // q (arama) için debounce
  const debouncedQ = useDebounced(filters.q, 350);

  // Sayfayı sıfırla — filtre değişince
  useEffect(() => {
    setSayfa(1);
  }, [
    filters.ilceId, filters.kategoriId, filters.turId, filters.birimId,
    filters.olayTuru, filters.durum, filters.hasarDurumu,
    filters.tarihBas, filters.tarihSon,
    debouncedQ,
  ]);

  const fetchKayitlar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend'e null'ları göndermeyelim
      const params = { sayfa, limit };
      const sendable = { ...filters, q: debouncedQ };
      for (const [k, v] of Object.entries(sendable)) {
        if (v !== null && v !== '' && v !== undefined) params[k] = v;
      }
      const res = await listOlaylar(params);
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Kayıtlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sayfa, limit,
    filters.ilceId, filters.kategoriId, filters.turId, filters.birimId,
    filters.olayTuru, filters.durum, filters.hasarDurumu,
    filters.tarihBas, filters.tarihSon,
    debouncedQ,
  ]);

  useEffect(() => { fetchKayitlar(); }, [fetchKayitlar]);

  async function handleExport() {
    setExporting(true);
    setExportProg(0);
    setError(null);
    try {
      // Aynı filtre, sayfalama yok — backend tüm sayfaları çekecek
      const sendable = { ...filters, q: debouncedQ };
      const params = {};
      for (const [k, v] of Object.entries(sendable)) {
        if (v !== null && v !== '' && v !== undefined) params[k] = v;
      }
      await exportOlaylariExcel(params, (yuklenen, toplam) => {
        setExportProg(toplam ? Math.round((yuklenen / toplam) * 100) : 0);
      });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Excel export başarısız');
    } finally {
      setExporting(false);
      setExportProg(0);
    }
  }

  if (masterLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Veriler yükleniyor…
      </div>
    );
  }
  if (masterError) {
    return (
      <div className="rounded-lg border border-mubil-200 bg-mubil-50 p-4 text-mubil-800">
        Master veriler yüklenemedi: {masterError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Başlık çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Olay Listesi</h1>
          <p className="text-sm text-slate-500">
            {data?.toplam != null ? `${data.toplam} kayıt` : 'Yükleniyor…'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium transition ${
                view === 'table' ? 'bg-mubil-50 text-mubil-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Tablo görünümü"
            >
              <ListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tablo</span>
            </button>
            <button
              onClick={() => setView('cards')}
              className={`flex items-center gap-2 border-l border-slate-300 px-4 py-2.5 font-medium transition ${
                view === 'cards' ? 'bg-mubil-50 text-mubil-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Kart görünümü"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kart</span>
            </button>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting || (data?.toplam ?? 0) === 0}
            className="btn-mubil-secondary"
            title="Filtrelenmiş kayıtları Excel'e aktar"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {exportProg > 0 ? `${exportProg}%` : 'Hazırlanıyor…'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </>
            )}
          </button>

          {/* Yeni kayıt */}
          <button onClick={() => navigate('/olay/yeni')} className="btn-mubil-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Yeni Kayıt</span>
          </button>
        </div>
      </div>

      {/* Filtre */}
      <FiltreCubugu
        filters={filters}
        setFilters={setFilters}
        ilceler={ilceler}
        birimler={birimler}
        kategoriler={kategoriler}
        defaultOpen
      />

      {/* Hata */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Liste */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Kayıtlar yükleniyor…
        </div>
      ) : (
        <>
          {view === 'table'
            ? <OlayTable kayitlar={data?.kayitlar || []} />
            : <OlayCards kayitlar={data?.kayitlar || []} />}

          {data && (
            <Pagination
              toplam={data.toplam}
              sayfa={data.sayfa}
              limit={data.limit}
              onChange={setSayfa}
            />
          )}
        </>
      )}
    </div>
  );
}
