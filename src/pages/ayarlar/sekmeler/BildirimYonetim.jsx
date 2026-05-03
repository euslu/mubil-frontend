// src/pages/ayarlar/sekmeler/BildirimYonetim.jsx
//
// Ayarlar > Bildirimler sekmesi.
// Sistem geneli bildirim ayarlarını yönetir + son gönderim audit + test gönder.

import { useEffect, useState } from 'react';
import {
  Loader2, AlertTriangle, Save, Bell, BellOff, Mail, MessageSquare,
  Send, CheckCircle2, XCircle, RefreshCw, Info,
} from 'lucide-react';
import {
  fetchBildirimAyar, updateBildirimAyar, fetchBildirimGonderim,
  fetchBildirimOzet, testBildirim,
} from '../../../api/bildirim.js';
import { fetchKategoriler } from '../../../api/ayarlar.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { ROL_SEVIYE } from '../../../lib/rolLabels.jsx';

const KAPSAM_OPSIYON = [
  { value: 'tum',      etiket: 'Tüm olaylar',           hint: 'Her yeni olayda bildirim gönder' },
  { value: 'hasarli',  etiket: 'Sadece hasarlı olaylar', hint: 'Maddi/araç/can hasarı olanlar' },
  { value: 'kategori', etiket: 'Belirli kategoriler',    hint: 'Aşağıdan seçilen kategoriler' },
];

export default function BildirimYonetim() {
  const { user } = useAuth();
  const myLevel = ROL_SEVIYE[user?.mubilRole] || 0;
  const isAdmin = myLevel >= ROL_SEVIYE.admin;

  const [ayar, setAyar]         = useState(null);
  const [kategoriler, setKategoriler] = useState([]);
  const [ozet, setOzet]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [bilgi, setBilgi]       = useState(null);
  const [tab, setTab]           = useState('genel'); // genel | sablon | audit

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [a, k, o] = await Promise.all([
        fetchBildirimAyar(),
        fetchKategoriler(false).catch(() => ({ kayitlar: [] })),
        fetchBildirimOzet().catch(() => null),
      ]);
      setAyar(a);
      setKategoriler(k.kayitlar || []);
      setOzet(o);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setBilgi(null);
    try {
      const guncel = await updateBildirimAyar({
        sistemAcik: ayar.sistemAcik,
        olayKapsam: ayar.olayKapsam,
        kategoriIdler: Array.isArray(ayar.kategoriIdler) ? ayar.kategoriIdler : [],
        sessizBaslangic: ayar.sessizBaslangic || null,
        sessizBitis: ayar.sessizBitis || null,
        smsLimitSaatlik: Number(ayar.smsLimitSaatlik),
        mailKonu: ayar.mailKonu,
        mailIcerik: ayar.mailIcerik,
        smsIcerik: ayar.smsIcerik,
        linkTemplate: ayar.linkTemplate,
      });
      setAyar(guncel);
      setBilgi('Ayarlar kaydedildi');
      setTimeout(() => setBilgi(null), 3000);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  function kategoriIdToggle(id) {
    const mevcut = Array.isArray(ayar.kategoriIdler) ? ayar.kategoriIdler : [];
    const yeni = mevcut.includes(id)
      ? mevcut.filter(x => x !== id)
      : [...mevcut, id];
    setAyar({ ...ayar, kategoriIdler: yeni });
  }

  if (loading && !ayar) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Yükleniyor…
      </div>
    );
  }

  if (!ayar) return null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {bilgi && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{bilgi}</span>
        </div>
      )}

      {/* Sistem ana toggle */}
      <div className={`card-mubil ${
        ayar.sistemAcik ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-300 bg-slate-50'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              ayar.sistemAcik ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
            }`}>
              {ayar.sistemAcik ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Bildirim Sistemi</h3>
              <p className="text-sm text-slate-500">
                {ayar.sistemAcik
                  ? 'Aktif — yeni olaylarda bildirim gönderiliyor'
                  : 'Kapalı — hiçbir bildirim gönderilmiyor'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAyar({ ...ayar, sistemAcik: !ayar.sistemAcik })}
            className={`inline-flex h-8 w-14 items-center rounded-full transition ${
              ayar.sistemAcik ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transition ${
              ayar.sistemAcik ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Son 24 saat özet */}
      {ozet && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <OzetMini label="Mail (24s)" value={ozet.son24Saat.mail.gonderildi} icon={Mail}  renk="emerald" />
          <OzetMini label="SMS (24s)"  value={ozet.son24Saat.sms.gonderildi}  icon={MessageSquare} renk="blue" />
          <OzetMini label="Mail Hata" value={ozet.son24Saat.mail.hata} icon={XCircle} renk={ozet.son24Saat.mail.hata > 0 ? 'mubil' : 'slate'} />
          <OzetMini label="SMS Hata"  value={ozet.son24Saat.sms.hata}  icon={XCircle} renk={ozet.son24Saat.sms.hata > 0 ? 'mubil' : 'slate'} />
        </div>
      )}

      {/* Sekme nav */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-1">
          {[
            { id: 'genel',  etiket: 'Genel Ayarlar' },
            { id: 'sablon', etiket: 'Şablonlar' },
            { id: 'audit',  etiket: 'Gönderim Geçmişi' },
            ...(isAdmin ? [{ id: 'test', etiket: 'Test' }] : []),
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'border-mubil-600 text-mubil-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.etiket}
            </button>
          ))}
        </nav>
      </div>

      {/* GENEL */}
      {tab === 'genel' && (
        <div className="card-mubil space-y-5">
          {/* Olay kapsamı */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Bildirim hangi olaylarda gönderilsin?
            </label>
            <div className="space-y-2">
              {KAPSAM_OPSIYON.map(opt => (
                <label key={opt.value}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition ${
                    ayar.olayKapsam === opt.value
                      ? 'border-mubil-300 bg-mubil-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                  <input
                    type="radio"
                    checked={ayar.olayKapsam === opt.value}
                    onChange={() => setAyar({ ...ayar, olayKapsam: opt.value })}
                    className="mt-0.5 h-4 w-4 border-slate-300 text-mubil-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{opt.etiket}</div>
                    <div className="text-xs text-slate-500">{opt.hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Kategori seçimi (sadece kapsam='kategori' ise) */}
          {ayar.olayKapsam === 'kategori' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className="mb-2 block text-xs font-medium text-slate-600">
                Hangi kategoriler? ({(ayar.kategoriIdler || []).length} seçili)
              </label>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {kategoriler.map(k => (
                  <label key={k.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-white">
                    <input
                      type="checkbox"
                      checked={(ayar.kategoriIdler || []).includes(k.id)}
                      onChange={() => kategoriIdToggle(k.id)}
                      className="h-4 w-4 rounded border-slate-300 text-mubil-600"
                    />
                    <span className="text-sm text-slate-700">{k.ad}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sessize alma */}
          <div className="border-t border-slate-100 pt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              SMS Sessize Alma Saatleri
            </label>
            <p className="mb-2 text-xs text-slate-500">
              Bu aralıkta SMS gönderilmez (mail gönderimi devam eder).
              Boş bırakırsanız sessize alma kapalı.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <div>
                <label className="mb-1 block text-xs text-slate-600">Başlangıç</label>
                <input
                  type="time"
                  value={ayar.sessizBaslangic || ''}
                  onChange={(e) => setAyar({ ...ayar, sessizBaslangic: e.target.value || null })}
                  className="input-mubil text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-600">Bitiş</label>
                <input
                  type="time"
                  value={ayar.sessizBitis || ''}
                  onChange={(e) => setAyar({ ...ayar, sessizBitis: e.target.value || null })}
                  className="input-mubil text-sm"
                />
              </div>
            </div>
          </div>

          {/* Saatlik SMS limit */}
          <div className="border-t border-slate-100 pt-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Kullanıcı Başına Saatlik SMS Limiti
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0" max="1000"
                value={ayar.smsLimitSaatlik}
                onChange={(e) => setAyar({ ...ayar, smsLimitSaatlik: e.target.value })}
                className="input-mubil w-24 text-sm"
              />
              <span className="text-xs text-slate-500">SMS / saat</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Bir kullanıcı saatte bu sayıdan fazla SMS aldıysa, fazlası gönderilmez.
              Mail için limit yok.
            </p>
          </div>
        </div>
      )}

      {/* ŞABLON */}
      {tab === 'sablon' && (
        <div className="card-mubil space-y-5">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
            <Info className="mb-1 h-4 w-4" />
            Şablonlarda kullanabileceğiniz değişkenler: <code className="font-mono">{'{{olay.id}}'}</code>,
            <code className="font-mono">{' {{olay.ilce}}'}</code>,
            <code className="font-mono">{' {{olay.mahalle}}'}</code>,
            <code className="font-mono">{' {{olay.kategoriAd}}'}</code>,
            <code className="font-mono">{' {{olay.durum}}'}</code>,
            <code className="font-mono">{' {{olay.tarih}}'}</code>,
            <code className="font-mono">{' {{olay.aciklama}}'}</code>,
            <code className="font-mono">{' {{olay.hasarOzet}}'}</code>,
            <code className="font-mono">{' {{link}}'}</code>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Mail className="h-4 w-4" /> Mail Konu
            </label>
            <input
              type="text"
              value={ayar.mailKonu}
              onChange={(e) => setAyar({ ...ayar, mailKonu: e.target.value })}
              className="input-mubil text-sm"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Mail className="h-4 w-4" /> Mail İçerik
            </label>
            <textarea
              rows={8}
              value={ayar.mailIcerik}
              onChange={(e) => setAyar({ ...ayar, mailIcerik: e.target.value })}
              className="input-mubil font-mono text-xs"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <MessageSquare className="h-4 w-4" /> SMS İçerik
            </label>
            <textarea
              rows={3}
              value={ayar.smsIcerik}
              onChange={(e) => setAyar({ ...ayar, smsIcerik: e.target.value })}
              className="input-mubil font-mono text-xs"
              maxLength={320}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={ayar.smsIcerik.length > 160 ? 'text-amber-600' : 'text-slate-400'}>
                {ayar.smsIcerik.length} / 160 karakter
                {ayar.smsIcerik.length > 160 && ' (çoklu SMS)'}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Detay Link Şablonu
            </label>
            <input
              type="text"
              value={ayar.linkTemplate}
              onChange={(e) => setAyar({ ...ayar, linkTemplate: e.target.value })}
              className="input-mubil font-mono text-xs"
            />
          </div>
        </div>
      )}

      {/* AUDIT */}
      {tab === 'audit' && <BildirimAudit />}

      {/* TEST */}
      {tab === 'test' && isAdmin && <BildirimTest />}

      {/* Kaydet (genel + şablon sekmesinde) */}
      {(tab === 'genel' || tab === 'sablon') && (
        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="btn-mubil-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function OzetMini({ label, value, icon: Icon, renk }) {
  const renkler = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue:    'bg-blue-50 text-blue-700',
    mubil:   'bg-mubil-50 text-mubil-700',
    slate:   'bg-slate-50 text-slate-600',
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
        <Icon className={`h-4 w-4 ${renkler[renk] || 'text-slate-400'}`} />
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function BildirimAudit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState({ kanal: '', basarili: '' });

  async function load() {
    setLoading(true);
    try {
      const params = { pageSize: 50 };
      if (filtre.kanal) params.kanal = filtre.kanal;
      if (filtre.basarili) params.basarili = filtre.basarili;
      const r = await fetchBildirimGonderim(params);
      setData(r);
    } catch (e) {
      setData({ kayitlar: [], toplam: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filtre]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={filtre.kanal}
          onChange={(e) => setFiltre({ ...filtre, kanal: e.target.value })}
          className="input-mubil bg-white py-1.5 text-sm"
        >
          <option value="">Tüm kanallar</option>
          <option value="mail">Mail</option>
          <option value="sms">SMS</option>
        </select>
        <select
          value={filtre.basarili}
          onChange={(e) => setFiltre({ ...filtre, basarili: e.target.value })}
          className="input-mubil bg-white py-1.5 text-sm"
        >
          <option value="">Tüm sonuçlar</option>
          <option value="true">Başarılı</option>
          <option value="false">Hatalı</option>
        </select>
        <button onClick={load} className="ml-auto rounded-lg p-1.5 hover:bg-slate-100">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        </div>
      ) : data?.kayitlar?.length === 0 ? (
        <div className="rounded-lg border border-slate-200 py-12 text-center text-slate-400">
          Gönderim kaydı yok
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Tarih</th>
                <th className="px-3 py-2 text-left">Kanal</th>
                <th className="px-3 py-2 text-left">Kullanıcı</th>
                <th className="px-3 py-2 text-left">Hedef</th>
                <th className="px-3 py-2 text-left">Olay</th>
                <th className="px-3 py-2 text-left">Sonuç</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.kayitlar.map(g => (
                <tr key={g.id}>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(g.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      g.kanal === 'mail' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {g.kanal}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{g.username}</td>
                  <td className="px-3 py-2 text-xs font-mono text-slate-500">{g.hedef}</td>
                  <td className="px-3 py-2 text-xs">
                    {g.olayId ? <span className="font-mono">#{g.olayId}</span> : '—'}
                  </td>
                  <td className="px-3 py-2">
                    {g.basarili ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-mubil-700" title={g.hataMesaji}>
                        <XCircle className="h-3.5 w-3.5" />
                        Hata
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function BildirimTest() {
  const [form, setForm] = useState({ kanal: 'mail', hedef: '', mesaj: 'MUBİL bildirim sistemi test mesajı.' });
  const [busy, setBusy] = useState(false);
  const [sonuc, setSonuc] = useState(null);

  async function gonder() {
    setBusy(true);
    setSonuc(null);
    try {
      const r = await testBildirim(form);
      setSonuc(r);
    } catch (e) {
      setSonuc({ basarili: false, hataMesaji: e?.response?.data?.error || e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-mubil space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Test gönderimi: SMTP/SMS gateway bağlantısını ve credential'ları
        doğrulamak için kullanılır. Gerçek bir adres/numara girilmelidir.
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Kanal</label>
        <div className="flex gap-2">
          {['mail', 'sms'].map(k => (
            <button
              key={k}
              onClick={() => setForm({ ...form, kanal: k })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                form.kanal === k
                  ? 'border-mubil-300 bg-mubil-50 text-mubil-700'
                  : 'border-slate-200'
              }`}
            >
              {k === 'mail' ? 'Mail' : 'SMS'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {form.kanal === 'mail' ? 'E-posta Adresi' : 'GSM Numarası'}
        </label>
        <input
          type="text"
          value={form.hedef}
          onChange={(e) => setForm({ ...form, hedef: e.target.value })}
          placeholder={form.kanal === 'mail' ? 'ornek@mugla.bel.tr' : '05551234567'}
          className="input-mubil text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Mesaj</label>
        <textarea
          rows={3}
          value={form.mesaj}
          onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
          className="input-mubil text-sm"
        />
      </div>

      <button onClick={gonder} disabled={busy || !form.hedef} className="btn-mubil-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Test Gönder
      </button>

      {sonuc && (
        <div className={`rounded-lg border p-3 text-sm ${
          sonuc.basarili
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-mubil-200 bg-mubil-50 text-mubil-800'
        }`}>
          <div className="flex items-start gap-2">
            {sonuc.basarili ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
            <div>
              <div className="font-medium">{sonuc.basarili ? 'Başarılı' : 'Başarısız'}</div>
              {sonuc.hataMesaji && <div className="mt-1 text-xs">{sonuc.hataMesaji}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
