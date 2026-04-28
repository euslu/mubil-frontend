import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';

function formatXLabel(tarih, granularity) {
  if (!tarih) return '';
  if (granularity === 'gun') {
    // "2026-04-15" → "15.04"
    const m = tarih.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}.${m[2]}`;
    return tarih;
  }
  // "2026-04" → "Nis 26"
  const AYLAR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const m = tarih.match(/^(\d{4})-(\d{2})$/);
  if (!m) return tarih;
  const yil2 = m[1].slice(-2);
  return `${AYLAR[+m[2] - 1]} ${yil2}`;
}

function CustomTooltip({ active, payload, label, granularity }) {
  if (!active || !payload?.length) return null;
  const sayi = payload[0].value;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <div className="text-xs font-medium text-slate-500">
        {granularity === 'gun' ? 'Gün' : 'Ay'}: {label}
      </div>
      <div className="mt-0.5">
        <span className="font-semibold text-mubil-700">{sayi.toLocaleString('tr-TR')}</span>
        <span className="text-slate-500"> kayıt</span>
      </div>
    </div>
  );
}

export default function ZamanSerisiChart({ seri, granularity, loading }) {
  const data = useMemo(() => {
    if (!seri) return [];
    return seri.map((s) => ({
      tarih:    s.tarih,
      tarihLbl: formatXLabel(s.tarih, granularity),
      sayi:     s.sayi,
    }));
  }, [seri, granularity]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Yükleniyor…
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Bu aralıkta gösterilecek veri yok.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -12 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="tarihLbl"
            stroke="#94A3B8"
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            stroke="#94A3B8"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(220, 38, 38, 0.05)' }}
            content={<CustomTooltip granularity={granularity} />}
          />
          <Bar
            dataKey="sayi"
            fill="#DC2626"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
