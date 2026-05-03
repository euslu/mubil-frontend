// src/pages/talepler/TalepKayit.jsx — yeni talep formu

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, AlertTriangle, Bug, Sparkles, Wrench, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createTalep } from '../../api/talep.js';
import { TIP_ETIKET, ONCELIK_ETIKET } from '../../lib/talepLabels.jsx';

const TIP_ICON = { bug: Bug, feature: Sparkles, iyilestirme: Wrench };

export default function TalepKayit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    baslik: '',
    aciklama: '',
    tip: 'bug',
    oncelik: 'orta',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e?.preventDefault?.();
    setError(null);
    if (form.baslik.trim().length < 3) return setError('Başlık en az 3 karakter olmalı');
    if (form.aciklama.trim().length < 10) return setError('Açıklama en az 10 karakter olmalı');

    setSubmitting(true);
    try {
      const t = await createTalep(form);
      navigate(`/talepler/${t.id}`, { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Kaydedilemedi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link to="/talepler" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Talep listesine dön
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Yeni Geliştirme Talebi</h1>
        <p className="text-sm text-slate-500">
          MUBİL'de karşılaştığınız bir hatayı bildirin veya yeni bir özellik önerisi gönderin.
        </p>
      </div>

      <form onSubmit={submit} className="card-mubil space-y-4">
        {/* Tip */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Talep Tipi <span className="text-mubil-600">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(TIP_ETIKET).map(([k, v]) => {
              const Icon = TIP_ICON[k];
              const sec = form.tip === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm({ ...form, tip: k })}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    sec
                      ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        {/* Öncelik */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Öncelik</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ONCELIK_ETIKET).map(([k, v]) => (
              <button
                key={k}
                type="button"
                onClick={() => setForm({ ...form, oncelik: k })}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  form.oncelik === k
                    ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Başlık */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Başlık <span className="text-mubil-600">*</span>
          </label>
          <input
            type="text"
            value={form.baslik}
            onChange={(e) => setForm({ ...form, baslik: e.target.value })}
            placeholder="Kısa, açıklayıcı bir başlık"
            maxLength={200}
            className="input-mubil"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Açıklama <span className="text-mubil-600">*</span>
          </label>
          <textarea
            value={form.aciklama}
            onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
            placeholder={
              form.tip === 'bug'
                ? 'Hatayı nasıl yeniden üretebileceğimizi adım adım anlatın. Beklenen ve görülen davranış nedir?'
                : form.tip === 'feature'
                  ? 'Yeni özelliği detaylı anlatın. Hangi senaryoda işe yarayacak?'
                  : 'Mevcut özelliği nasıl iyileştirmek istediğinizi anlatın.'
            }
            rows={6}
            className="input-mubil"
          />
          <p className="mt-1 text-xs text-slate-400">
            En az 10 karakter. Ekran görüntüsü eklemek için lütfen başvurunuzdan sonra
            yöneticiye iletin (henüz dosya ekleme yok).
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Link to="/talepler" className="btn-mubil-secondary">
            İptal
          </Link>
          <button type="submit" disabled={submitting} className="btn-mubil-primary">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? 'Kaydediliyor…' : 'Talebi Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
}
