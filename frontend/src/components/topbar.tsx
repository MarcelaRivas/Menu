'use client';

import { useEffect, useState } from 'react';
import { getRestaurant, getUser, type RestaurantInfo, type SessionUser } from '@/lib/session';

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Vista general',
  restaurant: 'Restaurante y diseño',
  pages: 'Restaurantes y sedes',
  menus: 'Cartas digitales',
  categories: 'Categorías',
  products: 'Productos',
  ads: 'Anuncios',
  history: 'Historial',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '•';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

interface Props {
  active?: string;
  onMenu?: () => void;
}

export function Topbar({ active, onMenu }: Props) {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getUser());
    getRestaurant().then(setRestaurant);
  }, []);

  return (
    <header className="flex h-[60px] flex-shrink-0 items-center justify-between gap-3 border-b border-[#EFF0EC] bg-white px-4 sm:px-8" role="banner">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Abrir menú"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] text-[#4F5752] hover:bg-[#F6F6F3] md:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <nav aria-label="Ruta de navegación" className="flex min-w-0 items-center gap-2 text-[12px] text-[#8D9590]">
          <span className="truncate">{restaurant?.name ?? '…'}</span>
          <span aria-hidden="true" className="text-[#CDD1C9]">/</span>
          <span className="truncate font-medium text-[#17201C]">{active ? SECTION_LABELS[active] ?? '' : ''}</span>
        </nav>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E9D9C3] text-[11px] font-medium text-[#06231C]"
          title={user?.name ?? user?.email ?? ''}
          aria-label={`Sesión de ${user?.name ?? 'usuario'}`}
        >
          {initials(user?.name ?? user?.email ?? 'AD')}
        </div>
      </div>
    </header>
  );
}
