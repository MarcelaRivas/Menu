'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { hasSession } from '@/lib/session';

interface Props {
  children: ReactNode;
  active?: string;
}

export function AdminLayout({ children, active }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  // Sin sesión no se muestra el panel: se envía al inicio de sesión.
  useEffect(() => {
    if (!hasSession()) {
      window.location.replace('/admin/login');
      return;
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <Sidebar active={active} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar active={active} onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-8 sm:py-8" role="main" id="main-content">
          <div className="mx-auto w-full max-w-[1080px]">{children}</div>
        </main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
