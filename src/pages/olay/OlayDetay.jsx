import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, Loader2, AlertTriangle,
  MapPin, Calendar, Clock, Building2, FileText, Camera,
} from 'lucide-react';
import { getOlay, deleteOlay } from '../../api/olay.js';
import { useAuth } from '../../context/AuthContext.jsx';
import FotoLightbox from '../../components/olay/FotoLightbox.jsx';
import {
  formatTarih, formatSaat, formatSure,
  OLAY_TURU_LABEL, YAGIS_LABEL, IHBAR_LABEL,
  ALAN_LABEL, HASAR_LABEL, HASAR_BADGE_CLASS,
  DURUM_LABEL, DURUM_BADGE_CLASS,
} from '../../lib/olayLabels.js';

const ROL_SEVIYE = { admin: 5, daire_baskani: 4, sef: 3, personel: 2, user: 1 };

function MetaItem({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}

export default function OlayDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [olay,    setOlay]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [silModal,  setSilModal]  = useState(false);
  const [siliyor,   setSiliyor]   = useState(false);
  const [lightbox, setLightbox]  = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOlay(id)
      .then((d) => { if (!cancelled) setOlay(d); })
      .catch((e) => { if (!cancelled) setError(e?.response?.data?.error || e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const userLevel  = ROL_SEVIYE[user?.mubilRole] || 0;
  const isOwner    = olay?.createdBy === user?.username;
  const canEdit    = userLevel >= ROL_SEVIYE.sef || isOwner;
  const canDelete  = userLevel >= ROL_SEVIYE.sef;

  async function handleDelete() {
    setSiliyor(true);
    try {
      await deleteOlay(id);
      navigate('/olay', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Silme başarısız');
      setSilModal(false);
    } finally {
      setSiliyor(false);
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
  if (error || !olay) {
    return (
      <div className="space-y-3">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Geri
        </button>
        <div className="rounded-lg border border-mubil-200 bg-mubil-50 p-4 text-mubil-800">
          {error || 'Kayıt bulunamadı'}
        </div>
      </div>
    );
  }

  const fotograflar = Array.isArray(olay.fotograflar) ? olay.fotograflar : [];
  const kategoriRenk = olay.mudahaleKategori?.renk || '#DC2626';

  return (
    <div className="space-y-4">
      {/* Üst başlık + aksiyonlar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button onClick={() => navigate('/olay')} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Listeye dön
        </button>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => navigate(`/olay/${id}/duzenle`)}
              className="btn-mubil-secondary"
            >
              <Pencil className="h-4 w-4" />
              Düzenle
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setSilModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-mubil-300 bg-white px-4 py-2.5 font-medium text-mubil-700 shadow-sm transition hover:bg-mubil-50"
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </button>
          )}
        </div>
      </div>

      {/* Ana kart */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-mubil-card">
        <div className="h-1 w-full" style={{ backgroundColor: kategoriRenk }} />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Kayıt #{olay.id}
              </div>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">
                {olay.mudahaleKategori?.ad}
              </h1>
              {olay.mudahaleTur?.ad && (
                <div className="text-sm text-slate-500">{olay.mudahaleTur.ad}</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={DURUM_BADGE_CLASS[olay.durum] || ''}>
                {DURUM_LABEL[olay.durum] || olay.durum}
              </span>
              {olay.hasarDurumu && olay.hasarDurumu !== 'YOK' && (
                <span className={HASAR_BADGE_CLASS[olay.hasarDurumu] || ''}>
                  {HASAR_LABEL[olay.hasarDurumu]}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetaItem icon={Calendar} label="Tarih">
              {formatTarih(olay.tarih)}
            </MetaItem>

            <MetaItem icon={MapPin} label="Lokasyon">
              <div className="font-medium">{olay.ilce?.ad}</div>
              <div className="text-slate-500">{olay.mahalleLokasyon}</div>
              {(olay.enlem != null && olay.boylam != null) && (
                <a
                  href={`https://www.google.com/maps?q=${olay.enlem},${olay.boylam}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-mubil-600 hover:underline"
                >
                  Haritada gör
                </a>
              )}
            </MetaItem>

            <MetaItem icon={Building2} label="Müdahale Birimi">
              {olay.mudahaleBirim?.ad || '—'}
            </MetaItem>

            <MetaItem label="Olay Türü">
              {OLAY_TURU_LABEL[olay.olayTuru] || olay.olayTuru}
              {olay.yagisBicimi && (
                <span className="text-slate-500"> · {YAGIS_LABEL[olay.yagisBicimi]}</span>
              )}
            </MetaItem>

            <MetaItem label="Yağış (mm)">
              {olay.saatlikYagisMm != null && (
                <span>Saatlik: <strong>{olay.saatlikYagisMm}</strong></span>
              )}
              {olay.saatlikYagisMm != null && olay.yagisMiktariMm != null && ' · '}
              {olay.yagisMiktariMm != null && (
                <span>Toplam: <strong>{olay.yagisMiktariMm}</strong></span>
              )}
              {olay.saatlikYagisMm == null && olay.yagisMiktariMm == null && '—'}
            </MetaItem>

            <MetaItem label="Etkilenen Alan">
              {ALAN_LABEL[olay.alanTuru] || '—'}
            </MetaItem>

            <MetaItem icon={Clock} label="Başlangıç → Bitiş">
              {olay.baslangicSaati ? formatSaat(olay.baslangicSaati) : '—'}
              {' → '}
              {olay.bitisSaati ? formatSaat(olay.bitisSaati) : '—'}
              {olay.sureDakika != null && (
                <span className="text-slate-500"> · {formatSure(olay.sureDakika)}</span>
              )}
            </MetaItem>

            <MetaItem label="İhbar Kaynağı">
              {IHBAR_LABEL[olay.ihbarKaynagi] || olay.ihbarKaynagi || '—'}
            </MetaItem>

            <MetaItem label="Kaydeden">
              <div>{olay.createdBy || '—'}</div>
              {olay.createdAt && (
                <div className="text-xs text-slate-500">
                  {new Date(olay.createdAt).toLocaleString('tr-TR')}
                </div>
              )}
            </MetaItem>
          </div>

          {/* Not */}
          {olay.notMetni && (
            <div className="mt-6">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                <FileText className="h-3.5 w-3.5" />
                Not / Açıklama
              </div>
              <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {olay.notMetni}
              </div>
            </div>
          )}

          {/* Foto galerisi */}
          {fotograflar.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                <Camera className="h-3.5 w-3.5" />
                Fotoğraflar ({fotograflar.length})
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {fotograflar.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i)}
                    className="overflow-hidden rounded-lg border border-slate-200 transition hover:border-mubil-300 hover:shadow-md"
                  >
                    <img
                      src={f.url}
                      alt={f.originalName || ''}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox != null && (
        <FotoLightbox
          fotograflar={fotograflar}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((i) => (i > 0 ? i - 1 : fotograflar.length - 1))}
          onNext={() => setLightbox((i) => (i < fotograflar.length - 1 ? i + 1 : 0))}
        />
      )}

      {/* Sil confirm modal */}
      {silModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => !siliyor && setSilModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mubil-100 text-mubil-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Olay kaydını sil</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {`Kayıt #${olay.id} ve eklenmiş tüm fotoğraflar silinecek. Bu işlem geri alınamaz.`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <button
                onClick={() => setSilModal(false)}
                disabled={siliyor}
                className="btn-mubil-secondary"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                disabled={siliyor}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-mubil-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-mubil-700 disabled:opacity-60"
              >
                {siliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Evet, sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
