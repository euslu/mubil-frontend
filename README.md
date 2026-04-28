# MUBİL — Muğla Afet Bilgi Sistemi (Frontend)

Muğla Büyükşehir Belediyesi — Afet İşleri ve Risk Yönetimi Daire Başkanlığı için
saha olay kayıt ve takip sistemi. `belediye-portal` projesinin yan modülü olarak
ana portal'ın `MubilRole` tablosu ve `/api/mubil/*` endpoint'leri üzerinden
çalışır.

## Mimari

```
mubil.mugla.bel.tr (nginx + SSL)
  /         → bu proje (dist/)
  /api/*    → ana portal backend (10.5.1.180:3001) — proxy_pass

ysbtest.mugla.bel.tr/api/auth/login üzerinden token alınır.
Token JWT içinde `mubilAccess: true` flag'i taşır; yoksa giriş engellenir.
```

## Stack

- React 18 + Vite 5
- React Router 6
- Tailwind CSS 3
- Axios
- lucide-react (ikon)

## Geliştirme

```bash
npm install
cp .env.example .env       # gerekirse VITE_API_PROXY'yi düzenle
npm run dev                # http://localhost:5174
```

`npm run dev` ile geldiği `/api/*` istekleri Vite proxy üzerinden
`https://ysbtest.mugla.bel.tr/api/*`'a yönlenir.

## Build & deploy

`main` branch'e push → GitHub Actions otomatik build + deploy

```
push main ─→ [npm ci] ─→ [vite build] ─→ [rsync dist/] ─→ [health check]
```

Manuel deploy:

```bash
npm run build
sshpass -p "$DEPLOY_PASS" rsync -az --delete \
  dist/ mbb@10.5.1.180:/var/www/mubil-frontend/dist/
```

### GitHub Secrets

| Secret | Değer |
| --- | --- |
| `DEPLOY_HOST` | `10.5.1.180` |
| `DEPLOY_USER` | `mbb` |
| `DEPLOY_PASS` | (mbb şifresi) |

## Renk paleti

```
mubil-600    #DC2626   primary      acil kırmızı
warning-600  #EA580C   secondary    uyarı turuncu
amber-500    #F59E0B   warning      orta seviye
```

## Yapı

```
src/
├── api/           # backend endpoint wrapper'ları
├── components/    # Layout, PrivateRoute, ortak UI
├── context/       # AuthContext
├── lib/           # api.js (axios instance)
├── pages/         # Login, Dashboard, ileride OlayKayit/Liste/Harita
├── App.jsx        # router
├── main.jsx       # entry
└── index.css      # tailwind + custom utility'ler
```

## Roadmap

- [x] Login + auth flow
- [x] Dashboard iskeleti
- [ ] Olay kayıt formu (kategori → alt tür dropdown'ı, ilçe seçimi)
- [ ] Olay listesi (filtre, arama, export)
- [ ] Harita görünümü (Leaflet, ilçe bazlı kümeleme)
- [ ] İstatistik raporları (kategori/ilçe/zaman bazlı grafikler)
- [ ] Yetki yönetim paneli (sef+)
- [ ] Tarihsel veri (2025-2026) görüntüleme
