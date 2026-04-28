import { useEffect, useState, useCallback } from 'react';
import { fetchMasterAll } from '../api/master';

// Modül-seviyesi cache: bir kez yüklenir, oturum boyu bellekte kalır.
let _cache = null;
let _inflight = null;

async function loadOnce() {
  if (_cache) return _cache;
  if (_inflight) return _inflight;
  _inflight = fetchMasterAll().then((data) => {
    _cache = data;
    _inflight = null;
    return data;
  }).catch((err) => {
    _inflight = null;
    throw err;
  });
  return _inflight;
}

export function clearMasterCache() {
  _cache = null;
  _inflight = null;
}

export function useMaster() {
  const [data,    setData]    = useState(_cache);
  const [loading, setLoading] = useState(!_cache);
  const [error,   setError]   = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      clearMasterCache();
      const d = await loadOnce();
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (_cache) {
      setData(_cache);
      setLoading(false);
      return;
    }
    let cancelled = false;
    loadOnce()
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e?.response?.data?.error || e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return {
    ilceler:     data?.ilceler     || [],
    birimler:    data?.birimler    || [],
    kategoriler: data?.kategoriler || [],
    loading,
    error,
    reload,
  };
}
