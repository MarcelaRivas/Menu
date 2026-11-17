'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { mediaUrl, uploadImage } from '@/lib/media';
import { RichTextEditor } from './rich-text-editor';
import { Toggle } from './toggle';

export type AdKind = 'STORY' | 'LINK' | 'SUBSCRIBE' | 'PRODUCT';

export interface AdConfig {
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
  showAfterSeconds?: number;
}

export interface AdValues {
  id?: number;
  name: string | null;
  type: AdKind;
  mediaId: number | null;
  mediaUrl?: string | null;
  videoUrl: string | null;
  text: string | null;
  config: AdConfig | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface AdSavePayload {
  name: string | null;
  type: AdKind;
  mediaId: number | null;
  videoUrl: string | null;
  text: string | null;
  config: AdConfig;
  startsAt: string | null;
  endsAt: string | null;
}

interface Props {
  initial: AdValues | null;
  onSave: (payload: AdSavePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

const TYPES: { key: AdKind; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'STORY',
    label: 'Historia',
    description: 'Muestra una imagen o texto informativo.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M4 17l5-4 4 3 3-2 4 3" /></svg>,
  },
  {
    key: 'LINK',
    label: 'Enlace',
    description: 'Envía a tus clientes a una página con un botón de link.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></svg>,
  },
  {
    key: 'SUBSCRIBE',
    label: 'Suscríbete',
    description: 'Invita a tus clientes a suscribirse a tu lista VIP.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4l2-2z" /><path d="M10 20a2 2 0 004 0" /></svg>,
  },
  {
    key: 'PRODUCT',
    label: 'Producto',
    description: 'Destaca un producto o un menú de tu catálogo.',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M4 11h16v8H4z" /><path d="M7 11V8a5 5 0 0110 0v3" /></svg>,
  },
];

const FIELD_OPTIONS = ['Nombre', 'Correo', 'Teléfono', 'Fecha de nacimiento'];
const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Lora', 'Open Sans', 'Crimson Pro'];
const SECTION_TITLE = 'block text-[13px] font-semibold text-[#17201C] mb-2.5';
const CARD = 'rounded-[12px] border border-[#E3E5DF] bg-white p-5';
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function dateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export function AdEditor({ initial, onSave, onDelete, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AdKind>(initial?.type ?? 'STORY');
  const [mediaId, setMediaId] = useState<number | null>(initial?.mediaId ?? null);
  const [preview, setPreview] = useState<string | null>(initial?.mediaUrl ?? null);
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const [config, setConfig] = useState<AdConfig>(initial?.config ?? {});
  const [startsAt, setStartsAt] = useState(dateInput(initial?.startsAt ?? null) || new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState(dateInput(initial?.endsAt ?? null));
  const [menus, setMenus] = useState<{ id: number; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const mode = config.mediaMode ?? 'imagen';
  const set = (patch: Partial<AdConfig>) => setConfig((c) => ({ ...c, ...patch }));

  // Cargar cartas y productos para el tipo Producto.
  useEffect(() => {
    api.get<{ id: number; name: string }[]>('/menus').then(setMenus).catch(() => setMenus([]));
    api.get<{ id: number; name: string }[]>('/products').then(setProducts).catch(() => setProducts([]));
  }, []);

  // Vista previa de la imagen guardada.
  useEffect(() => {
    if (!mediaId || preview) return;
    let cancelled = false;
    api.get<{ url: string }>(`/media/${mediaId}`).then((m) => { if (!cancelled) setPreview(mediaUrl(m.url)); }).catch(() => {});
    return () => { cancelled = true; };
  }, [mediaId, preview]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const media = await uploadImage(file);
      setMediaId(media.id);
      setPreview(mediaUrl(media.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setMediaId(null);
    setPreview(null);
  }

  async function save() {
    setError('');
    if (type === 'LINK' && !config.url?.trim()) return setError('Escribe el enlace del anuncio.');
    if (type === 'PRODUCT' && !config.productId) return setError('Elige el producto que quieres destacar.');
    if (startsAt && endsAt && endsAt < startsAt) return setError('La fecha fin no puede ser anterior a la fecha inicio.');
    setSaving(true);
    try {
      await onSave({
        name: name.trim() || null,
        type,
        mediaId: mode === 'imagen' ? mediaId : null,
        videoUrl: mode === 'video' ? videoUrl.trim() || null : null,
        text: type === 'STORY' ? (config.textEnabled ? text || null : null) : text || null,
        config: { ...config, mediaMode: mode },
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el anuncio');
    } finally {
      setSaving(false);
    }
  }

  const colorInput = (label: string, value: string | undefined, fallback: string, onChange: (v: string) => void) => (
    <div>
      <span className="mb-1.5 block text-[12px] text-[#4F5752]">{label}</span>
      <div className="flex items-center gap-2">
        <label className="relative h-9 w-9 flex-shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-[#E3E5DF]">
          <span className="absolute inset-0" style={{ backgroundColor: HEX_RE.test(value ?? '') ? value : fallback }} aria-hidden="true" />
          <input type="color" aria-label={label} value={HEX_RE.test(value ?? '') ? value : fallback} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
        <input aria-label={`${label}: código`} value={value ?? fallback} onChange={(e) => onChange(e.target.value)} className="input flex-1" />
      </div>
    </div>
  );

  const fontSelect = (label: string, value: string | undefined, onChange: (v: string) => void) => (
    <div>
      <span className="mb-1.5 block text-[12px] text-[#4F5752]">{label}</span>
      <select aria-label={label} value={value ?? 'Inter'} onChange={(e) => onChange(e.target.value)} className="input">
        {FONTS.map((f) => <option key={f}>{f}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      {error && (
        <p role="alert" className="rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">{error}</p>
      )}

      {/* Nombre */}
      <section>
        <label htmlFor="ad-name" className={SECTION_TITLE}>Nombre <span className="font-normal text-[#8D9590]">(opcional)</span></label>
        <input id="ad-name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Para identificarlo en el panel" />
      </section>

      {/* Tipo */}
      <section>
        <span className={SECTION_TITLE}>Tipo de anuncio</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TYPES.map((t) => {
            const selected = type === t.key;
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setType(t.key)}
                className={`flex flex-col items-start gap-2 rounded-[12px] border-2 bg-white p-4 text-left transition-colors ${
                  selected ? 'border-[#0B2E25]' : 'border-[#E3E5DF] hover:border-[#CDD1C9]'
                }`}
              >
                <span className="text-[#17201C]">{t.icon}</span>
                <span className="text-[13px] font-semibold text-[#17201C]">{t.label}</span>
                <span className="text-[11px] leading-snug text-[#8D9590]">{t.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Imagen / video */}
      <section className={CARD}>
        <span className={SECTION_TITLE}>Imagen / Video</span>
        <p className="mb-3 text-[12px] text-[#8D9590]">Escoge una imagen o video de YouTube. ¡Ideal para comunicar nuevos productos, promociones, eventos y más!</p>
        <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#E3E5DF]">
          {(['imagen', 'video'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => set({ mediaMode: m })}
              className={`py-2 text-[13px] font-medium transition-colors ${mode === m ? 'bg-white text-[#17201C] shadow-[inset_0_-2px_0_#0B2E25]' : 'bg-[#F6F6F3] text-[#8D9590]'}`}
            >
              {m === 'imagen' ? 'Imagen' : 'Video'}
            </button>
          ))}
        </div>

        {mode === 'imagen' ? (
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Subir imagen del anuncio" onChange={onFile} />
            <div className="group relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-[10px] bg-[#EFF0EC]">
              {preview ? (
                <>
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-colors group-hover:bg-black/25">
                    <a href={preview} target="_blank" rel="noopener noreferrer" aria-label="Ver imagen" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /></svg>
                    </a>
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Cambiar imagen" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 11.5V13h1.5L11 6.5 9.5 5 3 11.5zM10 4.5l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                    </button>
                    <button type="button" onClick={removeImage} aria-label="Quitar imagen" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B42318] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex h-full w-full flex-col items-center justify-center gap-1.5 border border-dashed border-[#CDD1C9] text-[#8D9590] transition-colors hover:bg-[#F6F6F3]">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 3v16M3 11h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  <span className="text-[12px]">{uploading ? 'Subiendo…' : 'Subir imagen'}</span>
                </button>
              )}
            </div>
            <p className="mt-2 text-center text-[12px] text-[#8D9590]">Dimensiones recomendadas: 1080 x 1920px</p>
          </div>
        ) : (
          <div>
            <label htmlFor="ad-video" className="label">Enlace de YouTube</label>
            <input id="ad-video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className="input" />
          </div>
        )}
      </section>

      {/* Campos según el tipo */}
      {type === 'STORY' && (
        <section className={`${CARD} flex items-start justify-between gap-4`}>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[#17201C]">Texto</p>
            <p className="mt-0.5 text-[12px] text-[#8D9590]">Escribe un título o mensaje para tu anuncio. Si incluyes una imagen, el texto aparecerá debajo.</p>
            {config.textEnabled && (
              <div className="mt-4">
                <RichTextEditor value={text} onChange={setText} maxLength={500} label="Texto del anuncio" />
              </div>
            )}
          </div>
          <Toggle label="Mostrar texto" checked={!!config.textEnabled} onChange={(v) => set({ textEnabled: v })} hideLabel />
        </section>
      )}

      {type === 'LINK' && (
        <section className={`${CARD} space-y-4`}>
          <div>
            <p className="text-[14px] font-semibold text-[#17201C]">Enlace</p>
            <p className="mt-0.5 text-[12px] text-[#8D9590]">Envía a tus clientes a una página con el botón de link.</p>
          </div>
          <div>
            <label htmlFor="ad-url" className="label">URL</label>
            <input id="ad-url" value={config.url ?? ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://" className="input" />
          </div>
          <div>
            <label htmlFor="ad-btn" className="label">Texto del botón</label>
            <input id="ad-btn" value={config.buttonText ?? ''} onChange={(e) => set({ buttonText: e.target.value })} maxLength={40} className="input" />
          </div>
          <div>
            <span className={SECTION_TITLE}>Tipografía botón</span>
            <div className="grid grid-cols-2 gap-3">
              {fontSelect('Fuente del botón', config.buttonFont, (v) => set({ buttonFont: v }))}
              <div>
                <span className="mb-1.5 block text-[12px] text-[#4F5752]">Tamaño</span>
                <input type="number" min={10} max={40} aria-label="Tamaño de fuente del botón" value={config.buttonFontSize ?? 16} onChange={(e) => set({ buttonFontSize: Number(e.target.value) || 16 })} className="input" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {colorInput('Color texto', config.buttonTextColor, '#ffffff', (v) => set({ buttonTextColor: v }))}
            {colorInput('Color botón', config.buttonColor, '#0B3B2E', (v) => set({ buttonColor: v }))}
          </div>
        </section>
      )}

      {type === 'SUBSCRIBE' && (
        <section className={`${CARD} space-y-4`}>
          <div>
            <p className="text-[14px] font-semibold text-[#17201C]">Suscríbete</p>
            <p className="mt-0.5 text-[12px] text-[#8D9590]">Captura datos de tus clientes para tu lista VIP.</p>
          </div>
          <div>
            <label htmlFor="ad-label" className="label">Etiqueta del formulario</label>
            <input id="ad-label" value={config.formLabel ?? ''} onChange={(e) => set({ formLabel: e.target.value })} className="input" placeholder="Ej: Únete a nuestro club" />
          </div>
          <div>
            <label htmlFor="ad-title" className="label">Título <span className="text-[#8D9590]">(opcional)</span></label>
            <input id="ad-title" value={config.formTitle ?? ''} onChange={(e) => set({ formTitle: e.target.value })} className="input" />
          </div>
          <div>
            <span className={SECTION_TITLE}>Descripción <span className="font-normal text-[#8D9590]">(opcional)</span></span>
            <RichTextEditor value={text} onChange={setText} maxLength={500} label="Descripción de la suscripción" />
          </div>
          <div>
            <span className={SECTION_TITLE}>Campos a preguntar</span>
            <div className="flex flex-wrap gap-2">
              {FIELD_OPTIONS.map((f) => {
                const on = (config.formFields ?? ['Nombre', 'Correo']).includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      const current = config.formFields ?? ['Nombre', 'Correo'];
                      set({ formFields: on ? current.filter((x) => x !== f) : [...current, f] });
                    }}
                    className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${on ? 'border-[#0B2E25] bg-[#EEF3F1] text-[#0B2E25]' : 'border-[#D9DDD7] text-[#8D9590]'}`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {colorInput('Color botón', config.buttonColor, '#0B3B2E', (v) => set({ buttonColor: v }))}
            {colorInput('Color texto', config.buttonTextColor, '#ffffff', (v) => set({ buttonTextColor: v }))}
          </div>
        </section>
      )}

      {type === 'PRODUCT' && (
        <section className={`${CARD} space-y-4`}>
          <div>
            <p className="text-[14px] font-semibold text-[#17201C]">Elige qué quieres destacar</p>
            <p className="mt-0.5 text-[12px] text-[#8D9590]">Selecciona un menú o un producto para tu anuncio.</p>
          </div>
          <div>
            <label htmlFor="ad-menu" className="label">Menú</label>
            <select id="ad-menu" value={config.menuId ?? ''} onChange={(e) => set({ menuId: e.target.value ? Number(e.target.value) : null })} className="input">
              <option value="">Seleccionar…</option>
              {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ad-product" className="label">Producto</label>
            <select id="ad-product" value={config.productId ?? ''} onChange={(e) => set({ productId: e.target.value ? Number(e.target.value) : null })} className="input">
              <option value="">Seleccionar…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ad-ptext" className="label">Texto para el anuncio <span className="text-[#8D9590]">(opcional)</span></label>
            <textarea id="ad-ptext" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={300} className="input" placeholder="Promoción" />
          </div>
        </section>
      )}

      {/* Programar */}
      <section className={CARD}>
        <span className={SECTION_TITLE}>Programar</span>
        <p className="mb-4 text-[12px] text-[#8D9590]">Escoge el rango de fechas en que deseas que el anuncio se muestre y horarios en que será visible.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ad-start" className="label">Fecha inicio</label>
            <input id="ad-start" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="ad-end" className="label">Fecha fin <span className="text-[#8D9590]">(opcional)</span></label>
            <input id="ad-end" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="input" />
          </div>
        </div>
        <div className="mt-5 border-t border-[#EFF0EC] pt-4">
          <p className="mb-1 text-[13px] font-semibold text-[#17201C]">Mostrar después de</p>
          <p className="mb-2 text-[12px] text-[#8D9590]">Tiempo mínimo en la página antes de mostrar el anuncio.</p>
          <label htmlFor="ad-secs" className="sr-only">Segundos</label>
          <input id="ad-secs" type="number" min={0} value={config.showAfterSeconds ?? 0} onChange={(e) => set({ showAfterSeconds: Number(e.target.value) || 0 })} className="input w-[120px]" />
        </div>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {onDelete && (
            <button type="button" onClick={onDelete} className="btn btn-secondary border-[#F4C7C3] text-[#B42318] hover:bg-[#FDECEA]">Eliminar</button>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
          <button type="button" onClick={save} disabled={saving || uploading} className="btn btn-primary">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
