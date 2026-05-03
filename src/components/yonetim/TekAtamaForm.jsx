import { useState } from 'react';
import { Save, Loader2, AlertTriangle, CheckCircle2, Mail, MessageSquare } from 'lucide-react';
import UserCombobox from './UserCombobox.jsx';
import { upsertRol } from '../../api/admin.js';
import { ROL_ETIKET, ROL_SEVIYE } from '../../lib/rolLabels.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TekAtamaForm({ onSuccess }) {
  const { user } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  const atanabilirRoller = ['admin', 'daire_baskani', 'mudur', 'sef', 'personel', 'user']
    .filter(r => ROL_SEVIYE[r] < myLevel);

  const [seciliKullanici, setSeciliKullanici] = useState(null);
  const [role, setRole] = useState('personel');
  const [bildirimMail, setBildirimMail] = useState(false);
  const [bildirimSms, setBildirimSms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  async function submit() {
    setError(null);
    setSuccess(null);
    if (!seciliKullanici) {
      setError('Önce bir kullanıcı seçin');
      return;
    }
    setSubmitting(true);
    try {
      await upsertRol(seciliKullanici.username, {
        role,
        displayName: seciliKullanici.displayName,
        directorate: seciliKullanici.directorate,
        department: seciliKullanici.department,
        active: true,
        bildirimMail,
        bildirimSms,
      });
      setSuccess(`${seciliKullanici.displayName} → ${ROL_ETIKET[role]} olarak atandı`);
      setSeciliKullanici(null);
      setRole('personel');
      setBildirimMail(false);
      setBildirimSms(false);
      onSuccess?.();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Atama başarısız');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Kullanıcı <span className="text-mubil-600">*</span>
        </label>
        <UserCombobox
          value={seciliKullanici}
          onChange={setSeciliKullanici}
          placeholder="Ad veya kullanıcı adı yazarak ara…"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Rol <span className="text-mubil-600">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {atanabilirRoller.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                role === r
                  ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ROL_ETIKET[r]}
            </button>
          ))}
        </div>
        {atanabilirRoller.length === 0 && (
          <p className="text-xs text-slate-400">Atayabileceğiniz bir rol bulunmuyor.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={bildirimMail}
            onChange={(e) => setBildirimMail(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-mubil-600"
          />
          <span className="flex items-center gap-1 text-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            Mail bildirimleri al
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={bildirimSms}
            onChange={(e) => setBildirimSms(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-mubil-600"
          />
          <span className="flex items-center gap-1 text-sm">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            SMS bildirimleri al
          </span>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <button onClick={submit} disabled={submitting || !seciliKullanici} className="btn-mubil-primary">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {submitting ? 'Kaydediliyor…' : 'Atama Yap'}
      </button>
    </div>
  );
}
