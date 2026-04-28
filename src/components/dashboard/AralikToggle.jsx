const ARALIKLAR = [
  { value: 'tum',  label: 'Tüm Zamanlar' },
  { value: '1y',   label: 'Son 1 Yıl' },
  { value: '90g',  label: 'Son 90 Gün' },
  { value: '30g',  label: 'Son 30 Gün' },
];

export default function AralikToggle({ value, onChange }) {
  return (
    <div className="inline-flex flex-wrap overflow-hidden rounded-lg border border-slate-300 bg-white">
      {ARALIKLAR.map((a, i) => (
        <button
          key={a.value}
          onClick={() => onChange(a.value)}
          className={`px-3 py-1.5 text-sm transition ${i > 0 ? 'border-l border-slate-300' : ''} ${
            value === a.value
              ? 'bg-mubil-50 font-medium text-mubil-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
