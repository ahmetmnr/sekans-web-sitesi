import { ArrowLeft, Mail, MapPin, Send, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface IletisimSayfasiProps {
  onBackClick: () => void;
}

export default function IletisimSayfasi({ onBackClick }: IletisimSayfasiProps) {
  const [formData, setFormData] = useState({
    ad: '',
    email: '',
    konu: '',
    mesaj: '',
  });
  const [gonderildi, setGonderildi] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderim simülasyonu
    console.log('Form gönderildi:', formData);
    setGonderildi(true);
    setTimeout(() => {
      setGonderildi(false);
      setFormData({ ad: '', email: '', konu: '', mesaj: '' });
    }, 3000);
  };

  return (
    <main className="animate-fade-in py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Geri Butonu */}
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>

        {/* Başlık */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="page-title mb-4">İletişim</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bizimle iletişime geçmek için aşağıdaki formu kullanabilir 
            veya doğrudan e-posta adresimizden ulaşabilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          {/* İletişim Bilgileri */}
          <div>
            <h2 className="section-title mb-6">İletişim Bilgileri</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">E-posta</h3>
                  <a 
                    href="mailto:info@sekans.org"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    info@sekans.org
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Adres</h3>
                  <p className="text-muted-foreground">
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="mt-10">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Sosyal Medya
              </h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://twitter.com/sekansdergi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="https://instagram.com/sekansdergi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com/sekansdergi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="bg-muted/50 p-6 md:p-8">
            <h2 className="section-title mb-6">Bize Yazın</h2>
            
            {gonderildi ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">Mesajınız Gönderildi!</h3>
                <p className="text-muted-foreground">
                  En kısa sürede size dönüş yapacağız.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ad" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Adınız
                  </Label>
                  <Input
                    id="ad"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="konu" className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Konu
                  </Label>
                  <Input
                    id="konu"
                    type="text"
                    placeholder="Mesajınızın konusu"
                    value={formData.konu}
                    onChange={(e) => setFormData({ ...formData, konu: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mesaj" className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Mesajınız
                  </Label>
                  <Textarea
                    id="mesaj"
                    placeholder="Mesajınızı buraya yazın..."
                    rows={5}
                    value={formData.mesaj}
                    onChange={(e) => setFormData({ ...formData, mesaj: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="btn-sekans-primary w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Gönder
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
