// CMS Hakkımızda Yönetimi - About Page Management
import { useEffect, useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Pencil,
  Mail,
  MapPin,
  Globe,
  FileText,
  Loader2,
} from 'lucide-react';

// Menüde "Hakkımızda" altında görünen statik sayfa (slug sabit).
const YAZI_STANDARTLARI_SLUG = 'yazi-standartlari';

export function CMSHakkimizdaYonetimi() {
  const { hakkimizdaIcerik, updateHakkimizdaIcerik } = useCMS();

  const [editingContent, setEditingContent] = useState(false);
  const [editingContact, setEditingContact] = useState(false);

  // --- Sekans Yazı Standartları (statik sayfa) ---
  const [standartBaslik, setStandartBaslik] = useState('Sekans Yazı Standartları');
  const [standartIcerik, setStandartIcerik] = useState('');
  const [standartYukleniyor, setStandartYukleniyor] = useState(true);
  const [editingStandart, setEditingStandart] = useState(false);
  const [standartForm, setStandartForm] = useState({ baslik: '', icerik: '' });
  const [standartKaydediliyor, setStandartKaydediliyor] = useState(false);

  useEffect(() => {
    let iptal = false;
    api.sayfa.get(YAZI_STANDARTLARI_SLUG)
      .then((d) => {
        if (iptal) return;
        setStandartBaslik(d.baslik || 'Sekans Yazı Standartları');
        setStandartIcerik(d.icerik || '');
      })
      .catch(() => { /* sayfa henüz yok — varsayılanlarla kal */ })
      .finally(() => { if (!iptal) setStandartYukleniyor(false); });
    return () => { iptal = true; };
  }, []);

  const handleStandartSubmit = async () => {
    setStandartKaydediliyor(true);
    try {
      const saved = await api.sayfa.update(YAZI_STANDARTLARI_SLUG, {
        baslik: standartForm.baslik || 'Sekans Yazı Standartları',
        icerik: standartForm.icerik,
      });
      setStandartBaslik(saved.baslik);
      setStandartIcerik(saved.icerik);
      setEditingStandart(false);
    } catch (error) {
      alert((error as Error).message || 'Kaydedilemedi');
    } finally {
      setStandartKaydediliyor(false);
    }
  };

  const [contentForm, setContentForm] = useState({
    baslik: hakkimizdaIcerik.baslik,
    icerik: hakkimizdaIcerik.icerik,
  });

  const [contactForm, setContactForm] = useState({
    email: hakkimizdaIcerik.iletisim.email,
    adres: hakkimizdaIcerik.iletisim.adres,
    twitter: hakkimizdaIcerik.iletisim.sosyal.twitter,
    instagram: hakkimizdaIcerik.iletisim.sosyal.instagram,
    facebook: hakkimizdaIcerik.iletisim.sosyal.facebook,
  });

  const handleContentSubmit = () => {
    updateHakkimizdaIcerik({
      baslik: contentForm.baslik,
      icerik: contentForm.icerik,
    });
    setEditingContent(false);
  };

  const handleContactSubmit = () => {
    updateHakkimizdaIcerik({
      iletisim: {
        email: contactForm.email,
        adres: contactForm.adres,
        sosyal: {
          twitter: contactForm.twitter,
          instagram: contactForm.instagram,
          facebook: contactForm.facebook,
        },
      },
    });
    setEditingContact(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hakkımızda Sayfası</h1>
        <p className="text-gray-600 mt-1">Hakkımızda sayfası içeriğini yönetin</p>
      </div>

      {/* Ana İçerik */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sayfa İçeriği</CardTitle>
              <CardDescription>Hakkımızda sayfasında görünecek ana içerik</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setContentForm({
                  baslik: hakkimizdaIcerik.baslik,
                  icerik: hakkimizdaIcerik.icerik,
                });
                setEditingContent(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Başlık</h3>
              <p className="text-gray-900 mt-1 text-lg font-semibold">{hakkimizdaIcerik.baslik}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">İçerik</h3>
              <div className="text-gray-600 mt-1 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {hakkimizdaIcerik.icerik}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>E-posta, adres ve sosyal medya hesapları</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setContactForm({
                  email: hakkimizdaIcerik.iletisim.email,
                  adres: hakkimizdaIcerik.iletisim.adres,
                  twitter: hakkimizdaIcerik.iletisim.sosyal.twitter,
                  instagram: hakkimizdaIcerik.iletisim.sosyal.instagram,
                  facebook: hakkimizdaIcerik.iletisim.sosyal.facebook,
                });
                setEditingContact(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* E-posta ve Adres */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-posta</p>
                  <p className="font-medium">{hakkimizdaIcerik.iletisim.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-medium">{hakkimizdaIcerik.iletisim.adres}</p>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Globe className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Sosyal Medya</p>
                  <div className="space-y-1 mt-1">
                    <a
                      href={hakkimizdaIcerik.iletisim.sosyal.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-sm"
                    >
                      Twitter
                    </a>
                    <a
                      href={hakkimizdaIcerik.iletisim.sosyal.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-pink-600 hover:underline text-sm"
                    >
                      Instagram
                    </a>
                    <a
                      href={hakkimizdaIcerik.iletisim.sosyal.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-800 hover:underline text-sm"
                    >
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sekans Yazı Standartları (statik sayfa) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Sekans Yazı Standartları
              </CardTitle>
              <CardDescription>
                Menüde "Hakkımızda → Sekans Yazı Standartları" altında ve İletişim sayfasında görünen sayfa.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              disabled={standartYukleniyor}
              onClick={() => {
                setStandartForm({ baslik: standartBaslik, icerik: standartIcerik });
                setEditingStandart(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {standartYukleniyor ? (
            <div className="py-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Başlık</h3>
                <p className="text-gray-900 mt-1 text-lg font-semibold">{standartBaslik}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">İçerik</h3>
                <div className="text-gray-600 mt-1 whitespace-pre-line bg-gray-50 p-4 rounded-lg min-h-[3rem]">
                  {standartIcerik || <span className="text-gray-400">Henüz içerik girilmemiş.</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* İçerik Düzenleme Dialog */}
      <Dialog open={editingContent} onOpenChange={setEditingContent}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sayfa İçeriğini Düzenle</DialogTitle>
            <DialogDescription>
              Hakkımızda sayfası içeriğini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="baslik">Başlık</Label>
              <Input
                id="baslik"
                value={contentForm.baslik}
                onChange={(e) => setContentForm({ ...contentForm, baslik: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="icerik">İçerik (Markdown desteklenir)</Label>
              <Textarea
                id="icerik"
                value={contentForm.icerik}
                onChange={(e) => setContentForm({ ...contentForm, icerik: e.target.value })}
                rows={15}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContent(false)}>
              İptal
            </Button>
            <Button onClick={handleContentSubmit}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* İletişim Düzenleme Dialog */}
      <Dialog open={editingContact} onOpenChange={setEditingContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İletişim Bilgilerini Düzenle</DialogTitle>
            <DialogDescription>
              İletişim ve sosyal medya bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="adres">Adres</Label>
              <Input
                id="adres"
                value={contactForm.adres}
                onChange={(e) => setContactForm({ ...contactForm, adres: e.target.value })}
              />
            </div>
            <div className="border-t pt-4">
              <p className="font-medium text-sm text-gray-700 mb-3">Sosyal Medya</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    value={contactForm.twitter}
                    onChange={(e) => setContactForm({ ...contactForm, twitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={contactForm.instagram}
                    onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={contactForm.facebook}
                    onChange={(e) => setContactForm({ ...contactForm, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContact(false)}>
              İptal
            </Button>
            <Button onClick={handleContactSubmit}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Yazı Standartları Düzenleme Dialog */}
      <Dialog open={editingStandart} onOpenChange={setEditingStandart}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sekans Yazı Standartlarını Düzenle</DialogTitle>
            <DialogDescription>
              Bize yazı göndermek isteyenler için standartları güncelleyin (Markdown desteklenir).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="std-baslik">Başlık</Label>
              <Input
                id="std-baslik"
                value={standartForm.baslik}
                onChange={(e) => setStandartForm({ ...standartForm, baslik: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="std-icerik">İçerik (Markdown desteklenir)</Label>
              <Textarea
                id="std-icerik"
                value={standartForm.icerik}
                onChange={(e) => setStandartForm({ ...standartForm, icerik: e.target.value })}
                rows={15}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStandart(false)}>
              İptal
            </Button>
            <Button onClick={handleStandartSubmit} disabled={standartKaydediliyor}>
              {standartKaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
