// src/components/GpsButton.jsx
// "Mevcut konumumu kullan" butonu. Loading/success/error durumlarını gösterir.
// Doğruluk seviyesini ve zamanı bildirir.
//
// Kullanımı:
//   const handlePosition = (pos) => setForm({ ...form, lat: pos.lat, lng: pos.lng });
//   <GpsButton onPosition={handlePosition} otomatikDene={true} />

import { useEffect, useState } from 'react';
import {
  MapPin, Loader2, CheckCircle2, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useGps, dogrulukSeviyesi, zamanFarki } from '../lib/useGps.js';

const RENK_SINIF = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber:   'bg-amber-50 text-amber-700 ring-amber-200',
  mubil:   'bg-mubil-50 text-mubil-700 ring-mubil-200',
  slate:   'bg-slate-50 text-slate-700 ring-slate-200',
};

export default function GpsButton({ onPosition, otomatikDene = false, disabled = false }) {
  const { state, position, error, oku, reset, otomatikDeneAcik } = useGps();
  const [autoTried, setAutoTried] = useState(false);
  const [, setTick] = useState(0); // re-render every 30s for "X sn önce"

  // Otomatik dene: sadece hook izin "verildi" durumundaysa ve daha denemediyse
  useEffect(() => {
    if (
      otomatikDene &&
      otomatikDeneAcik &&
      !autoTried &&
      state === 'idle' &&
      !disabled
    ) {
      setAutoTried(true);
      handleClick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otomatikDene, otomatikDeneAcik, autoTried, state, disabled]);

  // Zaman göstergesi yenilenmesi için periyodik tick
  useEffect(() => {
    if (state !== 'success') return;
    const t = setInterval(() => setTick(x => x + 1), 30000);
    return () => clearInterval(t);
  }, [state]);

  async function handleClick() {
    try {
      const pos = await oku();
      onPosition?.(pos);
    } catch {
      // hata zaten state'te tutuluyor
    }
  }

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError   = state === 'error';

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition sm:w-auto ${
          isSuccess
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : isError
              ? 'border-mubil-300 bg-mubil-50 text-mubil-700 hover:bg-mubil-100'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSuccess ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {isLoading
          ? 'Konum alınıyor…'
          : isSuccess
            ? 'Konumu Yenile'
            : isError
              ? 'Tekrar Dene'
              : 'Mevcut Konumumu Kullan'}
      </button>

      {/* Başarılı — doğruluk + zaman */}
      {isSuccess && position && (
        <DogrulukRozet position={position} />
      )}

      {/* Hata mesajı */}
      {isError && error && (
        <div className="flex items-start gap-2 rounded-lg border border-mubil-200 bg-mubil-50 p-2.5 text-xs text-mubil-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}

function DogrulukRozet({ position }) {
  const seviye = dogrulukSeviyesi(position.accuracy);
  const zaman  = zamanFarki(position.timestamp);
  const acc    = Math.round(position.accuracy || 0);

  return (
    <div className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs ring-1 ring-inset ${RENK_SINIF[seviye.renk]}`}>
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="font-medium">
          ±{acc}m hassasiyet ({seviye.etiket})
        </span>
      </div>
      {zaman && <span className="opacity-70">{zaman}</span>}
    </div>
  );
}
