// src/lib/olayLabels.js
// Backend enum/string değerlerini kullanıcı dostu etiketlere çevirir.

export const OLAY_TURU_LABEL = {
  YAGMUR:  'Yağmur',
  RUZGAR:  'Rüzgar',
  KAR:     'Kar',
  DOLU:    'Dolu',
  SIS:     'Sis',
  DEPREM:  'Deprem',
  YANGIN:  'Yangın',
  HEYELAN: 'Heyelan',
  DIGER:   'Diğer',
};

export const YAGIS_LABEL = {
  SAGANAK:  'Sağanak',
  SIDDETLI: 'Şiddetli',
  FIRTINA:  'Fırtına',
  KAR:      'Kar',
  BUZLANMA: 'Buzlanma',
  DOLU:     'Dolu',
  NORMAL:   'Normal',
  YOK:      'Yok',
};

export const IHBAR_LABEL = {
  BIRIMLER:     'Birimler (saha)',
  TELEFON:      'Telefon',
  SOSYAL_MEDYA: 'Sosyal Medya',
  AKOM:         'AKOM',
  AFAD:         'AFAD',
  MUHTAR:       'Muhtar',
  VATANDAS:     'Vatandaş',
  DIGER:        'Diğer',
};

export const ALAN_LABEL = {
  KONUT:       'Konut',
  YOL:         'Yol',
  TARLA:       'Tarla',
  ISYERI:      'İşyeri',
  DERE_YATAGI: 'Dere Yatağı',
  KOPRU:       'Köprü',
  OKUL:        'Okul',
  KAMU_BINASI: 'Kamu Binası',
  DIGER:       'Diğer',
};

export const HASAR_LABEL = {
  YOK:               'Hasar Yok',
  VAR_MADDI:         'Maddi Hasar',
  VAR_ARAC:          'Araç Hasarı',
  VAR_CAN_KAYBI:     'Can Kaybı',
  DEGERLENDIRILIYOR: 'Değerlendiriliyor',
};

export const DURUM_LABEL = {
  ACIK:        'Açık',
  MUDAHALEDE:  'Müdahalede',
  TAMAMLANDI:  'Tamamlandı',
  IPTAL:       'İptal',
};

export const DURUM_BADGE_CLASS = {
  ACIK:       'badge-durum-acik',
  MUDAHALEDE: 'badge-durum-mudahalede',
  TAMAMLANDI: 'badge-durum-tamamlandi',
  IPTAL:      'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-300',
};

export const HASAR_BADGE_CLASS = {
  YOK:               'badge-hasar-yok',
  VAR_MADDI:         'badge-hasar-maddi',
  VAR_ARAC:          'badge-hasar-maddi',
  VAR_CAN_KAYBI:     'badge-hasar-can-kaybi',
  DEGERLENDIRILIYOR: 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-300',
};

export function formatTarih(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatSaat(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
}

export function formatSure(dakika) {
  if (dakika == null) return '—';
  if (dakika < 60) return `${dakika} dk`;
  const h = Math.floor(dakika / 60);
  const m = dakika % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h}s`;
}
