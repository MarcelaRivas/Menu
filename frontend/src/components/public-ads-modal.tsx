'use client';

import { useEffect, useState } from 'react';
import { renderRich } from '@/lib/rich-text';
import { API_ORIGIN, validHex, withAlpha } from '@/lib/public-ui';

export interface PublicAd {
  id: number;
  type: 'STORY' | 'LINK' | 'SUBSCRIBE' | 'PRODUCT';
  name: string | null;
  text: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  showAfterSeconds?: number;
  config: {
    mediaMode?: 'imagen' | 'video';
    textEnabled?: boolean;
    url?: string;
    buttonText?: string;
    buttonFont?: string;
    buttonFontSize?: number;
    buttonTextColor?: string;
    buttonColor?: string;
    formLabel?: string;
    formTitle?: string;
    formFields?: string[];
    menuId?: number | null;
    productId?: number | null;
  };
  product: { id: number; name: string; description: string; prices: { name: string; value: unknown }[] } | null;
}

/** Convierte un enlace de YouTube en su versión embebida. */
function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function AdContent({ ad }: { ad: PublicAd }) {
  const btn: React.CSSProperties = {
    backgroundColor: validHex(ad.config.buttonColor, '#0B3B2E'),
    color: validHex(ad.config.buttonTextColor, '#ffffff'),
    fontFamily: ad.config.buttonFont ?? 'Inter',
    fontSize: `${ad.config.buttonFontSize ?? 16}px`,
    boxShadow: `0 4px 12px ${withAlpha('#000000', 15, '#000000')}`,
  };

  const embed = ad.config.mediaMode === 'video' && ad.videoUrl ? youtubeEmbed(ad.videoUrl) : null;
  const image = ad.imageUrl ? `${API_ORIGIN}${ad.imageUrl}` : null;

  return (
    <div className="flex flex-col">
      {embed ? (
        <div className="aspect-[9/16] w-full bg-black">
          <iframe src={embed} title={ad.name ?? 'Video'} className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
        </div>
      ) : image ? (
        <img src={image} alt={ad.name ?? ''} className="block max-h-[80vh] w-full object-contain bg-[#FBF8F1]" />
      ) : null}

      {ad.type === 'STORY' && ad.config.textEnabled !== false && ad.text && (
        <div className="p-5 text-[15px] leading-relaxed text-[#17201C]">{renderRich(ad.text)}</div>
      )}

      {ad.type === 'LINK' && (
        <div className="space-y-3 p-5">
          {ad.text && <div className="text-[15px] leading-relaxed text-[#17201C]">{renderRich(ad.text)}</div>}
          {ad.config.url && (
            <a href={ad.config.url} target="_blank" rel="noopener noreferrer" className="block rounded-[10px] py-3 text-center font-semibold" style={btn}>
              {ad.config.buttonText || 'Ver más'}
            </a>
          )}
        </div>
      )}

      {ad.type === 'SUBSCRIBE' && (
        <div className="space-y-3 p-5">
          {ad.config.formTitle && <p className="font-serif-display text-[22px] font-semibold text-[#17201C]">{ad.config.formTitle}</p>}
          {ad.text && <div className="text-[14px] leading-relaxed text-[#4B5563]">{renderRich(ad.text)}</div>}
          <span className="block rounded-[10px] py-3 text-center font-semibold opacity-70" style={btn} aria-disabled="true">
            {ad.config.formLabel || 'Suscribirme'}
          </span>
        </div>
      )}

      {ad.type === 'PRODUCT' && (
        <div className="space-y-2 p-5">
          {ad.product && (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-serif-display text-[20px] font-semibold text-[#17201C]">{ad.product.name}</p>
                {ad.product.description && <p className="mt-1 text-[13px] text-[#4B5563]">{ad.product.description}</p>}
              </div>
              {ad.product.prices[0] && (
                <p className="whitespace-nowrap text-[16px] font-semibold text-[#0B2D45]">
                  ${Number(ad.product.prices[0].value).toLocaleString('es-CO')}
                </p>
              )}
            </div>
          )}
          {ad.text && <div className="text-[14px] leading-relaxed text-[#17201C]">{renderRich(ad.text)}</div>}
        </div>
      )}
    </div>
  );
}

/** Ventana emergente con los anuncios de la sede, uno a la vez. */
export function PublicAdsModal({ ads }: { ads: PublicAd[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  // Se abre el primer anuncio después de sus segundos configurados.
  useEffect(() => {
    if (ads.length === 0) return;
    const delay = Math.max(0, (ads[0].showAfterSeconds ?? 0) * 1000);
    const t = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(t);
  }, [ads]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open || ads.length === 0) return null;

  const ad = ads[index];
  const many = ads.length > 1;
  const go = (step: number) => setIndex((i) => (i + step + ads.length) % ads.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={ad.name ?? 'Anuncio'} onClick={() => setOpen(false)}>
      <div className="relative flex max-h-[92vh] w-full max-w-[400px] items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {many && (
          <button type="button" onClick={() => go(-1)} aria-label="Anuncio anterior" className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/90 text-[#17201C] shadow sm:flex">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}

        <div className="relative max-h-[92vh] flex-1 overflow-y-auto rounded-[14px] bg-[#FBF8F1] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar anuncio" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <AdContent ad={ad} />
          {many && (
            <div className="flex justify-center gap-1.5 pb-3 pt-1" aria-hidden="true">
              {ads.map((a, i) => (
                <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-[#0B3B2E]' : 'bg-[#CDD1C9]'}`} />
              ))}
            </div>
          )}
        </div>

        {many && (
          <button type="button" onClick={() => go(1)} aria-label="Siguiente anuncio" className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/90 text-[#17201C] shadow sm:flex">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
