import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AraYazi, Yazar } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Bir ara yazının tüm kategorileri (çoklu kategori; yoksa birincil kategoriye düşer). */
export function araYaziKategorileri(y: AraYazi): string[] {
  if (y.kategoriler && y.kategoriler.length > 0) return y.kategoriler
  return y.kategori ? [y.kategori] : []
}

/**
 * Bir yazının tüm yazarları (çoklu yazar; yoksa birincil yazara düşer).
 * Sıra korunur: ilk eleman birincil yazardır.
 */
export function yaziYazarlari(y: { yazar?: Yazar | null; yazarlar?: Yazar[] }): Yazar[] {
  if (y.yazarlar && y.yazarlar.length > 0) return y.yazarlar
  return y.yazar ? [y.yazar] : []
}

/** Çok yazarlı yazılar için görünen ad dizisi: "Ada Bir ve Ada İki". */
export function yazarAdlari(y: { yazar?: Yazar | null; yazarlar?: Yazar[] }): string {
  const adlar = yaziYazarlari(y).map((k) => k.tamAd).filter(Boolean)
  if (adlar.length === 0) return ''
  if (adlar.length === 1) return adlar[0]
  return `${adlar.slice(0, -1).join(', ')} ve ${adlar[adlar.length - 1]}`
}

/**
 * Bir sayının GÖRÜNEN adı. CMS'te ad girilmişse (menuEtiket) AYNEN kullanılır —
 * başına "Sayı" gibi bir önek EKLENMEZ. Girilmemişse "Sekans e27" biçimine düşer.
 */
export function sayiAdi(s: { numara?: string; menuEtiket?: string | null; tamBaslik?: string }): string {
  const ozel = s.menuEtiket?.trim()
  if (ozel) return ozel
  if (s.numara?.trim()) return `Sekans ${s.numara.trim()}`
  return s.tamBaslik?.trim() ?? ''
}
