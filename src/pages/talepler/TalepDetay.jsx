// src/pages/talepler/TalepDetay.jsx — talep detayı + admin yönetim

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertTriangle, Trash2, Calendar, User, Tag,
  CheckCircle2, MessageSquare,
} from 'lucide-react';
import { fetchTalep, updateTalep, deleteTalep } from '../../api/talep.js';
import {
  TipBadge, OncelikBadge, DurumBadge,
  DURUM_ETIKET, ONCELIK_ETIKET,
} from '../../lib/talepLabels.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../../lib/rolLabels.jsx';

export default function TalepDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  const isMudur = myLevel >= ROL_SEVIYE.mudur;
  const isAdmin = myLevel >= ROL_SEVIYE.admin;

  const [talep, setTalep]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [busy, setBusy]       = useState(false);
  const [silOnay, setSilOnay] = useState(false);
  const [yoneticiNotuDraft, setYoneticiNotuDraft] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const t = await fetchTalep(id);
      setTalep(t);
      setYoneticiNotuDraft(t.yoneticiNotu || '');
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function changeDurum(yeniDurum) {
    setBusy(true);
    try {
      const t = await updateTalep(id, { durum: yeniDurum });
      setTalep(t);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeOncelik(yeniOncelik) {
    setBusy(true);
    try {
      const t = await updateTalep(id, { oncelik: yeniOncelik });
      setTalep(t);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveYoneticiNotu() {
    setBusy(true);
    try {
      const t = await updateTalep(id, { yoneticiNotu: yoneticiNotuDraft });
      setTalep(t);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteTalep(id);
      navigate('/talepler', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setBusy(false);
      setSilOnay(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Yükleniyor…
      </div>
    );
  }

  if (error && !talep) {
    return (
      <div className="card-mubil text-center text-mubil-700">
        <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
        {error}
        <div className="mt-4">
          <Link to="/talepler" className="btn-mubil-secondary">Listeye dön</Link>
        </div>
      </div>
    );
  }

  if (!talep) return null;

  const sahip = talep.olusturanUsername === user?.username;
  const silinebilir = isAdmin || (sahip && talep.durum === 'yeni');

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/talepler" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Talep listesine dön
      </Link>

      {/* Başlık ve badge'ler */}
      <div className="card-mubil">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">#{talep.id}</span>
              <span>·</span>
              <span>
                {new Date(talep.createdAt).toLocaleDateString('tr-TR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">{talep.baslik}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <TipBadge tip={talep.tip} />
              <OncelikBadge oncelik={talep.oncelik} />
              <DurumBadge durum={talep.durum} />
            </div>
          </div>
          {silinebilir && (
            <button
              onClick={() => setSilOnay(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-mubil-700 hover:bg-mubil-50"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Açıklama */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Açıklama</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-800">{talep.aciklama}</p>
        </div>

        {/* Açan kişi */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <User className="h-3.5 w-3.5" />
          <span>
            {talep.olusturanDisplayName || talep.olusturanUsername}
            {talep.olusturanDepartment && ` · ${talep.olusturanDepartment}`}
          </span>
        </div>
      </div>

      {/* Müdür+ yönetim alanı */}
      {isMudur && (
        <div className="card-mubil">
          <h3 className="mb-3 text-sm font-medium text-slate-900">Yönetim</h3>

          <div className="space-y-4">
            {/* Durum değiştir */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Durumu Değiştir</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(DURUM_ETIKET).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => changeDurum(k)}
                    disabled={busy || talep.durum === k}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      talep.durum === k
                        ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    } disabled:cursor-not-allowed`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Öncelik değiştir */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Önceliği Değiştir</label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ONCELIK_ETIKET).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => changeOncelik(k)}
                    disabled={busy || talep.oncelik === k}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      talep.oncelik === k
                        ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    } disabled:cursor-not-allowed`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Yönetici notu */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Yönetici Notu / Cevap
              </label>
              <textarea
                value={yoneticiNotuDraft}
                onChange={(e) => setYoneticiNotuDraft(e.target.value)}
                rows={3}
                placeholder="Talep sahibine cevabınızı buraya yazın…"
                className="input-mubil text-sm"
              />
              <button
                onClick={saveYoneticiNotu}
                disabled={busy || yoneticiNotuDraft === (talep.yoneticiNotu || '')}
                className="mt-2 btn-mubil-secondary text-sm"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
                Notu Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yönetici notu (sahibinin gördüğü) */}
      {!isMudur && talep.yoneticiNotu && (
        <div className="card-mubil border-mubil-200 bg-mubil-50/30">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-mubil-800">
            <MessageSquare className="h-4 w-4" />
            Yönetici Cevabı
          </h3>
          <p className="whitespace-pre-wrap text-sm text-slate-800">{talep.yoneticiNotu}</p>
        </div>
      )}

      {/* Çözüm bilgisi */}
      {talep.cozumTarihi && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <CheckCircle2 className="mr-1 inline-block h-3.5 w-3.5" />
          {talep.durum === 'tamamlandi' ? 'Tamamlandı' : 'Reddedildi'}: {' '}
          {new Date(talep.cozumTarihi).toLocaleString('tr-TR')}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sil onay modal */}
      {silOnay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => !busy && setSilOnay(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="p-5">
              <h3 className="font-semibold text-slate-900">Talebi sil</h3>
              <p className="mt-1 text-sm text-slate-500">
                Bu talep kalıcı olarak silinecek. Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <button onClick={() => setSilOnay(false)} disabled={busy} className="btn-mubil-secondary">
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-mubil-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-mubil-700 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
