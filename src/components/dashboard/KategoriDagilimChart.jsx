// src/components/dashboard/KategoriDagilimChart.jsx
// Recharts'ı barındıran inner component. Lazy chunk (zaten bundle'a girmemeli).

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const PALET = [
  '#DC2626', // mubil-600
  '#EA580C', // warning-600
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#64748B', // slate
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const label = d.kategoriAd || d.turAd || '—';
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-xs font-medium text-slate-900">{label}</div>
      <div className="text-sm font-semibold text-mubil-700">{d.adet} kayıt</div>
    </div>
  );
}

export default function KategoriDagilimChart({ data, mode, onBarClick }) {
  // Kategoride 7-10 öğe, türde 5-15 öğe → yatay bar daha okunaklı
  const chartData = data.map(d => ({
    ...d,
    label: d.kategoriAd || d.turAd || '—',
  }));

  const height = Math.max(220, chartData.length * 38);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tick={{ fontSize: 11, fill: '#475569' }}
            interval={0}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar
            dataKey="adet"
            radius={[0, 4, 4, 0]}
            cursor={mode === 'kategori' ? 'pointer' : 'default'}
            onClick={(d) => mode === 'kategori' && onBarClick?.(d)}
          >
            {chartData.map((_, ix) => (
              <Cell key={ix} fill={PALET[ix % PALET.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
