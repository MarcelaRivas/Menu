import type { ReactNode } from 'react';

/* Elementos compartidos de las páginas públicas (restaurante, sede, carta, categoría). */

export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
export const API_ORIGIN = API.replace(/\/api\/v1\/?$/, '');
export const NAVY = '#0B2D45';
export const GOLD = '#C9A85C';
export const CREAM = '#F8F5EE';
export const GREEN = '#0B3B2E';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function validHex(value: string | undefined | null, fallback: string): string {
  return value && HEX_RE.test(value) ? value : fallback;
}

/** Hex + opacidad (0–100) → rgba(). */
export function withAlpha(hex: string | undefined, opacity: number | undefined, fallback: string): string {
  const color = validHex(hex, fallback);
  const a = Math.min(100, Math.max(0, opacity ?? 100)) / 100;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '•';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

/** Fondo: imagen (oscurecida según el brillo) o color. */
export function pageBackground(bgUrl: string | null | undefined, brightness: number | undefined, color: string | undefined): string {
  if (bgUrl) {
    const overlay = ((100 - (brightness ?? 100)) / 100) * 0.8;
    return `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})), url(${API_ORIGIN}${bgUrl}) center / cover fixed no-repeat`;
  }
  return validHex(color, '#0E2A22');
}

/** Icono según palabras clave del nombre (por defecto, un plato). */
export function categoryIcon(name: string): ReactNode {
  const n = name.toLowerCase();
  const props = { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (/vino/.test(n)) return <svg {...props}><path d="M8 3h8l-1 6a3 3 0 01-6 0L8 3zM12 12v8M9 21h6" /></svg>;
  if (/bebida|cóctel|coctel|trago|jugo|limonada/.test(n)) return <svg {...props}><path d="M4 4h16l-8 9-8-9zM12 13v7M8 20h8M15 4l3-2" /></svg>;
  if (/caf|desayuno|té|te |infusi/.test(n)) return <svg {...props}><path d="M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9zM16 11h2a2 2 0 010 4h-2M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3" /></svg>;
  if (/sopa|crema|caldo/.test(n)) return <svg {...props}><path d="M3 11h18a9 9 0 01-18 0zM8 7c0-1 1-1 1-2M12 7c0-1 1-1 1-2M16 7c0-1 1-1 1-2" /></svg>;
  if (/ensalada|vegetar/.test(n)) return <svg {...props}><path d="M3 12h18a9 9 0 01-18 0zM8 12c0-3 2-5 4-6 2 1 4 3 4 6M12 6V4" /></svg>;
  if (/pescado|marisco|ceviche/.test(n)) return <svg {...props}><path d="M3 12c3-4 7-5 11-2 2-2 4-3 7-2-1 2-1 4 0 6-3 1-5 0-7-2-4 3-8 2-11-0zM8 11h.01" /></svg>;
  if (/carne|parrilla|res|cerdo|pollo/.test(n)) return <svg {...props}><path d="M4 16c0-4 4-8 9-8 3 0 5 2 5 5 0 5-4 8-9 8-3 0-5-2-5-5zM15 6l5-3" /></svg>;
  if (/postre|dulce|torta|pastel|helado/.test(n)) return <svg {...props}><path d="M5 12h14l-2 8H7l-2-8zM12 12V7M9 7h6M12 4v3" /></svg>;
  if (/pizza/.test(n)) return <svg {...props}><path d="M12 21L3 6a14 14 0 0118 0l-9 15zM8 10h.01M12 13h.01M11 7h.01" /></svg>;
  if (/cerveza|licor|whisky|ron|tequila/.test(n)) return <svg {...props}><path d="M7 3h7v18H7zM14 8h3a2 2 0 012 2v6a2 2 0 01-2 2h-3M7 8h7" /></svg>;
  return <svg {...props}><path d="M3 17h18M5 17a7 7 0 0114 0M12 6v2M4 20h16" /></svg>;
}

/** Barra superior compartida. */
export function TopBar({ brand, homeHref, homeLabel }: { brand: string; homeHref: string; homeLabel: string }) {
  return (
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
          {initials(brand)}
        </span>
        <span className="font-serif-display text-[20px] leading-tight sm:text-[22px]">{brand}</span>
      </div>
      <a href={homeHref} className="flex items-center gap-2 text-[15px] text-white/90 transition-colors hover:text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" />
        </svg>
        {homeLabel}
      </a>
    </nav>
  );
}

/** Botón "Volver" en forma de píldora. */
export function BackButton({ href, label = 'Volver' }: { href: string; label?: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-2 rounded-full border border-white/80 px-4 py-1.5 text-[14px] text-white transition-colors hover:bg-white/10">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </a>
  );
}

/** Divisor dorado con un icono en el centro. */
export function GoldDivider({ children }: { children?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[560px] items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
      {children}
      <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
    </div>
  );
}

/** Imagen por defecto cuando no hay foto: un local para restaurantes o un plato con cubiertos para productos. */
export function DefaultImage({ kind }: { kind: 'store' | 'plate' }) {
  const common = {
    width: 56,
    height: 56,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  return (
    <div
      className="flex h-full w-full items-center justify-center text-[#8D9590]"
      style={{ background: 'linear-gradient(135deg, #EEF1EC 0%, #DCE3D8 100%)' }}
      role="img"
      aria-label={kind === 'store' ? 'Sin imagen del local' : 'Sin imagen del plato'}
    >
      {kind === 'store' ? (
        <svg {...common}>
          <path d="M3 9l1.5-5h15L21 9" />
          <path d="M4 9v11h16V9" />
          <path d="M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3" />
          <path d="M9 20v-6h6v6" />
        </svg>
      ) : (
        <svg {...common}>
          <circle cx="12" cy="12" r="6.5" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M3.5 3v5M5.5 3v5M3.5 8v0M5.5 8v0M3 8h3" />
          <path d="M20.5 3c-1.2 1.2-1.8 3-1.8 5.2 0 1.2.6 2 1.8 2V21" />
        </svg>
      )}
    </div>
  );
}
