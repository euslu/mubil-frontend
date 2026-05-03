// src/lib/talepLabels.jsx

export const TIP_ETIKET = {
  bug:          'Hata',
  feature:      'Yeni Özellik',
  iyilestirme:  'İyileştirme',
};

export const TIP_BADGE = {
  bug:          'bg-mubil-50 text-mubil-700 ring-mubil-200',
  feature:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  iyilestirme:  'bg-blue-50 text-blue-700 ring-blue-200',
};

export const ONCELIK_ETIKET = {
  dusuk:    'Düşük',
  orta:     'Orta',
  yuksek:   'Yüksek',
  kritik:   'Kritik',
};

export const ONCELIK_BADGE = {
  dusuk:    'bg-slate-100 text-slate-700 ring-slate-200',
  orta:     'bg-amber-50 text-amber-700 ring-amber-200',
  yuksek:   'bg-warning-500/10 text-warning-700 ring-warning-300',
  kritik:   'bg-mubil-100 text-mubil-700 ring-mubil-300',
};

export const DURUM_ETIKET = {
  yeni:         'Yeni',
  incelemede:   'İncelemede',
  yapiliyor:    'Yapılıyor',
  tamamlandi:   'Tamamlandı',
  reddedildi:   'Reddedildi',
};

export const DURUM_BADGE = {
  yeni:         'bg-blue-50 text-blue-700 ring-blue-200',
  incelemede:   'bg-amber-50 text-amber-800 ring-amber-200',
  yapiliyor:    'bg-warning-500/10 text-warning-700 ring-warning-300',
  tamamlandi:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  reddedildi:   'bg-slate-100 text-slate-600 ring-slate-200',
};

export function TipBadge({ tip }) {
  const cls = TIP_BADGE[tip] || TIP_BADGE.iyilestirme;
  const lbl = TIP_ETIKET[tip] || tip;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {lbl}
    </span>
  );
}

export function OncelikBadge({ oncelik }) {
  const cls = ONCELIK_BADGE[oncelik] || ONCELIK_BADGE.orta;
  const lbl = ONCELIK_ETIKET[oncelik] || oncelik;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {lbl}
    </span>
  );
}

export function DurumBadge({ durum }) {
  const cls = DURUM_BADGE[durum] || DURUM_BADGE.yeni;
  const lbl = DURUM_ETIKET[durum] || durum;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {lbl}
    </span>
  );
}
