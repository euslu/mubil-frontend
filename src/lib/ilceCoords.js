// src/lib/ilceCoords.js
// Muğla 13 ilçesinin yaklaşık merkez koordinatları.
// Kaynak: Vikipedia + Yandex/Google harita sağlamaları (5 ondalık ~1m hassasiyet).
// GPS'i olmayan tarihsel kayıtlar için fallback olarak kullanılır.
// Marker'lar bu koordinatın etrafında küçük bir jitter ile yayılır.

export const ILCE_KOORDINATLARI = {
  Bodrum:        { enlem: 37.0344, boylam: 27.4305 },
  Dalaman:       { enlem: 36.7686, boylam: 28.7950 },
  Datça:         { enlem: 36.7325, boylam: 27.6850 },
  Fethiye:       { enlem: 36.6217, boylam: 29.1167 },
  Kavaklıdere:   { enlem: 37.4486, boylam: 28.4267 },
  Köyceğiz:      { enlem: 36.9719, boylam: 28.6906 },
  Marmaris:      { enlem: 36.8550, boylam: 28.2738 },
  Menteşe:       { enlem: 37.2152, boylam: 28.3636 },
  Milas:         { enlem: 37.3158, boylam: 27.7833 },
  Ortaca:        { enlem: 36.8336, boylam: 28.7589 },
  Seydikemer:    { enlem: 36.6286, boylam: 29.3061 },
  Ula:           { enlem: 37.1058, boylam: 28.4153 },
  Yatağan:       { enlem: 37.3406, boylam: 28.1394 },
};

// Muğla ilinin genel haritada görünmesi için varsayılan merkez + zoom
export const MUGLA_CENTER = [36.95, 28.40];
export const MUGLA_ZOOM   = 9;

/**
 * Bir koordinatı küçük bir rastgele offset ile çepeçevre dağıt.
 * Aynı ilçenin merkezinde 200 marker üst üste binmesin diye.
 * Deterministik (id'ye göre seed) — her render aynı yere düşer.
 */
export function jitterCoord(enlem, boylam, seed = 0) {
  // ~500 m yarıçapında dağılım (0.005 derece ≈ ~500m)
  const radius = 0.005;
  // Basit deterministik PRNG (sin tabanlı, hash benzeri)
  function rand(s) {
    const x = Math.sin(s * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  }
  const angle = rand(seed) * 2 * Math.PI;
  const dist  = rand(seed + 1) * radius;
  return {
    enlem:  enlem  + Math.cos(angle) * dist,
    boylam: boylam + Math.sin(angle) * dist,
  };
}

/**
 * Bir kayıt için harita koordinatı çöz.
 *   - Gerçek GPS varsa onu döner (approximate=false)
 *   - Yoksa ilçe merkezini jitter'la döner (approximate=true)
 *   - İlçe de bilinmiyorsa null döner (haritada gösterme)
 */
export function resolveKayitKoord(kayit) {
  if (kayit.enlem != null && kayit.boylam != null) {
    return {
      enlem: kayit.enlem,
      boylam: kayit.boylam,
      approximate: false,
    };
  }
  const ilceAd = kayit.ilce?.ad;
  const merkez = ILCE_KOORDINATLARI[ilceAd];
  if (!merkez) return null;
  const j = jitterCoord(merkez.enlem, merkez.boylam, kayit.id);
  return { ...j, approximate: true };
}
