import { Field, TextInput, DateInput, Select, NumberInput } from './FormFields.jsx';

export default function StepLokasyon({ form, setForm, errors, ilceler }) {
  const ilceOptions = ilceler.map((i) => ({ value: String(i.id), label: i.ad }));

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-slate-900">Lokasyon ve Tarih</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tarih" required error={errors.tarih}>
          <DateInput
            value={form.tarih}
            onChange={(v) => setForm({ ...form, tarih: v })}
          />
        </Field>

        <Field label="İlçe" required error={errors.ilceId}>
          <Select
            value={form.ilceId}
            onChange={(v) => setForm({ ...form, ilceId: v })}
            options={ilceOptions}
            placeholder="İlçe seçiniz…"
          />
        </Field>
      </div>

      <Field
        label="Mahalle / Lokasyon"
        required
        error={errors.mahalleLokasyon}
        hint="Olayın gerçekleştiği mahalle veya lokasyonu yazın (örn. Kemeraltı, Çiftlik mevkii)."
      >
        <TextInput
          value={form.mahalleLokasyon}
          onChange={(v) => setForm({ ...form, mahalleLokasyon: v })}
          placeholder="Mahalle adı veya lokasyon"
        />
      </Field>

      <details className="group rounded-lg border border-slate-200 bg-slate-50 p-3">
        <summary className="cursor-pointer select-none text-sm font-medium text-slate-700">
          GPS Koordinatları (opsiyonel)
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Enlem" hint="Örn. 37.0242">
            <NumberInput
              value={form.enlem}
              onChange={(v) => setForm({ ...form, enlem: v })}
              placeholder="37.0242"
            />
          </Field>
          <Field label="Boylam" hint="Örn. 28.3636">
            <NumberInput
              value={form.boylam}
              onChange={(v) => setForm({ ...form, boylam: v })}
              placeholder="28.3636"
            />
          </Field>
        </div>
      </details>
    </div>
  );
}
