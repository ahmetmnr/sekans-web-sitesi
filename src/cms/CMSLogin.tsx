// CMS Giriş Sayfası
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, User, AlertCircle } from 'lucide-react';

export function CMSLogin() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || 'Giriş başarısız');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-white tracking-wider">sekans</h1>
          <p className="text-gray-400 text-sm mt-1">sinema kültürü dergisi</p>
        </div>

        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-gray-300" />
            </div>
            <CardTitle className="text-xl text-white">Yönetim Paneli</CardTitle>
            <CardDescription className="text-gray-400">
              Devam etmek için giriş yapın
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Kullanıcı Adı
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınızı girin"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-6">
          Bu alan sadece yetkili kullanıcılar içindir.
        </p>
      </div>
    </div>
  );
}

export default CMSLogin;
