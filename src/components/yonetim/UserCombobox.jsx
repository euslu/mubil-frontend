import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, X } from 'lucide-react';
import { searchUsers } from '../../api/admin.js';

export default function UserCombobox({ value, onChange, placeholder = 'Kullanıcı ara...' }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [activeIx, setActiveIx] = useState(-1);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await searchUsers(query);
        setResults(r.kayitlar || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function pick(u) {
    onChange(u);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function onKey(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIx >= 0) pick(results[activeIx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-mubil-200 bg-mubil-50/40 p-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mubil-100 text-mubil-700">
          <User className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-slate-900">{value.displayName}</div>
          <div className="truncate text-xs text-slate-500">
            {value.username}
            {value.title && ` · ${value.title}`}
          </div>
          {value.department && (
            <div className="truncate text-[11px] text-slate-400">{value.department}</div>
          )}
        </div>
        <button
          onClick={() => onChange(null)}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Seçimi kaldır"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIx(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          className="input-mubil pl-9"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length === 0 && !loading && (
            <div className="p-3 text-center text-sm text-slate-500">
              {`"${query}" için kullanıcı bulunamadı`}
            </div>
          )}
          {results.map((u, ix) => (
            <button
              key={u.username}
              type="button"
              onMouseEnter={() => setActiveIx(ix)}
              onClick={() => pick(u)}
              className={`flex w-full items-center gap-2 border-b border-slate-100 p-2 text-left transition last:border-0 ${
                ix === activeIx ? 'bg-mubil-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">{u.displayName}</div>
                <div className="truncate text-xs text-slate-500">
                  {u.username}
                  {u.title && ` · ${u.title}`}
                </div>
                {u.department && (
                  <div className="truncate text-[11px] text-slate-400">{u.department}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
