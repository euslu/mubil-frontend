import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Field, Select, DateInput } from './FormFields.jsx';
import {
  OLAY_TURU_LABEL, DURUM_LABEL, HASAR_LABEL,
} from '../../lib/olayLabels.js';

export const EMPTY_FILTERS = {
  ilceId: null,
  kategoriId: null,
  turId: null,
  birimId: null,
  olayTuru: null,
  durum: null,
  hasarDurumu: null,
  tarihBas: null,
  tarihSon: null,
  q: '',
};

function aktifFilterSayisi(f) {
  let n = 0;
  for (const k of Object.keys(f)) {
    const v = f[k];
    if (v !== null && v !== '' && v !== undefined) n++;
  }
  return n;
}

export default function FiltreCubugu({
  filters,
  setFilters,
  ilceler,
  birimler,
  kategoriler,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const aktif = aktifFilterSayisi(filters);

  // Kategori → cascade tür
  const turler = (() => {
    if (!filters.kategoriId) return [];
    const k = kategoriler.find((x) => String(x.id) === String(filters.kategoriId));
    return k?.turler || [];
  })();

  function update(patch) {
    setFilters({ ...filters, ...patch });
  }

  function reset() {
    setFilters(EMPTY_FILTERS);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-mubil-card">
      {/* Header — her zaman görünür */}
      <div className="flex items-center gap-2 p-3">
        {/* Hızlı arama her zaman ekranda */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Mahalle / not içinde ara…"
            className="input-mubil pl-9"
          />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
            aktif > 0 ? 'border-mubil-300 bg-mubil-50 text-mubil-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtreler
          {aktif > 0 && (
            <span className="ml-0.5 rounded-full bg-mubil-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {aktif}
            </span>
          )}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {aktif > 0 && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-2.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            title="Tüm filtreleri temizle"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Açılır kısım */}
      {open && (
        <div className="border-t border-slate-200 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="İlçe">
              <Select
                value={filters.ilceId}
                onChange={(v) => update({ ilceId: v })}
                options={ilceler.map((i) => ({ value: String(i.id), label: i.ad }))}
                placeholder="Tümü"
              />
            </Field>

            <Field label="Müdahale Kategorisi">
              <Select
                value={filters.kategoriId}
                onChange={(v) => update({ kategoriId: v, turId: null })}
                options={kategoriler.map((k) => ({ value: String(k.id), label: k.ad }))}
                placeholder="Tümü"
              />
            </Field>

            <Field label="Alt Tür">
              <Select
                value={filters.turId}
                onChange={(v) => update({ turId: v })}
                options={turler.map((t) => ({ value: String(t.id), label: t.ad }))}
                placeholder={filters.kategoriId ? 'Tümü' : 'Önce kategori seçin'}
                disabled={!filters.kategoriId}
              />
            </Field>

            <Field label="Müdahale Birimi">
              <Select
                value={filters.birimId}
                onChange={(v) => update({ birimId: v })}
                options={birimler.map((b) => ({ value: String(b.id), label: b.ad }))}
                placeholder="Tümü"
              />
            </Field>

            <Field label="Olay Türü">
              <Select
                value={filters.olayTuru}
                onChange={(v) => update({ olayTuru: v })}
                options={Object.entries(OLAY_TURU_LABEL).map(([v, l]) => ({ value: v, label: l }))}
                placeholder="Tümü"
              />
            </Field>

            <Field label="Durum">
              <Select
                value={filters.durum}
                onChange={(v) => update({ durum: v })}
                options={Object.entries(DURUM_LABEL).map(([v, l]) => ({ value: v, label: l }))}
                placeholder="Tümü"
              />
            </Field>

            <Field label="Hasar Durumu">
              <Select
                value={filters.hasarDurumu}
                onChange={(v) => update({ hasarDurumu: v })}
                options={Object.entries(HASAR_LABEL).map(([v, l]) => ({ value: v, label: l }))}
                placeholder="Tümü"
              />
            </Field>

            <Field label="Tarih Aralığı (başlangıç)">
              <DateInput
                value={filters.tarihBas}
                onChange={(v) => update({ tarihBas: v })}
              />
            </Field>

            <Field label="Tarih Aralığı (bitiş)">
              <DateInput
                value={filters.tarihSon}
                onChange={(v) => update({ tarihSon: v })}
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
