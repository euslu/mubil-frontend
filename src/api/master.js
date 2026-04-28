import api from '../lib/api';

export async function fetchMasterAll() {
  const { data } = await api.get('/mubil/master/all');
  return data; // { ilceler, birimler, kategoriler: [{...turler:[]}] }
}

export async function fetchIlceler() {
  const { data } = await api.get('/mubil/master/ilceler');
  return data;
}

export async function fetchBirimler() {
  const { data } = await api.get('/mubil/master/birimler');
  return data;
}

export async function fetchKategoriler() {
  const { data } = await api.get('/mubil/master/kategoriler');
  return data;
}
