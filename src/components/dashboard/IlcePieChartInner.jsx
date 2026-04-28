import { useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';

const RENKLER = [
  '#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#E11D48', '#A855F7',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <div className="font-medium text-slate-900">{d.name}</div>
      <div className="mt-0.5">
        <span className="font-semibold" style={{ color: d.payload.fill }}>
          {d.value.toLocaleString('tr-TR')}
        </span>
        <span className="text-slate-500"> kayıt</span>
        <span className="ml-1 text-xs text-slate-400">
          ({((d.value / d.payload.toplam) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}

function renderLabel({ name, percent }) {
  if (percent < 0.04) return null;
  return `${name} (${(percent * 100).toFixed(0)}%)`;
}

export default function IlcePieChartInner({ dagilim, loading }) {
  const { data } = useMemo(() => {
    if (!dagilim?.length) return { data: [], toplam: 0 };
    const t = dagilim.reduce((s, d) => s + d.sayi, 0);
    return {
      data: dagilim.map((d) => ({ name: d.ilceAd, value: d.sayi, toplam: t })),
      toplam: t,
    };
  }, [dagilim]);

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
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={40}
            paddingAngle={1}
            label={renderLabel}
            labelLine={{ stroke: '#94A3B8', strokeWidth: 0.5 }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={RENKLER[i % RENKLER.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
