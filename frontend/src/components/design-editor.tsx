'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { mediaUrl, uploadImage } from '@/lib/media';
import { DesignPreview } from './design-preview';

export interface DesignValues {
  headerType: string;
  headerValue: string;
  backgroundMediaId: number | null;
  backgroundBrightness: number;
  font: string;
  fontSize: number;
  buttonShape: string;
  buttonSize: string;
  buttonTextColor: string;
  buttonFillColor: string;
  buttonFillOpacity: number;
  buttonBorderColor: string;
  buttonShadowColor: string;
  buttonShadowOpacity: number;
  showIcons: boolean;
}

interface Props {
  design: Partial<DesignValues>;
  onChange: (patch: Partial<DesignValues>) => void;
}

const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Lora', 'Open Sans', 'Crimson Pro'];
const FONT_SIZES = [12, 14, 16, 18, 20, 24];
const SECTION_TITLE = 'block text-[13px] font-semibold text-[#17201C] mb-2.5';
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function ColorField({
  label,
  value,
  onChange,
  opacity,
  onOpacity,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  opacity?: number;
  onOpacity?: (v: number) => void;
}) {
  const safe = HEX_RE.test(value) ? value : '#000000';
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <div>
      <span className="mb-2 block text-[12px] font-medium text-[#4F5752]">{label}</span>
      <div className="flex items-center gap-2">
        <label className="relative h-9 w-9 flex-shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-[#E3E5DF]">
          <span className="absolute inset-0" style={{ backgroundColor: safe }} aria-hidden="true" />
          <input
            type="color"
            aria-label={`${label}: selector de color`}
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <input
          aria-label={`${label}: código hexadecimal`}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (HEX_RE.test(e.target.value)) onChange(e.target.value);
          }}
          onBlur={() => setDraft(value)}
          className="input flex-1"
        />
        {onOpacity && opacity !== undefined && (
          <div className="flex h-9 w-[84px] flex-shrink-0 items-center rounded-[8px] border border-[#E3E5DF] bg-white pr-2">
            <input
              type="number"
              min={0}
              max={100}
              aria-label={`${label}: opacidad`}
              value={opacity}
              onChange={(e) => onOpacity(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
              className="w-full border-0 bg-transparent px-2.5 text-[13px] focus:outline-none"
            />
            <span className="text-[12px] text-[#8D9590]">%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ShapeIcon({ shape }: { shape: string }) {
  const radius = shape === 'square' ? 0 : shape === 'pill' ? 999 : 8;
  return <span className="block h-4 w-[64px] border-2 border-current" style={{ borderRadius: radius }} aria-hidden="true" />;
}

export function DesignEditor({ design, onChange }: Props) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Cargar la imagen de fondo actual para la vista previa.
  useEffect(() => {
    if (!design.backgroundMediaId) {
      setBgUrl(null);
      return;
    }
    let cancelled = false;
    api
      .get<{ url: string }>(`/media/${design.backgroundMediaId}`)
      .then((m) => { if (!cancelled) setBgUrl(mediaUrl(m.url)); })
      .catch(() => { if (!cancelled) setBgUrl(null); });
    return () => { cancelled = true; };
  }, [design.backgroundMediaId]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const media = await uploadImage(file);
      setBgUrl(mediaUrl(media.url));
      onChange({ backgroundMediaId: media.id, headerType: 'image' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  }

  function removeBackground() {
    setBgUrl(null);
    onChange({ backgroundMediaId: null, headerType: 'color' });
  }

  const brightness = design.backgroundBrightness ?? 100;
  const overlay = ((100 - brightness) / 100) * 0.8;

  return (
    <div className="space-y-9">
      <DesignPreview
        bgUrl={bgUrl}
        headerValue={design.headerValue}
        backgroundBrightness={design.backgroundBrightness}
        font={design.font}
        fontSize={design.fontSize}
        buttonFillColor={design.buttonFillColor}
        buttonFillOpacity={design.buttonFillOpacity}
        buttonTextColor={design.buttonTextColor}
        buttonBorderColor={design.buttonBorderColor}
        buttonShadowColor={design.buttonShadowColor}
        buttonShadowOpacity={design.buttonShadowOpacity}
        buttonShape={design.buttonShape}
        buttonSize={design.buttonSize}
        showIcons={design.showIcons}
        title={(design as { title?: string }).title}
        description={(design as { description?: string }).description}
      />

      {/* Fondo */}
      <section className="space-y-5">
        <div>
          <h3 className="text-[15px] font-semibold text-[#17201C]">Fondo</h3>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">Elige una imagen o color para el fondo de tu homepage</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_200px]">
          <div>
            <span className={SECTION_TITLE}>Imagen horizontal</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Subir imagen de fondo"
              onChange={onFile}
            />
            <div className="group relative aspect-video overflow-hidden rounded-[10px] bg-[#EFF0EC]">
              {bgUrl ? (
                <>
                  <img src={bgUrl} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} aria-hidden="true" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-black/0 transition-colors group-hover:bg-black/20">
                    <a
                      href={bgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ver imagen de fondo"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.3" />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      aria-label="Cambiar imagen de fondo"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 11.5V13h1.5L11 6.5 9.5 5 3 11.5zM10 4.5l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={removeBackground}
                      aria-label="Quitar imagen de fondo"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B42318] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex h-full w-full flex-col items-center justify-center gap-1.5 border border-dashed border-[#CDD1C9] text-[#8D9590] transition-colors hover:bg-[#F6F6F3]"
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M11 3v16M3 11h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span className="text-[12px]">{uploading ? 'Subiendo…' : 'Subir imagen'}</span>
                </button>
              )}
            </div>
            <p className="mt-2 text-[12px] text-[#8D9590]">Dimensiones recomendadas: 1920 x 1080px</p>
            {error && <p role="alert" className="mt-1.5 text-[12px] text-[#B42318]">{error}</p>}

            <div className="mt-4 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0 text-[#4F5752]">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="range"
                min={0}
                max={100}
                aria-label="Brillo de la imagen de fondo"
                value={brightness}
                onChange={(e) => onChange({ backgroundBrightness: Number(e.target.value) })}
                className="w-full accent-[#0B2E25]"
              />
            </div>
          </div>

          <div>
            <ColorField
              label="Color fondo"
              value={design.headerValue ?? '#ffffff'}
              onChange={(v) => onChange({ headerValue: v, headerType: design.backgroundMediaId ? design.headerType : 'color' })}
            />
          </div>
        </div>
      </section>

      {/* Botones */}
      <section className="space-y-6">
        <div>
          <h3 className="text-[15px] font-semibold text-[#17201C]">Botones</h3>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">Cambia los colores y estilos de los botones</p>
        </div>

        <div>
          <span className={SECTION_TITLE}>Forma botón</span>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'square', label: 'Cuadrado' },
              { key: 'rounded', label: 'Redondeado' },
              { key: 'pill', label: 'Píldora' },
            ].map((s) => {
              const selected = (design.buttonShape ?? 'rounded') === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ buttonShape: s.key })}
                  className={`flex h-14 items-center justify-center rounded-[10px] border-2 bg-white transition-colors ${
                    selected ? 'border-[#0B2E25] text-[#0B2E25]' : 'border-[#D9DDD7] text-[#8D9590] hover:border-[#B5BBB6]'
                  }`}
                >
                  <ShapeIcon shape={s.key} />
                  <span className="sr-only">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className={SECTION_TITLE}>Tamaño botón</span>
          <div className="flex gap-3">
            {['S', 'M', 'L'].map((size) => {
              const selected = (design.buttonSize ?? 'M') === size;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ buttonSize: size })}
                  className={`h-10 w-12 rounded-[8px] border text-[13px] font-medium transition-colors ${
                    selected ? 'border-[#0B2E25] text-[#0B2E25]' : 'border-[#D9DDD7] text-[#4F5752] hover:border-[#B5BBB6]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className={SECTION_TITLE}>Fuente en botones</span>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <select
              aria-label="Fuente en botones"
              value={design.font ?? 'Inter'}
              onChange={(e) => onChange({ font: e.target.value })}
              className="input"
            >
              {FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <select
              aria-label="Tamaño de fuente en botones"
              value={String(design.fontSize ?? 16)}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="input"
            >
              {FONT_SIZES.map((s) => <option key={s} value={String(s)}>{s}</option>)}
            </select>
          </div>
          <div className="mt-3 w-1/2">
            <ColorField label="Color de texto" value={design.buttonTextColor ?? '#ffffff'} onChange={(v) => onChange({ buttonTextColor: v })} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ColorField
            label="Color relleno"
            value={design.buttonFillColor ?? '#ffffff'}
            onChange={(v) => onChange({ buttonFillColor: v })}
            opacity={design.buttonFillOpacity ?? 100}
            onOpacity={(v) => onChange({ buttonFillOpacity: v })}
          />
          <ColorField
            label="Color borde"
            value={design.buttonBorderColor ?? '#c3aa80'}
            onChange={(v) => onChange({ buttonBorderColor: v })}
          />
          <ColorField
            label="Color sombra"
            value={design.buttonShadowColor ?? '#000000'}
            onChange={(v) => onChange({ buttonShadowColor: v })}
            opacity={design.buttonShadowOpacity ?? 10}
            onOpacity={(v) => onChange({ buttonShadowOpacity: v })}
          />
        </div>

        <div>
          <span className={SECTION_TITLE}>Iconos botones</span>
          <div className="flex gap-3">
            {[
              { value: false, label: 'Ocultar iconos', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3l18 18M10.6 5.1A10.4 10.4 0 0112 5c6 0 9.5 7 9.5 7a17 17 0 01-2.6 3.4M6.6 6.6C3.9 8.3 2.5 12 2.5 12s3.5 7 9.5 7a9.6 9.6 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2" />
                </svg>
              ) },
              { value: true, label: 'Mostrar iconos', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) },
            ].map((opt) => {
              const selected = (design.showIcons ?? true) === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  aria-pressed={selected}
                  aria-label={opt.label}
                  onClick={() => onChange({ showIcons: opt.value })}
                  className={`flex h-10 w-12 items-center justify-center rounded-[8px] border transition-colors ${
                    selected ? 'border-[#0B2E25] text-[#0B2E25]' : 'border-[#D9DDD7] text-[#8D9590] hover:border-[#B5BBB6]'
                  }`}
                >
                  {opt.icon}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="space-y-3 border-t border-[#EFF0EC] pt-6">
        <p className="text-[12px] leading-relaxed text-[#8D9590]">
          Los estilos que no configures usarán automáticamente los de tu marca.
          También puedes reemplazar los estilos actuales por los de tu marca con un solo clic.
        </p>
        <button type="button" disabled title="Próximamente" className="btn btn-secondary w-full disabled:opacity-60">
          Usar estilos de la marca
        </button>
      </div>
    </div>
  );
}
