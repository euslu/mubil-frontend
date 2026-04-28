import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Recharts ~80KB gzip — sadece dashboard chart'ı render edilirken yüklensin.
// Bu wrapper olmadan Recharts ana bundle'a giriyor.
const Chart = lazy(() => import('./ZamanSerisiChartInner.jsx'));

export default function ZamanSerisiChart(props) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Grafik yükleniyor…
        </div>
      }
    >
      <Chart {...props} />
    </Suspense>
  );
}
