import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AraYazi } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Bir ara yazının tüm kategorileri (çoklu kategori; yoksa birincil kategoriye düşer). */
export function araYaziKategorileri(y: AraYazi): string[] {
  if (y.kategoriler && y.kategoriler.length > 0) return y.kategoriler
  return y.kategori ? [y.kategori] : []
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
