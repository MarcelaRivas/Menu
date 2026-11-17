import type { CSSProperties } from 'react';
import { DefaultImage } from '@/lib/public-ui';

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
  buttonFillOpacity: number;
  buttonTextColor: string;
  buttonShape: string;
  buttonSize: string;
  buttonBorderColor: string;
  buttonShadowColor: string;
  buttonShadowOpacity: number;
  showIcons: boolean;
}

interface PublicSede {
  id: number;
  name: string;
  slug: string;
  contactInfo: string | null;
  backgroundUrl?: string | null;
}

interface PublicRestaurant {
  id: number;
  name: string;
  slug: string;
  design?: Design | null;
  backgroundUrl?: string | null;
  pages: PublicSede[];
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const NAVY = '#0B2D45';
const GOLD = '#C9A85C';
const CREAM = '#F8F5EE';

function withAlpha(hex: string | undefined, opacity: number | undefined, fallback: string): string {
  const color = hex && HEX_RE.test(hex) ? hex : fallback;
  const a = Math.min(100, Math.max(0, opacity ?? 100)) / 100;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

const SHAPE_RADIUS: Record<string, string> = { square: '4px', rounded: '10px', pill: '9999px' };

export default async function RestaurantPage({ params }: { params: Promise<{ restaurant: string }> }) {
  const { restaurant } = await params;
  const res = await fetch(`${API}/public/restaurants/${restaurant}`, { cache: 'no-store' });

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-6">
        <div className="text-center">
          <h1 className="font-serif-display text-[32px] font-medium text-[#17201C] mb-2">Restaurante no encontrado</h1>
          <p className="text-[14px] text-[#8D9590]">Verifica que el enlace sea correcto</p>
        </div>
      </div>
    );
  }

  const data: PublicRestaurant = await res.json();
  const d = data.design;

  // Fondo a pantalla completa: imagen del diseño (oscurecida según el brillo) o color.
  const bgAbs = data.backgroundUrl ? `${API_ORIGIN}${data.backgroundUrl}` : null;
  const overlay = ((100 - (d?.backgroundBrightness ?? 100)) / 100) * 0.8;
  const pageBackground = bgAbs
    ? `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})), url(${bgAbs}) center / cover fixed no-repeat`
    : (d?.headerValue && HEX_RE.test(d.headerValue) ? d.headerValue : CREAM);
  const textColor = bgAbs ? '#ffffff' : NAVY;

  // Botón "Ver carta" con el estilo del diseño.
  const borderColor = d?.buttonBorderColor && HEX_RE.test(d.buttonBorderColor) ? d.buttonBorderColor : GOLD;
  const buttonStyle: CSSProperties = {
    background: withAlpha(d?.buttonFillColor, d?.buttonFillOpacity, '#0B3B2E'),
    color: d?.buttonTextColor && HEX_RE.test(d.buttonTextColor) ? d.buttonTextColor : '#ffffff',
    borderRadius: SHAPE_RADIUS[d?.buttonShape ?? 'rounded'] ?? '10px',
    fontFamily: d?.font ?? 'Inter',
    boxShadow: `0 3px 10px ${withAlpha(d?.buttonShadowColor, d?.buttonShadowOpacity ?? 10, '#000000')}`,
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ fontFamily: d?.font ?? 'Inter', background: pageBackground, backgroundColor: CREAM }}>
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
            {initials(data.name)}
          </span>
          <span className="font-serif-display text-[20px] leading-tight sm:text-[22px]">{data.name}</span>
        </div>
        <a href="/" className="flex items-center gap-2 text-[15px] text-white/90 transition-colors hover:text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" />
          </svg>
          Inicio
        </a>
      </nav>

      {/* Encabezado */}
      <header className="px-6 pb-8 pt-10 text-center" style={{ color: textColor }}>
        <div className="mx-auto flex max-w-[460px] items-center gap-5" aria-hidden="true">
          <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
          <svg width="30" height="36" viewBox="0 0 30 36" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3v10a3.5 3.5 0 003.5 3.5H10V33" />
            <path d="M10 3v10M14 3v10" />
            <path d="M24 3c-2.5 2.5-3.5 6-3.5 10.5V18H24v15" />
          </svg>
          <span className="h-px flex-1" style={{ backgroundColor: GOLD }} />
        </div>
        <h1 className="font-serif-display mt-4 text-[40px] font-semibold leading-tight sm:text-[54px]" style={{ color: bgAbs ? '#ffffff' : NAVY }}>
          {d?.title || 'Nuestra Gastronomía'}
        </h1>
        <p className="font-serif-display mt-2 text-[19px] italic opacity-95">
          {d?.description || 'Seleccione una sede para conocer su carta'}
        </p>
      </header>

      {/* Sedes */}
      <main className="mx-auto w-full max-w-[1240px] px-6 pb-16" aria-label="Sedes">
        {data.pages.length === 0 ? (
          <p className="py-12 text-center text-[14px] opacity-80" style={{ color: textColor }}>
            Este restaurante no tiene sedes disponibles
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.pages.map((p) => (
              <a
                key={p.id}
                href={`/${data.slug}/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[14px] shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: CREAM, border: `2px solid ${borderColor}` }}
                aria-label={`Ver carta de ${p.name}`}
              >
                <div className="relative aspect-[3.6/1] w-full bg-[#E9ECE7]">
                  {p.backgroundUrl ? (
                    <img src={`${API_ORIGIN}${p.backgroundUrl}`} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <DefaultImage kind="store" />
                  )}
                </div>
                <div className="flex flex-1 items-center gap-3 px-4 py-3">
                  <p className="font-serif-display min-w-0 flex-1 break-words text-center text-[21px] font-semibold leading-tight" style={{ color: NAVY }}>
                    {p.name}
                  </p>
                  <span className="h-10 w-px flex-shrink-0 bg-[#D9CBA8]" aria-hidden="true" />
                  <span
                    className="flex flex-shrink-0 items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-opacity group-hover:opacity-90"
                    style={buttonStyle}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.3">
                      <rect x="3" y="2" width="10" height="12" rx="1.5" />
                      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" strokeLinecap="round" />
                    </svg>
                    Ver carta
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
