'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError('Credenciales inválidas'); return; }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/admin');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6 py-12">
      <div className="w-full max-w-[360px]" role="region" aria-label="Inicio de sesión">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 w-10 h-10 rounded-[10px] bg-[#06231C] flex items-center justify-center">
            <span className="font-serif-display text-[19px] leading-none text-white/90">M</span>
          </div>
          <h1 className="font-serif-display text-[34px] font-medium text-[#17201C] mb-1.5">MenuV2</h1>
          <p className="text-[13px] text-[#8D9590] tracking-wide">Panel administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-5" noValidate>
          {error && (
            <div className="px-3.5 py-2.5 rounded-[8px] text-[13px] bg-[#FDECEA] text-[#B42318]" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@restaurante.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-2">
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
