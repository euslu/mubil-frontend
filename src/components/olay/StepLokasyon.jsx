import { Field, DateInput, Select, NumberInput } from './FormFields.jsx';
import MahalleAutocomplete from '../MahalleAutocomplete.jsx';
import LokasyonSecici from '../LokasyonSecici.jsx';
import GpsButton from '../GpsButton.jsx';

export default function StepLokasyon({ form, setForm, errors, ilceler, isEdit }) {
  const ilceOptions = ilceler.map((i) => ({ value: String(i.id), label: i.ad }));
  const seciliIlceAd = ilceler.find(i => String(i.id) === String(form.ilceId))?.ad || '';

  function onGpsPosition(pos) {
    setForm(f => ({
      ...f,
      enlem: pos.lat.toFixed(6),
      boylam: pos.lng.toFixed(6),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Lokasyon ve Tarih</h3>
        <LokasyonSecici
          ilce={seciliIlceAd}
          onPick={(loc) => {
            const ilce = ilceler.find(i => i.ad === loc.ilce);
            setForm(f => ({
              ...f,
              ilceId: ilce ? String(ilce.id) : f.ilceId,
              mahalleLokasyon: loc.mahalle || f.mahalleLokasyon,
              enlem: loc.lat,
              boylam: loc.lng,
            }));
          }}
        />
      </div>

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
            onChange={(v) => setForm({ ...form, ilceId: v, mahalleLokasyon: '' })}
            options={ilceOptions}
            placeholder="İlçe seçiniz…"
          />
        </Field>
      </div>

      <Field
        label="Mahalle / Lokasyon"
        required
        error={errors.mahalleLokasyon}
        hint="İlçe seçtikten sonra yazarak mevcut mahalleleri arayabilirsiniz."
      >
        <MahalleAutocomplete
          ilce={seciliIlceAd}
          value={form.mahalleLokasyon}
          onChange={(v) => setForm({ ...form, mahalleLokasyon: v })}
          placeholder="Mahalle adı veya lokasyon"
          required
        />
      </Field>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
        <div className="text-sm font-medium text-slate-700">GPS Koordinatları</div>

        <GpsButton
          onPosition={onGpsPosition}
          otomatikDene={!isEdit}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <p className="text-xs text-slate-400">
          GPS butonu telefonun konumunu otomatik doldurur. Manuel düzenlemek için alanlara tıklayın.
        </p>
      </div>
    </div>
  );
}
