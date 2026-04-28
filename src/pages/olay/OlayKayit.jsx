import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Stepper from '../../components/olay/Stepper.jsx';
import StepLokasyon from '../../components/olay/StepLokasyon.jsx';
import StepOlay from '../../components/olay/StepOlay.jsx';
import StepMudahale from '../../components/olay/StepMudahale.jsx';
import StepFoto from '../../components/olay/StepFoto.jsx';
import { useMaster } from '../../hooks/useMaster.js';
import { createOlay, getOlay, updateOlay } from '../../api/olay.js';

const STEPS = [
  { label: 'Lokasyon',  hint: 'Tarih, ilçe, mahalle' },
  { label: 'Olay',      hint: 'Tür, yağış, miktar' },
  { label: 'Müdahale',  hint: 'Kategori, birim, hasar' },
  { label: 'Fotoğraf',  hint: 'Saha fotoğrafları' },
];

const today = new Date().toISOString().slice(0, 10);

const INITIAL_FORM = {
  tarih: today,
  ilceId: null,
  mahalleLokasyon: '',
  enlem: null, boylam: null,
  olayTuru: 'YAGMUR',
  yagisBicimi: null,
  saatlikYagisMm: null, yagisMiktariMm: null,
  mudahaleKategoriId: null, mudahaleTurId: null, mudahaleBirimId: null,
  alanTuru: null,
  ihbarKaynagi: 'BIRIMLER',
  hasarDurumu: 'YOK',
  baslangicSaati: null, bitisSaati: null,
  notMetni: '',
  fotograflar: [],
};

// Backend'den gelen kaydı form state'ine çevir
function olayToForm(o) {
  function toTime(d) {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date)) return null;
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  function toDate(d) {
    if (!d) return today;
    const date = new Date(d);
    if (isNaN(date)) return today;
    return date.toISOString().slice(0, 10);
  }

  return {
    tarih:              toDate(o.tarih),
    ilceId:             o.ilceId != null ? String(o.ilceId) : null,
    mahalleLokasyon:    o.mahalleLokasyon || '',
    enlem:              o.enlem,
    boylam:             o.boylam,
    olayTuru:           o.olayTuru || 'YAGMUR',
    yagisBicimi:        o.yagisBicimi,
    saatlikYagisMm:     o.saatlikYagisMm,
    yagisMiktariMm:     o.yagisMiktariMm,
    mudahaleKategoriId: o.mudahaleKategoriId != null ? String(o.mudahaleKategoriId) : null,
    mudahaleTurId:      o.mudahaleTurId      != null ? String(o.mudahaleTurId)      : null,
    mudahaleBirimId:    o.mudahaleBirimId    != null ? String(o.mudahaleBirimId)    : null,
    alanTuru:           o.alanTuru,
    ihbarKaynagi:       o.ihbarKaynagi || 'BIRIMLER',
    hasarDurumu:        o.hasarDurumu  || 'YOK',
    baslangicSaati:     toTime(o.baslangicSaati),
    bitisSaati:         toTime(o.bitisSaati),
    notMetni:           o.notMetni || '',
    fotograflar:        Array.isArray(o.fotograflar) ? o.fotograflar : [],
  };
}

function validateStep(step, form) {
  const errors = {};
  if (step === 0) {
    if (!form.tarih)             errors.tarih = 'Tarih zorunlu';
    if (!form.ilceId)            errors.ilceId = 'İlçe zorunlu';
    if (!form.mahalleLokasyon?.trim()) errors.mahalleLokasyon = 'Mahalle / lokasyon zorunlu';
  }
  if (step === 1) {
    if (!form.olayTuru)          errors.olayTuru = 'Olay türü zorunlu';
  }
  if (step === 2) {
    if (!form.mudahaleKategoriId) errors.mudahaleKategoriId = 'Müdahale kategorisi zorunlu';
  }
  return errors;
}

export default function OlayKayit() {
  const navigate = useNavigate();
  const { id } = useParams();              // edit modunda var
  const isEdit = Boolean(id);

  const { ilceler, birimler, kategoriler, loading: masterLoading, error: masterError } = useMaster();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successId, setSuccessId] = useState(null);

  // Edit modu — mevcut olayı yükle
  const [editLoading, setEditLoading] = useState(isEdit);
  const [editError,   setEditError]   = useState(null);
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setEditLoading(true);
    getOlay(id)
      .then((o) => { if (!cancelled) setForm(olayToForm(o)); })
      .catch((e) => { if (!cancelled) setEditError(e?.response?.data?.error || e.message); })
      .finally(() => { if (!cancelled) setEditLoading(false); });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const completedSteps = useMemo(() => {
    const done = [];
    for (let i = 0; i < step; i++) {
      const e = validateStep(i, form);
      if (Object.keys(e).length === 0) done.push(i);
    }
    return done;
  }, [step, form]);

  function next() {
    const e = validateStep(step, form);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }
  function prev() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setSubmitError(null);
    for (let i = 0; i <= STEPS.length - 1; i++) {
      const e = validateStep(i, form);
      if (Object.keys(e).length > 0) {
        setStep(i); setErrors(e); return;
      }
    }
    setSubmitting(true);
    try {
      const res = isEdit
        ? await updateOlay(id, form)
        : await createOlay(form);
      setSuccessId(res.id);
    } catch (e) {
      setSubmitError(e?.response?.data?.error || e.message || 'Kayıt başarısız');
    } finally {
      setSubmitting(false);
    }
  }

  if (masterLoading || editLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {editLoading ? 'Kayıt yükleniyor…' : 'Veriler yükleniyor…'}
      </div>
    );
  }
  if (masterError || editError) {
    return (
      <div className="rounded-lg border border-mubil-200 bg-mubil-50 p-4 text-mubil-800">
        {masterError || editError}
      </div>
    );
  }

  if (successId) {
    return (
      <div className="card-mubil mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          {isEdit ? 'Kayıt güncellendi' : 'Olay kaydı oluşturuldu'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{`Kayıt #${successId}`}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button className="btn-mubil-secondary" onClick={() => navigate(`/olay/${successId}`)}>
            Detayı Gör
          </button>
          <button className="btn-mubil-primary" onClick={() => navigate('/olay')}>
            Listeye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {isEdit ? `Olay Kaydını Düzenle #${id}` : 'Yeni Olay Kaydı'}
          </h1>
          <p className="text-sm text-slate-500">Adımları takip ederek olay bilgilerini girin.</p>
        </div>
        <button
          onClick={() => navigate(isEdit ? `/olay/${id}` : '/')}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          İptal
        </button>
      </div>

      <Stepper steps={STEPS} currentStep={step} completedSteps={completedSteps} />

      <div className="card-mubil">
        {step === 0 && <StepLokasyon form={form} setForm={setForm} errors={errors} ilceler={ilceler} />}
        {step === 1 && <StepOlay     form={form} setForm={setForm} errors={errors} />}
        {step === 2 && <StepMudahale form={form} setForm={setForm} errors={errors} kategoriler={kategoriler} birimler={birimler} />}
        {step === 3 && <StepFoto     form={form} setForm={setForm} />}

        {submitError && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button onClick={prev} disabled={step === 0} className="btn-mubil-secondary disabled:invisible">
          <ArrowLeft className="h-4 w-4" />
          Geri
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="btn-mubil-primary">
            İleri
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-mubil-primary">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? 'Kaydediliyor…' : (isEdit ? 'Güncelle' : 'Kaydet')}
          </button>
        )}
      </div>
    </div>
  );
}
