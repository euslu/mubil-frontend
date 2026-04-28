import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FotoLightbox({ fotograflar, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const foto = fotograflar[index];
  if (!foto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {fotograflar.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div onClick={(e) => e.stopPropagation()} className="flex max-h-full max-w-full flex-col items-center gap-2">
        <img
          src={foto.url}
          alt={foto.originalName || ''}
          className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-xl"
        />
        <div className="text-xs text-white/70">
          {fotograflar.length > 1 && `${index + 1} / ${fotograflar.length}`}
          {foto.originalName && ` · ${foto.originalName}`}
        </div>
      </div>
    </div>
  );
}
