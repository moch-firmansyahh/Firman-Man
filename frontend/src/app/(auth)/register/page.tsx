'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const { register, loading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan lengkapi data Anda.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background text-foreground transition-colors duration-200">
      <div className="w-full max-w-[380px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi data di bawah ini untuk membuat akun baru Anda
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">Registrasi</CardTitle>
            <CardDescription>Buat akun baru untuk mulai memantau keuangan harian</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-emerald-600 animate-pulse" />
                <h3 className="text-base font-bold">Pendaftaran Berhasil!</h3>
                <p className="text-xs text-muted-foreground">Menghubungkan Anda ke halaman masuk...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="bg-background border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="bg-background border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="bg-background border-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  ) : (
                    'Buat Akun Baru'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-xs text-muted-foreground w-full">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="underline underline-offset-4 hover:text-foreground font-semibold transition-all">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
