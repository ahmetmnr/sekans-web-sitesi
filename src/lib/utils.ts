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
