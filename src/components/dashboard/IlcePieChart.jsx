import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Chart = lazy(() => import('./IlcePieChartInner.jsx'));

export default function IlcePieChart(props) {
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
