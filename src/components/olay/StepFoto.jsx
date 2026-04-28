import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2, AlertTriangle } from 'lucide-react';
import { uploadFotograflar } from '../../api/olay';

const MAX_FILES = 10;
const MAX_SIZE_MB = 10;

export default function StepFoto({ form, setForm }) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState(null);
  const inputRef = useRef(null);

  const fotograflar = Array.isArray(form.fotograflar) ? form.fotograflar : [];

  async function handleFiles(files) {
    setError(null);
    const list = Array.from(files);
    if (!list.length) return;

    if (fotograflar.length + list.length > MAX_FILES) {
      setError(`En fazla ${MAX_FILES} fotoğraf ekleyebilirsiniz.`);
      return;
    }
    const tooBig = list.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      setError(`Dosya boyutu ${MAX_SIZE_MB} MB'ı aşıyor: ${tooBig.name}`);
      return;
    }
    const notImage = list.find((f) => !/^image\//.test(f.type));
    if (notImage) {
      setError(`Sadece resim dosyaları yüklenebilir: ${notImage.name}`);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const { items } = await uploadFotograflar(list, setProgress);
      setForm({ ...form, fotograflar: [...fotograflar, ...items] });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeFoto(idx) {
    const next = fotograflar.filter((_, i) => i !== idx);
    setForm({ ...form, fotograflar: next });
  }

  function onDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Fotoğraflar</h3>
        <p className="mt-1 text-sm text-slate-500">
          Olay yerinden fotoğraflar ekleyebilirsiniz. En fazla {MAX_FILES} adet, dosya başına {MAX_SIZE_MB} MB.
        </p>
      </div>

      {/* Upload alanı */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-mubil-400 hover:bg-mubil-50/30"
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-mubil-600" />
            <div className="text-sm font-medium text-slate-700">Yükleniyor… {progress}%</div>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-slate-400" />
            <div className="text-sm font-medium text-slate-700">
              Fotoğrafları sürükleyip bırakın veya tıklayın
            </div>
            <div className="text-xs text-slate-400">
              JPG, PNG, WebP, HEIC · {fotograflar.length}/{MAX_FILES} eklendi
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-3 text-sm text-mubil-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview grid */}
      {fotograflar.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {fotograflar.map((f, idx) => (
            <div key={f.url || idx} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <img
                src={f.url}
                alt={f.originalName || `Foto ${idx + 1}`}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => removeFoto(idx)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-mubil-700 shadow-md opacity-0 transition group-hover:opacity-100 hover:bg-white"
                aria-label="Sil"
              >
                <X className="h-4 w-4" />
              </button>
              {f.originalName && (
                <div className="truncate bg-white px-2 py-1 text-[11px] text-slate-500">
                  {f.originalName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
