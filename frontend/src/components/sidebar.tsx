'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getRestaurant, getUser, logout, type SessionUser } from '@/lib/session';

interface SidebarProps {
  active?: string;
  open?: boolean;
  onClose?: () => void;
}

const workspaceItems = [
  { label: 'Vista general', key: 'dashboard', href: '/admin' },
  { label: 'Restaurante y diseño', key: 'restaurant', href: '/admin/restaurant' },
  { label: 'Restaurantes y sedes', key: 'pages', href: '/admin/pages' },
  { label: 'Cartas digitales', key: 'menus', href: '/admin/menus' },
  { label: 'Categorías', key: 'categories', href: '/admin/categories' },
  { label: 'Productos', key: 'products', href: '/admin/products' },
];

const toolItems = [
  { label: 'Anuncios', key: 'ads', href: '/admin/ads' },
  { label: 'Historial', key: 'history', href: '/admin/history' },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '•';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

export function Sidebar({ active, open = false, onClose }: SidebarProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [previewHref, setPreviewHref] = useState('/');

  // Datos del usuario y vista del cliente: solo en el navegador, para no desfasar el render del servidor.
  useEffect(() => {
    setUser(getUser());
    getRestaurant().then(async (r) => {
      if (!r) return;
      const pages = await api.get<{ slug: string; active: boolean }[]>('/pages').catch(() => []);
      const first = pages.find((p) => p.active);
      setPreviewHref(first ? `/${r.slug}/${first.slug}` : `/${r.slug}`);
    });
  }, []);

  const linkClass = (key: string) => `sidebar-link ${active === key ? 'active' : ''}`;

  return (
    <>
      {/* Fondo para cerrar el menú en pantallas pequeñas */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[224px] flex-col bg-[#06231C] transition-transform md:static md:z-auto md:translate-x-0 md:min-h-screen md:flex-shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Marca */}
        <div className="flex h-[60px] flex-shrink-0 items-center gap-3 px-5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] border border-white/15">
            <span className="font-serif-display text-[15px] leading-none text-white/90">M</span>
          </div>
          <span className="text-[13px] font-medium tracking-[0.02em] text-white/95">Mesa Studio</span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-6 pt-3" aria-label="Navegación principal">
          <div>
            <p className="section-label px-3 text-white/30">Espacio de trabajo</p>
            <div className="space-y-0.5">
              {workspaceItems.map((item) => (
                <a key={item.key} href={item.href} className={linkClass(item.key)} aria-current={active === item.key ? 'page' : undefined}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label px-3 text-white/30">Herramientas</p>
            <div className="space-y-0.5">
              {toolItems.map((item) => (
                <a key={item.key} href={item.href} className={linkClass(item.key)} aria-current={active === item.key ? 'page' : undefined}>
                  {item.label}
                </a>
              ))}
              <a href={previewHref} target="_blank" rel="noopener" className="sidebar-link">
                Vista del cliente
              </a>
            </div>
          </div>
        </nav>

        {/* Perfil y cierre de sesión */}
        <div className="flex-shrink-0 border-t border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E9D9C3] text-[11px] font-medium text-[#06231C]">
              {initials(user?.name ?? user?.email ?? 'AD')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium leading-tight text-white/90">{user?.name ?? 'Usuario'}</p>
              <p className="mt-0.5 truncate text-[11px] leading-tight text-white/40">{user?.email ?? ''}</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="mt-3 w-full rounded-[8px] border border-white/15 py-1.5 text-[12px] text-white/80 transition-colors hover:bg-white/5">
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
