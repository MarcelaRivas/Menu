'use client';

import type { CSSProperties } from 'react';
import { validHex, withAlpha } from '@/lib/public-ui';

interface Props {
  bgUrl: string | null;
  headerValue?: string;
  backgroundBrightness?: number;
  title?: string;
  description?: string;
  font?: string;
  fontSize?: number;
  buttonFillColor?: string;
  buttonFillOpacity?: number;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonShadowColor?: string;
  buttonShadowOpacity?: number;
  buttonShape?: string;
  buttonSize?: string;
  showIcons?: boolean;
  /** Título de ejemplo cuando el diseño aún no tiene uno. */
  fallbackTitle?: string;
}

const SHAPE_RADIUS: Record<string, string> = { square: '0px', rounded: '10px', pill: '9999px' };
const SIZE_PADDING: Record<string, string> = { S: '0.45rem 0.8rem', M: '0.7rem 1.1rem', L: '0.9rem 1.4rem' };

/**
 * Vista previa en vivo de la página de la sede. Usa las mismas reglas de estilo
 * que la página pública, así que lo que se ve aquí es lo que verán los clientes.
 */
export function DesignPreview(p: Props) {
  const overlay = ((100 - (p.backgroundBrightness ?? 100)) / 100) * 0.8;
  const background = p.bgUrl
    ? `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay})), url(${p.bgUrl}) center / cover no-repeat`
    : validHex(p.headerValue, '#ffffff');
  const onImage = !!p.bgUrl || validHex(p.headerValue, '#ffffff') !== '#ffffff';
  const textColor = onImage ? '#ffffff' : '#17201C';

  const button: CSSProperties = {
    background: withAlpha(p.buttonFillColor, p.buttonFillOpacity, '#0B3B2E'),
    color: validHex(p.buttonTextColor, '#ffffff'),
    border: `1px solid ${validHex(p.buttonBorderColor, '#c3aa80')}`,
    borderRadius: SHAPE_RADIUS[p.buttonShape ?? 'rounded'] ?? '10px',
    padding: SIZE_PADDING[p.buttonSize ?? 'M'] ?? SIZE_PADDING.M,
    fontFamily: p.font ?? 'Inter',
    fontSize: `${Math.min(p.fontSize ?? 16, 18)}px`,
    boxShadow: `0 4px 12px ${withAlpha(p.buttonShadowColor, p.buttonShadowOpacity ?? 10, '#000000')}`,
  };

  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-[#4F5752]">Vista previa</p>
      <div
        className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[18px] border border-[#E3E5DF] shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
        style={{ background, fontFamily: p.font ?? 'Inter' }}
        aria-label="Vista previa del diseño"
      >
        <div className="px-4 pb-6 pt-8 text-center" style={{ color: textColor }}>
          <p className="font-serif-display text-[20px] font-semibold uppercase leading-tight" style={{ textShadow: onImage ? '0 2px 8px rgba(0,0,0,0.35)' : undefined }}>
            {p.title || p.fallbackTitle || 'Título de la sede'}
          </p>
          {(p.description || !p.title) && (
            <p className="mt-2 text-[12px] italic opacity-90">{p.description || 'Descripción de la sede'}</p>
          )}
        </div>
        <div className="space-y-2.5 px-4 pb-6">
          {['Carta de ejemplo', 'Otra carta'].map((label) => (
            <div key={label} className="flex items-center justify-center text-center font-semibold" style={button}>
              {p.showIcons !== false && <span className="mr-2 opacity-80" aria-hidden="true">◆</span>}
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
