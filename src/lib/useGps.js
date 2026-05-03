// src/lib/useGps.js
// Browser Geolocation hook'u.
//
// Davranış:
// - getCurrentPosition tek bir okuma yapar (watch değil)
// - localStorage flag'i: 'mubil_gps_izin' = 'verildi' | 'reddedildi' | undefined
//   → İlk başarılı okumadan sonra 'verildi', otomatik dene davranışı açılır
//   → Reddedilirse 'reddedildi', otomatik dene davranışı kapalı
// - state: idle | loading | success | error
// - position: { lat, lng, accuracy, timestamp }
// - error: { code, message } — kullanıcı dostu Türkçe mesajlar

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'mubil_gps_izin';
const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

const ERROR_MESAJLARI = {
  PERMISSION_DENIED:
    'Konum izni reddedildi. Tarayıcınızda site ayarlarından izin verebilirsiniz.',
  POSITION_UNAVAILABLE:
    'Konum alınamadı. Açık alana çıkıp tekrar deneyin veya manuel giriş yapın.',
  TIMEOUT:
    'Konum alma süresi aşıldı. Sinyal güçlü bir yere geçip tekrar deneyin.',
  NOT_SUPPORTED:
    'Tarayıcınız konum hizmetini desteklemiyor.',
  NOT_SECURE:
    'Konum sadece güvenli bağlantıda (HTTPS) çalışır.',
  UNKNOWN:
    'Konum alınırken bir hata oluştu.',
};

function getStoredPermission() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredPermission(value) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch { /* localStorage devre dışı, görmezden gel */ }
}

export function useGps() {
  const [state, setState]       = useState('idle');     // idle|loading|success|error
  const [position, setPosition] = useState(null);
  const [error, setError]       = useState(null);
  // İzin durumu (ileride otomatik dene davranışı için)
  const [izinDurum, setIzinDurum] = useState(getStoredPermission()); // 'verildi'|'reddedildi'|null

  // Cancel flag (component unmount'ta sonuç yazılmasın)
  const cancelRef = useRef(false);
  useEffect(() => {
    cancelRef.current = false;
    return () => { cancelRef.current = true; };
  }, []);

  const oku = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      // Tarayıcı destekliyor mu?
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        const err = { code: 'NOT_SUPPORTED', message: ERROR_MESAJLARI.NOT_SUPPORTED };
        if (!cancelRef.current) {
          setError(err);
          setState('error');
        }
        return reject(err);
      }

      // HTTPS kontrolü (localhost istisna)
      if (typeof window !== 'undefined' && window.location) {
        const isLocalhost = window.location.hostname === 'localhost'
                         || window.location.hostname === '127.0.0.1';
        if (window.location.protocol !== 'https:' && !isLocalhost) {
          const err = { code: 'NOT_SECURE', message: ERROR_MESAJLARI.NOT_SECURE };
          if (!cancelRef.current) {
            setError(err);
            setState('error');
          }
          return reject(err);
        }
      }

      if (!cancelRef.current) {
        setState('loading');
        setError(null);
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result = {
            lat:       pos.coords.latitude,
            lng:       pos.coords.longitude,
            accuracy:  pos.coords.accuracy,    // metre cinsinden
            timestamp: pos.timestamp,
          };
          if (!cancelRef.current) {
            setPosition(result);
            setState('success');
            // İlk başarılı okumadan sonra izin "verildi" olarak kaydet
            if (izinDurum !== 'verildi') {
              setStoredPermission('verildi');
              setIzinDurum('verildi');
            }
          }
          resolve(result);
        },
        (geoErr) => {
          let code = 'UNKNOWN';
          if (geoErr.code === geoErr.PERMISSION_DENIED) {
            code = 'PERMISSION_DENIED';
            setStoredPermission('reddedildi');
            if (!cancelRef.current) setIzinDurum('reddedildi');
          } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
            code = 'POSITION_UNAVAILABLE';
          } else if (geoErr.code === geoErr.TIMEOUT) {
            code = 'TIMEOUT';
          }
          const err = { code, message: ERROR_MESAJLARI[code] || ERROR_MESAJLARI.UNKNOWN };
          if (!cancelRef.current) {
            setError(err);
            setState('error');
          }
          reject(err);
        },
        { ...DEFAULT_OPTIONS, ...options },
      );
    });
  }, [izinDurum]);

  const reset = useCallback(() => {
    setState('idle');
    setPosition(null);
    setError(null);
  }, []);

  // Kullanıcı isterse izin flag'ini elle sıfırlasın (debug için)
  const izinSifirla = useCallback(() => {
    setStoredPermission(null);
    setIzinDurum(null);
  }, []);

  return {
    state, position, error,
    izinDurum,                  // 'verildi' | 'reddedildi' | null
    otomatikDeneAcik: izinDurum === 'verildi',
    oku, reset, izinSifirla,
  };
}

// Yardımcı: doğruluk seviyesini kullanıcı dostu etikete çevir
export function dogrulukSeviyesi(accuracy) {
  if (accuracy == null) return { etiket: 'bilinmiyor', renk: 'slate' };
  if (accuracy <= 20)  return { etiket: 'yüksek',  renk: 'emerald' };
  if (accuracy <= 50)  return { etiket: 'orta',    renk: 'amber'   };
  return { etiket: 'düşük',  renk: 'mubil' };
}

// Yardımcı: zaman damgasını okunabilir formata çevir
export function zamanFarki(timestamp) {
  if (!timestamp) return null;
  const diff = Date.now() - timestamp;
  const sn = Math.floor(diff / 1000);
  if (sn < 5) return 'az önce';
  if (sn < 60) return `${sn} sn önce`;
  const dk = Math.floor(sn / 60);
  if (dk < 60) return `${dk} dk önce`;
  return `${Math.floor(dk / 60)} sa önce`;
}
