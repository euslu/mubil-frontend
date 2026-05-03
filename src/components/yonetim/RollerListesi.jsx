import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Trash2, Pencil, Check, X, Mail, MessageSquare } from 'lucide-react';
import { fetchRoller, deactivateRol, upsertRol } from '../../api/admin.js';
import { RolBadge, ROL_ETIKET, ROL_SEVIYE } from '../../lib/rolLabels.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function BildirimToggle({ aktif, aliciDolu, kanal, onChange }) {
  const Icon = kanal === 'mail' ? Mail : MessageSquare;
  const eksik = aktif && !aliciDolu;

  return (
    <button
      type="button"
      onClick={() => onChange(!aktif)}
      className={`relative inline-flex h-7 w-7 items-center justify-center rounded-lg transition ${
        aktif
          ? eksik
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
      }`}
      title={
        !aktif
          ? `${kanal === 'mail' ? 'Mail' : 'SMS'} kapalı`
          : eksik
            ? `${kanal === 'mail' ? 'E-posta' : 'Telefon'} adresi yok — bildirim gönderilemez`
            : 'Aktif'
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {eksik && (
        <AlertTriangle className="absolute -right-0.5 -top-0.5 h-3 w-3 text-amber-600" />
      )}
    </button>
  );
}

const ATANABILIR_ROLLER = ['admin', 'daire_baskani', 'mudur', 'sef', 'personel', 'user'];

export default function RollerListesi({ refreshKey, onChanged }) {
  const { user } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;

  const [roller, setRoller]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy]       = useState(false);
  const [silOnay, setSilOnay] = useState(null);
  const [filter, setFilter]   = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoller();
      setRoller(data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Listeleme hatası');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [refreshKey]);

  function startEdit(r) {
    setEditing({ username: r.username, role: r.role, active: r.active });
  }

  async function saveEdit() {
    if (!editing) return;
    setBusy(true);
    try {
      await upsertRol(editing.username, { role: editing.role, active: editing.active });
      setEditing(null);
      onChanged?.();
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!silOnay) return;
    setBusy(true);
    try {
      await deactivateRol(silOnay);
      setSilOnay(null);
      onChanged?.();
      load();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function quickToggle(username, alan, yeniDeger) {
    setBusy(true);
    try {
      await upsertRol(username, { [alan]: yeniDeger });
      setRoller(prev => prev.map(r =>
        r.username === username ? { ...r, [alan]: yeniDeger } : r
      ));
    } catch (e) {
      setError(e?.response?.data?.error || 'Güncellenemedi');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Yükleniyor…
      </div>
    );
  }

  const atanabilir = ATANABILIR_ROLLER.filter(r => ROL_SEVIYE[r] < myLevel);
  const filtered = roller.filter(r => {
    if (!filter) return true;
    const q = filter.toLocaleLowerCase('tr');
    return (r.username || '').toLocaleLowerCase('tr').includes(q)
        || (r.displayName || '').toLocaleLowerCase('tr').includes(q)
        || (r.department || '').toLocaleLowerCase('tr').includes(q);
  });

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Ad veya kullanıcı adı ara…"
          className="input-mubil sm:max-w-xs"
        />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{filtered.length} / {roller.length} kayıt</span>
          <button onClick={load} className="rounded-lg p-1.5 hover:bg-slate-100" title="Yenile">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-mubil-card">
        <table className="w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2.5">Kullanıcı</th>
              <th className="px-3 py-2.5">Departman</th>
              <th className="px-3 py-2.5">Rol</th>
              <th className="px-3 py-2.5">Durum</th>
              <th className="px-3 py-2.5">Mail</th>
              <th className="px-3 py-2.5">SMS</th>
              <th className="px-3 py-2.5 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">Kayıt yok</td></tr>
            )}
            {filtered.map((r) => {
              const isEdit = editing?.username === r.username;
              return (
                <tr key={r.username} className={isEdit ? 'bg-mubil-50/40' : ''}>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-slate-900">{r.displayName || r.username}</div>
                    <div className="text-xs text-slate-500">{r.username}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{r.department || r.directorate || '—'}</td>
                  <td className="px-3 py-2.5">
                    {isEdit ? (
                      <select
                        value={editing.role}
                        onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                        className="input-mubil py-1.5 text-sm"
                      >
                        {atanabilir.map(role => (
                          <option key={role} value={role}>{ROL_ETIKET[role]}</option>
                        ))}
                      </select>
                    ) : (
                      <RolBadge role={r.role} />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {isEdit ? (
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editing.active}
                          onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-mubil-600 focus:ring-mubil-500"
                        />
                        Aktif
                      </label>
                    ) : (
                      <span className={r.active ? 'text-emerald-700' : 'text-slate-400'}>
                        {r.active ? '● Aktif' : '○ Pasif'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <BildirimToggle
                      aktif={r.bildirimMail}
                      aliciDolu={!!r.email}
                      kanal="mail"
                      onChange={(v) => quickToggle(r.username, 'bildirimMail', v)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <BildirimToggle
                      aktif={r.bildirimSms}
                      aliciDolu={!!r.phone}
                      kanal="sms"
                      onChange={(v) => quickToggle(r.username, 'bildirimSms', v)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {isEdit ? (
                        <>
                          <button onClick={saveEdit} disabled={busy} className="flex h-8 w-8 items-center justify-center rounded text-emerald-700 hover:bg-emerald-50" title="Kaydet">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button onClick={() => setEditing(null)} disabled={busy} className="flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100" title="İptal">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(r)} className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100" title="Düzenle">
                            <Pencil className="h-4 w-4" />
                          </button>
                          {r.active && r.username !== user?.username && (
                            <button onClick={() => setSilOnay(r.username)} className="flex h-8 w-8 items-center justify-center rounded text-mubil-700 hover:bg-mubil-50" title="Pasifleştir">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {silOnay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => !busy && setSilOnay(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mubil-100 text-mubil-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Yetkiyi pasifleştir</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {`${silOnay} kullanıcısının MUBİL erişimi kaldırılacak. Daha sonra tekrar aktif edilebilir.`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <button onClick={() => setSilOnay(null)} disabled={busy} className="btn-mubil-secondary">Vazgeç</button>
              <button onClick={confirmDelete} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-mubil-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-mubil-700 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Pasifleştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
