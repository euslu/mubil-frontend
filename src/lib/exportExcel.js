// src/lib/exportExcel.js
import * as XLSX from 'xlsx';
import { listOlaylar } from '../api/olay';
import {
  OLAY_TURU_LABEL, YAGIS_LABEL, IHBAR_LABEL,
  ALAN_LABEL, HASAR_LABEL, DURUM_LABEL,
  formatTarih, formatSaat,
} from './olayLabels';

/**
 * Backend'den filtrelenmiş tüm kayıtları sayfalama ile çekip Excel dosyasına yazar.
 * onProgress: (yuklenen, toplam) → ilerleme göstermek için.
 */
export async function exportOlaylariExcel(filters = {}, onProgress) {
  const PAGE = 100;
  // İlk sayfa — toplam sayıyı al
  const ilk = await listOlaylar({ ...filters, sayfa: 1, limit: PAGE });
  const toplam = ilk.toplam || 0;
  const tumKayitlar = [...(ilk.kayitlar || [])];

  if (onProgress) onProgress(tumKayitlar.length, toplam);

  const toplamSayfa = Math.ceil(toplam / PAGE);
  for (let p = 2; p <= toplamSayfa; p++) {
    const r = await listOlaylar({ ...filters, sayfa: p, limit: PAGE });
    tumKayitlar.push(...(r.kayitlar || []));
    if (onProgress) onProgress(tumKayitlar.length, toplam);
  }

  if (tumKayitlar.length === 0) {
    throw new Error('Dışa aktarılacak kayıt yok');
  }

  const rows = tumKayitlar.map((o) => ({
    'ID':                  o.id,
    'Tarih':               formatTarih(o.tarih),
    'İlçe':                o.ilce?.ad || '',
    'Mahalle / Lokasyon':  o.mahalleLokasyon || '',
    'Olay Türü':           OLAY_TURU_LABEL[o.olayTuru] || o.olayTuru || '',
    'Yağış Biçimi':        YAGIS_LABEL[o.yagisBicimi] || o.yagisBicimi || '',
    'Saatlik Yağış (mm)':  o.saatlikYagisMm ?? '',
    'Yağış Miktarı (mm)':  o.yagisMiktariMm ?? '',
    'Müdahale Kategorisi': o.mudahaleKategori?.ad || '',
    'Alt Tür':             o.mudahaleTur?.ad || '',
    'Müdahale Birimi':     o.mudahaleBirim?.ad || '',
    'Etkilenen Alan':      ALAN_LABEL[o.alanTuru] || o.alanTuru || '',
    'İhbar Kaynağı':       IHBAR_LABEL[o.ihbarKaynagi] || o.ihbarKaynagi || '',
    'Hasar':               HASAR_LABEL[o.hasarDurumu] || o.hasarDurumu || '',
    'Durum':               DURUM_LABEL[o.durum] || o.durum || '',
    'Başlangıç Saati':     o.baslangicSaati ? formatSaat(o.baslangicSaati) : '',
    'Bitiş Saati':         o.bitisSaati     ? formatSaat(o.bitisSaati)     : '',
    'Süre (dakika)':       o.sureDakika ?? '',
    'Not':                 o.notMetni || '',
    'Kaydeden':            o.createdBy || '',
    'Kayıt Tarihi':        o.createdAt ? new Date(o.createdAt).toLocaleString('tr-TR') : '',
    'Foto Sayısı':         Array.isArray(o.fotograflar) ? o.fotograflar.length : 0,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  // Kolon genişlikleri
  const colWidths = Object.keys(rows[0]).map((k) => {
    const len = Math.max(k.length, ...rows.map((r) => String(r[k] ?? '').length));
    return { wch: Math.min(Math.max(len + 2, 8), 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Olaylar');

  const ts = new Date().toISOString().slice(0, 10);
  const fname = `MUBIL_Olaylar_${ts}.xlsx`;
  XLSX.writeFile(wb, fname);

  return { dosya: fname, kayit: rows.length };
}
