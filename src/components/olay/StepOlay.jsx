import { Field, Select, NumberInput } from './FormFields.jsx';

const OLAY_TURU_OPTIONS = [
  { value: 'YAGMUR',  label: 'Yağmur' },
  { value: 'RUZGAR',  label: 'Rüzgar' },
  { value: 'KAR',     label: 'Kar' },
  { value: 'DOLU',    label: 'Dolu' },
  { value: 'SIS',     label: 'Sis' },
  { value: 'DEPREM',  label: 'Deprem' },
  { value: 'YANGIN',  label: 'Yangın' },
  { value: 'HEYELAN', label: 'Heyelan' },
  { value: 'DIGER',   label: 'Diğer' },
];

const YAGIS_OPTIONS = [
  { value: 'SAGANAK',  label: 'Sağanak' },
  { value: 'SIDDETLI', label: 'Şiddetli' },
  { value: 'FIRTINA',  label: 'Fırtına' },
  { value: 'KAR',      label: 'Kar' },
  { value: 'BUZLANMA', label: 'Buzlanma' },
  { value: 'DOLU',     label: 'Dolu' },
  { value: 'NORMAL',   label: 'Normal' },
  { value: 'YOK',      label: 'Yok' },
];

export default function StepOlay({ form, setForm, errors }) {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-slate-900">Olay Bilgileri</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Olay Türü" required error={errors.olayTuru}>
          <Select
            value={form.olayTuru}
            onChange={(v) => setForm({ ...form, olayTuru: v })}
            options={OLAY_TURU_OPTIONS}
          />
        </Field>

        <Field label="Yağış Biçimi">
          <Select
            value={form.yagisBicimi}
            onChange={(v) => setForm({ ...form, yagisBicimi: v })}
            options={YAGIS_OPTIONS}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Saatlik Yağış (mm)" hint="Saatlik ölçüm varsa">
          <NumberInput
            value={form.saatlikYagisMm}
            onChange={(v) => setForm({ ...form, saatlikYagisMm: v })}
            placeholder="örn. 24.5"
          />
        </Field>
        <Field label="Toplam Yağış Miktarı (mm)">
          <NumberInput
            value={form.yagisMiktariMm}
            onChange={(v) => setForm({ ...form, yagisMiktariMm: v })}
            placeholder="örn. 78.3"
          />
        </Field>
      </div>
    </div>
  );
}
