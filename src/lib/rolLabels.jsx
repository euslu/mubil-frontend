// src/lib/rolLabels.jsx

export const ROL_SEVIYE = {
  admin: 5, daire_baskani: 4, mudur: 3, sef: 2, personel: 1, user: 0,
};

export const ROL_ETIKET = {
  admin: 'Admin', daire_baskani: 'Daire Başkanı', mudur: 'Müdür',
  sef: 'Şef', personel: 'Personel', user: 'Kullanıcı',
};

export const ROL_BADGE_CLASS = {
  admin:         'bg-mubil-100 text-mubil-700 ring-mubil-300',
  daire_baskani: 'bg-warning-500/10 text-warning-700 ring-warning-300',
  mudur:         'bg-amber-100 text-amber-800 ring-amber-300',
  sef:           'bg-blue-50 text-blue-700 ring-blue-200',
  personel:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  user:          'bg-slate-100 text-slate-600 ring-slate-200',
};

export function RolBadge({ role }) {
  const cls = ROL_BADGE_CLASS[role] || ROL_BADGE_CLASS.user;
  const lbl = ROL_ETIKET[role] || role || '—';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {lbl}
    </span>
  );
}
