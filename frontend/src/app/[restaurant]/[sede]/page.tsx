import type { CSSProperties } from 'react';
import { PublicAdsModal, type PublicAd } from '@/components/public-ads-modal';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const API_ORIGIN = API.replace(/\/api\/v1\/?$/, '');

interface Design {
  headerValue: string;
  title: string;
  description: string;
  font: string;
  fontSize: number;
  backgroundBrightness: number;
  buttonFillColor: string;
  buttonFillOpacity?: number;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonShadowColor?: string;
  buttonShadowOpacity?: number;
  buttonShape?: string;
  buttonSize?: string;
  showIcons: boolean;
}

interface PublicPage {
  name: string;
  restaurant?: { name: string } | null;
  design?: Design | null;
  backgroundUrl?: string | null;
  elements: { id: number; name: string; icon: string; menuId: number; menu?: { name: string } | null }[];
  menus: { id: number; name: string }[];
  ads?: PublicAd[];
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const NAVY = '#0B2D45';
const GOLD = '#C9A85C';
const CREAM = '#F8F5EE';
const GREEN = '#0B3B2E';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Icono según el nombre de la carta (café, bebidas, vinos, desayunos; por defecto, campana). */
function MenuIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (/vino/.test(n)) {
    return (
      <svg {...common}><path d="M8 3h8l-1 6a3 3 0 01-6 0L8 3zM12 12v8M9 21h6" /></svg>
    );
  }
  if (/bebida|cóctel|coctel|trago/.test(n)) {
    return (
      <svg {...common}><path d="M4 4h16l-8 9-8-9zM12 13v7M8 20h8M15 4l3-2" /></svg>
    );
  }
  if (/caf|desayuno/.test(n)) {
    return (
      <svg {...common}><path d="M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9zM16 11h2a2 2 0 010 4h-2M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3" /></svg>
    );
  }
  return (
    <svg {...common}><path d="M3 17h18M5 17a7 7 0 0114 0M12 6v2M4 20h16" /></svg>
  );
}

export default async function SedePage({ params }: { params: Promise<{ restaurant: string; sede: string }> }) {
  const { restaurant, sede: slug } = await params;
  const res = await fetch(`${API}/public/restaurants/${restaurant}/pages/${slug}`, { cache: 'no-store' });
  if (!res.ok) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
        <p className="text-gray-500">Verifica que el enlace sea correcto</p>
      </div>
    </div>
  );

  const page: PublicPage = await res.json();
  const d = page.design;
  const restaurantName = page.restaurant?.name ?? 'Restaurante';

  // Fondo a pantalla completa: imagen de la sede (oscurecida según el brillo) o color.
  const bgAbs = page.backgroundUrl ? `${API_ORIGIN}${page.backgroundUrl}` : null;
  const overlay = ((100 - (d?.backgroundBrightness ?? 100)) / 100) * 0.8;
  const pageBackground = bgAbs
    ? `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})), url(${bgAbs}) center / cover fixed no-repeat`
    : (d?.headerValue && HEX_RE.test(d.headerValue) ? d.headerValue : '#0E2A22');

  // Cartas: los elementos configurados de la sede, más las cartas visibles sin elemento.
  const fromElements = page.elements.map((el) => ({
    key: `el-${el.id}`,
    name: el.menu?.name ?? el.name,
    menuId: el.menuId,
  }));
  const covered = new Set(page.elements.map((el) => el.menuId));
  const extra = (page.menus ?? [])
    .filter((m) => !covered.has(m.id))
    .map((m) => ({ key: `menu-${m.id}`, name: m.name, menuId: m.id }));
  const items = [...fromElements, ...extra];

  const rowStyle: CSSProperties = {
    fontFamily: d?.font ?? 'Inter',
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: pageBackground, backgroundColor: '#0E2A22', fontFamily: d?.font ?? 'Inter' }}>
      {/* Barra superior */}
      <nav
        className="flex items-center justify-between px-6 py-3 text-white sm:px-10"
        style={{ backgroundColor: NAVY, borderBottom: `3px solid ${GOLD}` }}
        aria-label="Principal"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border text-[15px] font-semibold tracking-wide"
            style={{ borderColor: GOLD, color: GOLD }}
            aria-hidden="true"
          >
            {initials(restaurantName)}
          </span>
          <span className="font-serif-display text-[20px] leading-tight sm:text-[22px]">{restaurantName}</span>
        </div>
        <a href={`/${restaurant}`} className="flex items-center gap-2 text-[15px] text-white/90 transition-colors hover:text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" />
          </svg>
          Restaurantes
        </a>
      </nav>

      {/* Volver */}
      <div className="px-6 pt-6 sm:px-10">
        <a
          href={`/${restaurant}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/80 px-4 py-1.5 text-[14px] text-white transition-colors hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </a>
      </div>

      {/* Encabezado de la sede */}
      <header className="px-6 pb-6 pt-10 text-center text-white">
        <div className="mx-auto flex max-w-[560px] items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3v7a2.5 2.5 0 002.5 2.5H8V21M8 3v7M11 3v7M19 3c-1.5 1.5-2.5 4-2.5 7v3H19v8" />
          </svg>
          <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
        </div>
        <h1
          className="font-serif-display mt-5 text-[44px] font-semibold uppercase leading-tight tracking-[0.02em] sm:text-[56px]"
          style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
        >
          {d?.title || page.name}
        </h1>
        <p className="font-serif-display mt-3 text-[20px] opacity-95" style={{ color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.35)' }}>
          {d?.description || 'Seleccione la carta que desea consultar'}
        </p>
      </header>

      {/* Anuncios publicados en la sede: ventana emergente */}
      <PublicAdsModal ads={(page.ads ?? []) as PublicAd[]} />

      {/* Cartas */}
      <main className="mx-auto w-full max-w-[600px] px-6 pb-16" aria-label="Cartas disponibles">
        {items.length === 0 ? (
          <p className="py-12 text-center text-[15px] text-white/80">No hay cartas disponibles</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.key}>
                <a
                  href={`/${restaurant}/${slug}/menu/${it.menuId}`}
                  className="group flex items-center gap-4 rounded-full py-2.5 pl-2.5 pr-6 shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
                  style={{ ...rowStyle, backgroundColor: CREAM }}
                  aria-label={`Ver ${it.name}`}
                >
                  <span
                    className="flex h-12 w-[88px] flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: GREEN, color: '#ffffff' }}
                    aria-hidden="true"
                  >
                    <MenuIcon name={it.name} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[20px] font-semibold" style={{ color: NAVY }}>
                    {it.name}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="flex-shrink-0 text-[#17201C] transition-transform group-hover:translate-x-0.5">
                    <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

    </div>
  );
}
