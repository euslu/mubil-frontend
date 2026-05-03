// src/components/MahalleAutocomplete.jsx
// Debounced (250ms) mahalle autocomplete. İlçe değişirse cache temizler.
// Kullanıcı yazı yazarken backend'den distinct mahalle listesi çekilir.
//
// Kullanımı:
//   <MahalleAutocomplete
//     ilce={form.ilce}
//     value={form.mahalle}
//     onChange={(v) => setForm({ ...form, mahalle: v })}
//     placeholder="Mahalle adı"
//   />

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { fetchMahalleler } from '../api/ayarlar.js';

export default function MahalleAutocomplete({
  ilce,
  value = '',
  onChange,
  placeholder = 'Mahalle adı',
  required = false,
  disabled = false,
}) {
  const [open, setOpen]         = useState(false);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [activeIx, setActiveIx] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // İlçe değişince cache'i temizle, listeyi kapat
  useEffect(() => {
    setResults([]);
    setActiveIx(-1);
  }, [ilce]);

  // Yazı değişince debounced fetch
  useEffect(() => {
    if (!ilce) {
      setResults([]);
      return;
    }
    if ((value || '').length < 1) {
      // 1 karakter altında "popüler" göster
      setLoading(true);
      const t = setTimeout(async () => {
        try {
          const r = await fetchMahalleler(ilce, '');
          setResults(r.kayitlar || []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 100);
      return () => clearTimeout(t);
    }

    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetchMahalleler(ilce, value);
        setResults(r.kayitlar || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [value, ilce]);

  // Dış tıklama → kapat
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function pick(mahalle) {
    onChange?.(mahalle);
    setOpen(false);
    setActiveIx(-1);
    inputRef.current?.blur();
  }

  function onKey(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIx >= 0) {
      e.preventDefault();
      pick(results[activeIx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // İlçe seçilmemişse devre dışı
  const truelyDisabled = disabled || !ilce;

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={truelyDisabled ? 'Önce ilçe seçin' : placeholder}
          disabled={truelyDisabled}
          required={required}
          className="input-mubil pl-9 disabled:bg-slate-50 disabled:text-slate-400"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {open && !truelyDisabled && results.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((m, ix) => (
            <button
              key={m}
              type="button"
              onMouseEnter={() => setActiveIx(ix)}
              onClick={() => pick(m)}
              className={`flex w-full items-center px-3 py-2 text-left text-sm transition ${
                ix === activeIx ? 'bg-mubil-50 text-mubil-700' : 'hover:bg-slate-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {open && !truelyDisabled && !loading && results.length === 0 && value && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500 shadow-lg">
          {`"${value}" için kayıtlı mahalle bulunamadı — yine de istediğiniz adla devam edebilirsiniz`}
        </div>
      )}
    </div>
  );
}
