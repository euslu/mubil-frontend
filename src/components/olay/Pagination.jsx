import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ toplam, sayfa, limit, onChange }) {
  const sonSayfa = Math.max(1, Math.ceil(toplam / limit));
  if (sonSayfa <= 1) return null;

  const baslangic = (sayfa - 1) * limit + 1;
  const bitis     = Math.min(sayfa * limit, toplam);

  function go(p) {
    if (p < 1 || p > sonSayfa) return;
    onChange(p);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="text-sm text-slate-500">
        <strong className="font-semibold text-slate-700">{baslangic}-{bitis}</strong>{' '}
        / <strong className="font-semibold text-slate-700">{toplam}</strong> kayıt
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(sayfa - 1)}
          disabled={sayfa <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Önceki
        </button>
        <span className="px-3 text-sm text-slate-500">
          Sayfa <strong className="font-semibold text-slate-700">{sayfa}</strong> / {sonSayfa}
        </span>
        <button
          onClick={() => go(sayfa + 1)}
          disabled={sayfa >= sonSayfa}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sonraki
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
