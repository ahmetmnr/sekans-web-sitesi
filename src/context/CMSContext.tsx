// CMS Context — API tabanlı veri yönetimi (localStorage YOK).
// useCMS() veri şekli aynı kalır; bileşenler değişmez. Mutator'lar artık async.
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Sayi, AraYazi, Yazar, Kategori, ArsivSayi, Yazi } from '@/types';
import { api, type YarismaBilgi, type HakkimizdaIcerik } from '@/lib/api';

// Boş yer tutucu Sayi — bootstrap çözülene kadar okuma çökmesin.
const EMPTY_SAYI: Sayi = {
  id: '', numara: '', ay: '', yil: 0, tamBaslik: '',
  kapakGorseli: '', pdfUrl: '', yazilar: [], yayinTarihi: '',
};
const EMPTY_YARISMA: YarismaBilgi = { baslik: '', aciklama: '', gecmisKazananlar: [] };
const EMPTY_HAKKIMIZDA: HakkimizdaIcerik = {
  baslik: '', icerik: '',
  iletisim: { email: '', adres: '', sosyal: { twitter: '', instagram: '', facebook: '' } },
};

interface CMSContextType {
  // Veriler
  sonSayi: Sayi;
  arsivSayilari: ArsivSayi[];
  araYazilar: AraYazi[];
  yazarlar: Yazar[];
  kategoriler: Kategori[];
  yarismasiBilgi: YarismaBilgi;
  hakkimizdaIcerik: HakkimizdaIcerik;

  // Yükleme durumu
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;

  // Sayı işlemleri
  setSonSayi: (sayi: Sayi) => Promise<void>;
  addArsivSayi: (sayi: Partial<ArsivSayi>) => Promise<void>;
  updateArsivSayi: (id: string, sayi: Partial<ArsivSayi>) => Promise<void>;
  deleteArsivSayi: (id: string) => Promise<void>;
  publishSonSayi: () => Promise<void>;

  // Yazı işlemleri
  addYazi: (yazi: Partial<Yazi> & { yazarId?: string; kategoriId?: string }) => Promise<void>;
  updateYazi: (id: string, yazi: Partial<Yazi> & { yazarId?: string; kategoriId?: string }) => Promise<void>;
  deleteYazi: (id: string) => Promise<void>;

  // Ara yazı işlemleri
  addAraYazi: (araYazi: Partial<AraYazi> & { yazarId?: string }) => Promise<void>;
  updateAraYazi: (id: string, araYazi: Partial<AraYazi> & { yazarId?: string }) => Promise<void>;
  deleteAraYazi: (id: string) => Promise<void>;

  // Yazar işlemleri
  addYazar: (yazar: Partial<Yazar>) => Promise<void>;
  updateYazar: (id: string, yazar: Partial<Yazar>) => Promise<void>;
  deleteYazar: (id: string) => Promise<void>;

  // Kategori işlemleri
  addKategori: (kategori: Partial<Kategori>) => Promise<void>;
  updateKategori: (id: string, kategori: Partial<Kategori>) => Promise<void>;
  deleteKategori: (id: string) => Promise<void>;

  // Yarışma işlemleri
  updateYarismasiBilgi: (bilgi: Partial<YarismaBilgi>) => Promise<void>;
  addYarismaKazanan: (kazanan: { yil: number; birinci: string; ikinci: string }) => Promise<void>;

  // Hakkımızda işlemleri
  updateHakkimizdaIcerik: (icerik: Partial<HakkimizdaIcerik>) => Promise<void>;

  // Yardımcı (admin)
  resetToDefaults: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<boolean>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [sonSayi, setSonSayiState] = useState<Sayi>(EMPTY_SAYI);
  const [arsivSayilari, setArsivSayilari] = useState<ArsivSayi[]>([]);
  const [araYazilar, setAraYazilar] = useState<AraYazi[]>([]);
  const [yazarlar, setYazarlar] = useState<Yazar[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [yarismasiBilgi, setYarismasiBilgi] = useState<YarismaBilgi>(EMPTY_YARISMA);
  const [hakkimizdaIcerik, setHakkimizdaIcerik] = useState<HakkimizdaIcerik>(EMPTY_HAKKIMIZDA);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const d = await api.bootstrap();
      setSonSayiState(d.sonSayi ?? EMPTY_SAYI);
      setArsivSayilari(d.arsivSayilari ?? []);
      setAraYazilar(d.araYazilar ?? []);
      setYazarlar(d.yazarlar ?? []);
      setKategoriler(d.kategoriler ?? []);
      setYarismasiBilgi(d.yarismasiBilgi ?? EMPTY_YARISMA);
      setHakkimizdaIcerik(d.hakkimizdaIcerik ?? EMPTY_HAKKIMIZDA);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Veri yüklenemedi'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  // --- Sayı ---
  const setSonSayi = useCallback(async (sayi: Sayi) => {
    const updated = await api.sonSayi.update(sayi);
    setSonSayiState(updated);
  }, []);

  const publishSonSayi = useCallback(async () => {
    const arsiv = await api.sonSayi.publish();
    setArsivSayilari((prev) => [arsiv, ...prev]);
  }, []);

  const addArsivSayi = useCallback(async (sayi: Partial<ArsivSayi>) => {
    const saved = await api.arsiv.create(sayi);
    setArsivSayilari((prev) => [saved, ...prev]);
  }, []);

  const updateArsivSayi = useCallback(async (id: string, updates: Partial<ArsivSayi>) => {
    const saved = await api.arsiv.update(id, updates);
    setArsivSayilari((prev) => prev.map((s) => (s.id === id ? saved : s)));
  }, []);

  const deleteArsivSayi = useCallback(async (id: string) => {
    await api.arsiv.remove(id);
    setArsivSayilari((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // --- Yazı (sayı içi) ---
  const addYazi = useCallback(async (yazi: Partial<Yazi> & { yazarId?: string; kategoriId?: string }) => {
    const saved = await api.yazi.create(yazi);
    setSonSayiState((prev) => ({ ...prev, yazilar: [...prev.yazilar, saved] }));
  }, []);

  const updateYazi = useCallback(async (id: string, updates: Partial<Yazi> & { yazarId?: string; kategoriId?: string }) => {
    const saved = await api.yazi.update(id, updates);
    setSonSayiState((prev) => ({
      ...prev,
      yazilar: prev.yazilar.map((y) => (y.id === id ? saved : y)),
    }));
  }, []);

  const deleteYazi = useCallback(async (id: string) => {
    await api.yazi.remove(id);
    setSonSayiState((prev) => ({ ...prev, yazilar: prev.yazilar.filter((y) => y.id !== id) }));
  }, []);

  // --- Ara yazı ---
  const addAraYazi = useCallback(async (araYazi: Partial<AraYazi> & { yazarId?: string }) => {
    const saved = await api.araYazi.create(araYazi);
    setAraYazilar((prev) => [saved, ...prev]);
  }, []);

  const updateAraYazi = useCallback(async (id: string, updates: Partial<AraYazi> & { yazarId?: string }) => {
    const saved = await api.araYazi.update(id, updates);
    setAraYazilar((prev) => prev.map((y) => (y.id === id ? saved : y)));
  }, []);

  const deleteAraYazi = useCallback(async (id: string) => {
    await api.araYazi.remove(id);
    setAraYazilar((prev) => prev.filter((y) => y.id !== id));
  }, []);

  // --- Yazar ---
  const addYazar = useCallback(async (yazar: Partial<Yazar>) => {
    const saved = await api.yazar.create(yazar);
    setYazarlar((prev) => [...prev, saved]);
  }, []);

  const updateYazar = useCallback(async (id: string, updates: Partial<Yazar>) => {
    const saved = await api.yazar.update(id, updates);
    setYazarlar((prev) => prev.map((y) => (y.id === id ? saved : y)));
  }, []);

  const deleteYazar = useCallback(async (id: string) => {
    await api.yazar.remove(id);
    setYazarlar((prev) => prev.filter((y) => y.id !== id));
  }, []);

  // --- Kategori ---
  const addKategori = useCallback(async (kategori: Partial<Kategori>) => {
    const saved = await api.kategori.create(kategori);
    setKategoriler((prev) => [...prev, saved]);
  }, []);

  const updateKategori = useCallback(async (id: string, updates: Partial<Kategori>) => {
    const saved = await api.kategori.update(id, updates);
    setKategoriler((prev) => prev.map((k) => (k.id === id ? saved : k)));
  }, []);

  const deleteKategori = useCallback(async (id: string) => {
    await api.kategori.remove(id);
    setKategoriler((prev) => prev.filter((k) => k.id !== id));
  }, []);

  // --- Yarışma ---
  const updateYarismasiBilgi = useCallback(async (updates: Partial<YarismaBilgi>) => {
    const next: YarismaBilgi = { ...yarismasiBilgi, ...updates };
    const saved = await api.yarisma.update(next);
    setYarismasiBilgi(saved);
  }, [yarismasiBilgi]);

  const addYarismaKazanan = useCallback(async (kazanan: { yil: number; birinci: string; ikinci: string }) => {
    const next: YarismaBilgi = {
      ...yarismasiBilgi,
      gecmisKazananlar: [kazanan, ...yarismasiBilgi.gecmisKazananlar],
    };
    const saved = await api.yarisma.update(next);
    setYarismasiBilgi(saved);
  }, [yarismasiBilgi]);

  // --- Hakkımızda ---
  const updateHakkimizdaIcerik = useCallback(async (updates: Partial<HakkimizdaIcerik>) => {
    const next: HakkimizdaIcerik = { ...hakkimizdaIcerik, ...updates };
    const saved = await api.hakkimizda.update(next);
    setHakkimizdaIcerik(saved);
  }, [hakkimizdaIcerik]);

  // --- Admin yardımcıları ---
  const resetToDefaults = useCallback(async () => {
    await api.admin.reset();
    await refresh();
  }, [refresh]);

  const exportData = useCallback(async () => {
    const data = await api.admin.export();
    return JSON.stringify(data, null, 2);
  }, []);

  const importData = useCallback(async (jsonData: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonData);
      await api.admin.import(data);
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [refresh]);

  const value: CMSContextType = {
    sonSayi, arsivSayilari, araYazilar, yazarlar, kategoriler, yarismasiBilgi, hakkimizdaIcerik,
    isLoading, error, refresh,
    setSonSayi, addArsivSayi, updateArsivSayi, deleteArsivSayi, publishSonSayi,
    addYazi, updateYazi, deleteYazi,
    addAraYazi, updateAraYazi, deleteAraYazi,
    addYazar, updateYazar, deleteYazar,
    addKategori, updateKategori, deleteKategori,
    updateYarismasiBilgi, addYarismaKazanan,
    updateHakkimizdaIcerik,
    resetToDefaults, exportData, importData,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
