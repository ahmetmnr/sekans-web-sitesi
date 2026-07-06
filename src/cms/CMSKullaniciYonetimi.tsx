// CMS Kullanıcı Yönetimi - editör hesaplarını admin panelinden aç/düzenle/pasifleştir.
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import type { Kullanici } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, UserCog, ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';

interface FormState {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  isActive: boolean;
}

const EMPTY_FORM: FormState = { username: '', password: '', name: '', email: '', role: 'editor', isActive: true };

export function CMSKullaniciYonetimi() {
  const { user } = useAuth();
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Kullanici | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setKullanicilar(await api.kullanicilar.list());
    } catch (e) {
      alert((e as ApiError).message || 'Kullanıcılar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  };

  const openEdit = (k: Kullanici) => {
    setEditing(k);
    setForm({
      username: k.username,
      password: '',
      name: k.name,
      email: k.email ?? '',
      role: k.role,
      isActive: k.isActive,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        const patch: Partial<{ name: string; email: string; role: 'admin' | 'editor'; isActive: boolean; password: string }> = {
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
        };
        if (form.password.trim() !== '') patch.password = form.password;
        const saved = await api.kullanicilar.update(editing.id, patch);
        setKullanicilar((prev) => prev.map((k) => (k.id === saved.id ? saved : k)));
      } else {
        if (!form.username.trim()) return alert('Kullanıcı adı gerekli.');
        if (form.password.length < 6) return alert('Şifre en az 6 karakter olmalı.');
        if (!form.name.trim()) return alert('İsim gerekli.');
        const saved = await api.kullanicilar.create({
          username: form.username.trim(),
          password: form.password,
          name: form.name.trim(),
          role: form.role,
          email: form.email.trim() || undefined,
        });
        setKullanicilar((prev) => [...prev, saved]);
      }
      setShowDialog(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      alert((e as ApiError).message || 'Kaydetme sırasında hata oluştu.');
    }
  };

  const handleDelete = async (k: Kullanici) => {
    try {
      await api.kullanicilar.remove(k.id);
      setKullanicilar((prev) => prev.filter((x) => x.id !== k.id));
    } catch (e) {
      alert((e as ApiError).message || 'Silme başarısız.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-gray-600 mt-1">
            Editör ve yönetici hesaplarını yönetin. Her editör kendi hesabıyla paralel çalışabilir.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hesaplar</CardTitle>
          <CardDescription>Toplam {kullanicilar.length} kullanıcı</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Yükleniyor...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Ad</TableHead>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Giriş</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kullanicilar.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell>
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        {k.role === 'admin'
                          ? <ShieldCheck className="h-5 w-5 text-blue-600" />
                          : <UserIcon className="h-5 w-5 text-gray-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {k.name}
                      {user?.id === k.id && (
                        <span className="ml-2 text-xs text-blue-600">(siz)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">{k.username}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        k.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {k.role === 'admin' ? 'Yönetici' : 'Editör'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        k.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {k.isActive ? 'Etkin' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {k.lastLoginAt ? new Date(k.lastLoginAt).toLocaleString('tr-TR') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(k)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={user?.id === k.id}
                              title={user?.id === k.id ? 'Kendi hesabınızı silemezsiniz' : 'Kullanıcıyı sil'}
                            >
                              <Trash2 className={`h-4 w-4 ${user?.id === k.id ? 'text-gray-300' : 'text-red-500'}`} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{k.name}" ({k.username}) hesabını silmek istediğinizden emin misiniz?
                                Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(k)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {kullanicilar.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Henüz kullanıcı yok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Kullanıcı Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              {editing ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Bilgileri güncelleyin. Şifreyi değiştirmek istemiyorsanız boş bırakın.'
                : 'Yeni bir editör veya yönetici hesabı oluşturun.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="k-name">Ad Soyad *</Label>
              <Input
                id="k-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Örn. Ayşe Yılmaz"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="k-username">Kullanıcı Adı *</Label>
              <Input
                id="k-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="giriş adı"
                disabled={!!editing}
                className="mt-1"
              />
              {editing && (
                <p className="mt-1 text-xs text-muted-foreground">Kullanıcı adı değiştirilemez.</p>
              )}
            </div>

            <div>
              <Label htmlFor="k-password">{editing ? 'Yeni Şifre' : 'Şifre *'}</Label>
              <Input
                id="k-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? 'Değiştirmek için doldurun (en az 6 karakter)' : 'En az 6 karakter'}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="k-email">E-posta</Label>
              <Input
                id="k-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="opsiyonel"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="k-role">Rol</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as 'admin' | 'editor' })}>
                  <SelectTrigger id="k-role" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editör</SelectItem>
                    <SelectItem value="admin">Yönetici</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editing && (
                <div className="flex items-center gap-2 pb-2">
                  <Switch
                    id="k-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                  <Label htmlFor="k-active">Etkin</Label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>İptal</Button>
            <Button onClick={handleSubmit}>{editing ? 'Güncelle' : 'Oluştur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
