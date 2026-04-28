import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { Field, Select, DateInput } from './FormFields.jsx';
import { OLAY_TURU_LABEL, DURUM_LABEL, HASAR_LABEL } from '../../lib/olayLabels.js';

export const HARITA_EMPTY_FILTERS = {
  ilceId: null,
  kategoriId: null,
  olayTuru: null,
  durum: null,
  hasarDurumu: null,
  tarihBas: null,
  tarihSon: null,
};

function aktifSayisi(f) {
  let n = 0;
  for (const v of Object.values(f)) {
    if (v !== null && v !== '' && v !== undefined) n++;
  }
  return n;
}

export default function HaritaFiltreleri({
  filters, setFilters, ilceler, kategoriler,
}) {
  const [open, setOpen] = useState(false);
  const aktif = aktifSayisi(filters);

  function update(patch) {
    setFilters({ ...filters, ...patch });
  }

  function reset() {
    setFilters(HARITA_EMPTY_FILTERS);
  }

  // "Sadece aktif olaylar" hızlı toggle
  const sadeceAktif = filters.durum === 'ACIK' || filters.durum === 'MUDAHALEDE';

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-mubil-card">
      <div className="flex flex-wrap items-center gap-2 p-3">
        {/* Hızlı: sadece aktif */}
        <button
          onClick={() => update({ durum: sadeceAktif ? null : 'ACIK' })}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
            sadeceAktif
              ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Activity className="h-4 w-4" />
          Sadece Aktif Olaylar
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              aktif > 0
                ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtreler
            {aktif > 0 && (
              <span className="rounded-full bg-mubil-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {aktif}
              </span>
            )}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {aktif > 0 && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              title="Tüm filtreleri temizle"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                onChange={(v) => update({ kategoriId: v })}
                options={kategoriler.map((k) => ({ value: String(k.id), label: k.ad }))}
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

            <Field label="Hasar">
              <Select
                value={filters.hasarDurumu}
                onChange={(v) => update({ hasarDurumu: v })}
                options={Object.entries(HASAR_LABEL).map(([v, l]) => ({ value: v, label: l }))}
                placeholder="Tümü"
              />
            </Field>

            <Field label="Tarih (başlangıç)">
              <DateInput
                value={filters.tarihBas}
                onChange={(v) => update({ tarihBas: v })}
              />
            </Field>

            <Field label="Tarih (bitiş)">
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
