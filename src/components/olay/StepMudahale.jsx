import { useMemo } from 'react';
import { Field, Select, TimeInput, Textarea } from './FormFields.jsx';

const ALAN_OPTIONS = [
  { value: 'KONUT',       label: 'Konut' },
  { value: 'YOL',         label: 'Yol' },
  { value: 'TARLA',       label: 'Tarla' },
  { value: 'ISYERI',      label: 'İşyeri' },
  { value: 'DERE_YATAGI', label: 'Dere Yatağı' },
  { value: 'KOPRU',       label: 'Köprü' },
  { value: 'OKUL',        label: 'Okul' },
  { value: 'KAMU_BINASI', label: 'Kamu Binası' },
  { value: 'DIGER',       label: 'Diğer' },
];

const IHBAR_OPTIONS = [
  { value: 'BIRIMLER',     label: 'Birimler (saha)' },
  { value: 'TELEFON',      label: 'Telefon' },
  { value: 'SOSYAL_MEDYA', label: 'Sosyal Medya' },
  { value: 'AKOM',         label: 'AKOM' },
  { value: 'AFAD',         label: 'AFAD' },
  { value: 'MUHTAR',       label: 'Muhtar' },
  { value: 'VATANDAS',     label: 'Vatandaş' },
  { value: 'DIGER',        label: 'Diğer' },
];

const HASAR_OPTIONS = [
  { value: 'YOK',                label: 'Hasar Yok' },
  { value: 'VAR_MADDI',          label: 'Maddi Hasar' },
  { value: 'VAR_ARAC',           label: 'Araç Hasarı' },
  { value: 'VAR_CAN_KAYBI',      label: 'Can Kaybı' },
  { value: 'DEGERLENDIRILIYOR',  label: 'Değerlendiriliyor' },
];

export default function StepMudahale({ form, setForm, errors, kategoriler, birimler }) {
  const kategoriOptions = kategoriler.map((k) => ({ value: String(k.id), label: k.ad }));
  const birimOptions    = birimler.map((b)    => ({ value: String(b.id), label: b.ad }));

  // Cascade: seçili kategoriye göre alt tür listesi
  const turOptions = useMemo(() => {
    if (!form.mudahaleKategoriId) return [];
    const k = kategoriler.find((x) => String(x.id) === String(form.mudahaleKategoriId));
    if (!k) return [];
    return (k.turler || []).map((t) => ({ value: String(t.id), label: t.ad }));
  }, [form.mudahaleKategoriId, kategoriler]);

  function handleKategoriChange(val) {
    // Kategori değişince alt türü sıfırla
    setForm({ ...form, mudahaleKategoriId: val, mudahaleTurId: null });
  }

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-slate-900">Müdahale Bilgileri</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Müdahale Kategorisi" required error={errors.mudahaleKategoriId}>
          <Select
            value={form.mudahaleKategoriId}
            onChange={handleKategoriChange}
            options={kategoriOptions}
          />
        </Field>

        <Field
          label="Alt Tür"
          hint={!form.mudahaleKategoriId ? 'Önce kategori seçin' : 'Opsiyonel'}
        >
          <Select
            value={form.mudahaleTurId}
            onChange={(v) => setForm({ ...form, mudahaleTurId: v })}
            options={turOptions}
            disabled={!form.mudahaleKategoriId}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Müdahale Eden Birim">
          <Select
            value={form.mudahaleBirimId}
            onChange={(v) => setForm({ ...form, mudahaleBirimId: v })}
            options={birimOptions}
          />
        </Field>

        <Field label="Etkilenen Alan">
          <Select
            value={form.alanTuru}
            onChange={(v) => setForm({ ...form, alanTuru: v })}
            options={ALAN_OPTIONS}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="İhbar Kaynağı">
          <Select
            value={form.ihbarKaynagi}
            onChange={(v) => setForm({ ...form, ihbarKaynagi: v })}
            options={IHBAR_OPTIONS}
          />
        </Field>

        <Field label="Hasar Durumu">
          <Select
            value={form.hasarDurumu}
            onChange={(v) => setForm({ ...form, hasarDurumu: v })}
            options={HASAR_OPTIONS}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Başlangıç Saati">
          <TimeInput
            value={form.baslangicSaati}
            onChange={(v) => setForm({ ...form, baslangicSaati: v })}
          />
        </Field>
        <Field label="Bitiş Saati">
          <TimeInput
            value={form.bitisSaati}
            onChange={(v) => setForm({ ...form, bitisSaati: v })}
          />
        </Field>
      </div>

      <Field label="Not / Açıklama" hint="Olayla ilgili ek bilgi">
        <Textarea
          value={form.notMetni}
          onChange={(v) => setForm({ ...form, notMetni: v })}
          rows={3}
          placeholder="Olay detayları, müdahale notları, gözlemler…"
        />
      </Field>
    </div>
  );
}
