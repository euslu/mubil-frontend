import { useEffect, useState } from 'react';
import { Upload, FileText, Building, Loader2, AlertTriangle, CheckCircle2, Save, X, Users, Mail, MessageSquare } from 'lucide-react';
import { fetchDepartments, fetchUsersByDepartment, bulkAtama } from '../../api/admin.js';
import { ROL_ETIKET, ROL_SEVIYE } from '../../lib/rolLabels.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TopluAtamaForm({ onSuccess }) {
  const { user } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  const atanabilirRoller = ['daire_baskani', 'mudur', 'sef', 'personel', 'user']
    .filter(r => ROL_SEVIYE[r] < myLevel);

  const [yontem, setYontem] = useState('departman');
  const [role, setRole]     = useState('personel');
  const [bildirimMail, setBildirimMail] = useState(false);
  const [bildirimSms, setBildirimSms]   = useState(false);

  const [departments, setDepartments] = useState([]);
  const [seciliDept, setSeciliDept]   = useState(null);
  const [usersInDept, setUsersInDept] = useState([]);
  const [seciliUsers, setSeciliUsers] = useState(new Set());
  const [loadingDept, setLoadingDept] = useState(false);

  const [csvInput, setCsvInput]         = useState('');
  const [csvUsernames, setCsvUsernames] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchDepartments()
      .then(d => setDepartments(d.kayitlar || []))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    if (!seciliDept) {
      setUsersInDept([]);
      setSeciliUsers(new Set());
      return;
    }
    setLoadingDept(true);
    fetchUsersByDepartment({
      directorate: seciliDept.directorate || undefined,
      department: seciliDept.department || undefined,
    })
      .then(d => {
        setUsersInDept(d.kayitlar || []);
        setSeciliUsers(new Set((d.kayitlar || []).map(u => u.username)));
      })
      .catch(e => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoadingDept(false));
  }, [seciliDept]);

  function toggleUser(username) {
    setSeciliUsers(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  }

  function selectAll() { setSeciliUsers(new Set(usersInDept.map(u => u.username))); }
  function deselectAll() { setSeciliUsers(new Set()); }

  function parseCsv() {
    const list = csvInput
      .split(/[\n,;\t]+/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const m = s.match(/<([^>]+)>$/);
        return m ? m[1].trim() : s;
      });
    const unique = [...new Set(list)];
    setCsvUsernames(unique);
    setError(null);
  }

  async function submit() {
    setError(null);
    setResult(null);

    let usernames;
    if (yontem === 'departman') {
      usernames = [...seciliUsers];
    } else {
      usernames = csvUsernames;
    }

    if (usernames.length === 0) {
      setError('En az bir kullanıcı seçin');
      return;
    }

    setSubmitting(true);
    try {
      const r = await bulkAtama({ usernames, role, active: true, bildirimMail: !!bildirimMail, bildirimSms: !!bildirimSms });
      setResult(r);
      if (r.eklendi + r.guncellendi > 0) onSuccess?.();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Toplu atama başarısız');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-700" />
            <div>
              <h3 className="font-semibold text-emerald-900">Toplu atama tamamlandı</h3>
              <p className="mt-1 text-sm text-emerald-800">
                Toplam {result.toplam} kullanıcı işlendi.<br/>
                <strong>{result.eklendi}</strong> yeni atama, <strong>{result.guncellendi}</strong> güncelleme.
                {result.atlandi.length > 0 && <> <strong>{result.atlandi.length}</strong> atlandı.</>}
              </p>
            </div>
          </div>
        </div>

        {result.atlandi.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 text-sm font-medium text-amber-900">
              Atlanan kayıtlar ({result.atlandi.length})
            </div>
            <ul className="max-h-60 space-y-1 overflow-y-auto text-sm text-amber-800">
              {result.atlandi.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    <code className="rounded bg-amber-100 px-1 text-xs">{a.username}</code>
                    {' — '}{a.sebep}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => {
            setResult(null);
            setSeciliUsers(new Set());
            setCsvInput('');
            setCsvUsernames([]);
            setSeciliDept(null);
          }}
          className="btn-mubil-secondary"
        >
          Yeni Toplu Atama
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Atama Yöntemi</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setYontem('departman')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              yontem === 'departman' ? 'border-mubil-300 bg-mubil-50 text-mubil-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}>
            <Building className="h-4 w-4" />Departman bazlı
          </button>
          <button type="button" onClick={() => setYontem('csv')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              yontem === 'csv' ? 'border-mubil-300 bg-mubil-50 text-mubil-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}>
            <FileText className="h-4 w-4" />Kullanıcı listesi (CSV)
          </button>
        </div>
      </div>

      {yontem === 'departman' && (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Departman</label>
            <select
              value={seciliDept ? `${seciliDept.directorate || ''}::${seciliDept.department || ''}` : ''}
              onChange={(e) => {
                if (!e.target.value) { setSeciliDept(null); return; }
                const [directorate, department] = e.target.value.split('::');
                setSeciliDept({ directorate: directorate || null, department: department || null });
              }}
              className="input-mubil bg-white"
            >
              <option value="">Departman seçiniz…</option>
              {departments.map((d, i) => (
                <option key={i} value={`${d.directorate || ''}::${d.department || ''}`}>
                  {d.directorate || '—'} · {d.department || '—'}
                </option>
              ))}
            </select>
          </div>

          {loadingDept && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />Kullanıcılar yükleniyor…
            </div>
          )}

          {!loadingDept && seciliDept && (
            <div className="rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Users className="h-4 w-4" />
                  <strong>{seciliUsers.size}</strong> / {usersInDept.length} kullanıcı seçili
                </div>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs font-medium text-mubil-700 hover:underline">Hepsini seç</button>
                  <button onClick={deselectAll} className="text-xs font-medium text-slate-500 hover:underline">Temizle</button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {usersInDept.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    Bu departmanda aktif kullanıcı yok
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {usersInDept.map(u => (
                      <li key={u.username}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50">
                          <input type="checkbox" checked={seciliUsers.has(u.username)} onChange={() => toggleUser(u.username)}
                            className="h-4 w-4 rounded border-slate-300 text-mubil-600 focus:ring-mubil-500" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-slate-900">{u.displayName}</div>
                            <div className="truncate text-xs text-slate-500">
                              {u.username}{u.title && ` · ${u.title}`}
                            </div>
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {yontem === 'csv' && (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kullanıcı adları</label>
            <textarea value={csvInput} onChange={(e) => setCsvInput(e.target.value)} rows={5}
              placeholder="ali.veli, ayse.yilmaz, mehmet.kara&#10;veya alt alta:&#10;ali.veli&#10;ayse.yilmaz"
              className="input-mubil font-mono text-sm" />
            <p className="mt-1 text-xs text-slate-400">
              Virgül, tab veya satır sonu ile ayırın. Excel/CSV satırlarını yapıştırabilirsiniz.
            </p>
          </div>
          <button onClick={parseCsv} className="btn-mubil-secondary">
            <Upload className="h-4 w-4" />Listeyi Çözümle
          </button>

          {csvUsernames.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-sm text-slate-700">
                <strong>{csvUsernames.length}</strong> benzersiz kullanıcı adı tespit edildi.
              </div>
              <div className="flex flex-wrap gap-1.5">
                {csvUsernames.slice(0, 30).map(u => (
                  <code key={u} className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
                    {u}
                  </code>
                ))}
                {csvUsernames.length > 30 && (
                  <span className="text-xs text-slate-400">+{csvUsernames.length - 30} daha…</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Atanacak Rol <span className="text-mubil-600">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {atanabilirRoller.map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                role === r ? 'border-mubil-300 bg-mubil-50 text-mubil-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}>
              {ROL_ETIKET[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-3">
        <h4 className="mb-2 text-sm font-medium text-slate-700">Bildirim Tercihleri</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox"
              checked={bildirimMail}
              onChange={(e) => setBildirimMail(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-mubil-600"
            />
            <span className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              Mail al
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox"
              checked={bildirimSms}
              onChange={(e) => setBildirimSms(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-mubil-600"
            />
            <span className="flex items-center gap-1 text-sm">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              SMS al
            </span>
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Secili tum kullanicilar bu bildirim tercihleriyle guncellenir.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button onClick={submit} disabled={submitting} className="btn-mubil-primary">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {submitting ? 'Atanıyor…' : 'Toplu Ata'}
      </button>
    </div>
  );
}
