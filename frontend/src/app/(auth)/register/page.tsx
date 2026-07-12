'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center px-4 bg-zinc-50">
      <div className="w-full max-w-[380px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-zinc-400">
            Lengkapi data di bawah ini untuk membuat akun baru Anda
          </p>
        </div>

        <div className="shadcn-card p-6 shadow-sm bg-white space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
              <h3 className="text-base font-bold text-zinc-900">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-zinc-500">Menghubungkan Anda ke halaman masuk...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-650">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadcn-input block w-full px-3 py-2 text-sm placeholder-zinc-400 border-zinc-200 bg-white"
                  placeholder="Nama Lengkap Anda"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadcn-input block w-full px-3 py-2 text-sm placeholder-zinc-400 border-zinc-200 bg-white"
                  placeholder="nama@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadcn-input block w-full px-3 py-2 text-sm placeholder-zinc-400 border-zinc-200 bg-white"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="shadcn-btn-primary w-full py-2 text-sm flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent"></div>
                ) : (
                  'Buat Akun Baru'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="px-8 text-center text-xs text-zinc-500">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-zinc-800 font-semibold transition-all">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
