'use client';


import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Toggle } from './toggle';
import { RichTextEditor } from './rich-text-editor';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const API_ORIGIN = API.replace(/\/api\/v1\/?$/, '');
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

interface CategoryFormProps {
  menuId: number;
  category: {
    id?: number;
    name?: string;
    description?: string;
    parentId?: number | null;
    visibility?: string;
    imageMediaId?: number | null;
    style?: string;
    columns?: number;
    navigation?: string;
    centerContent?: boolean;
    hideTitle?: boolean;
    hideProductTitles?: boolean;
    descriptionEllipsis?: boolean;
  } | null;
  onSave: () => void;
  onCancel: () => void;
}

const SECTION_TITLE = 'block text-[13px] font-semibold text-[#17201C] mb-2.5';
const COUNTER = 'mt-1.5 text-right text-[11px] tabular-nums text-[#8D9590]';

const STYLES = [
  { key: 'WITH_IMAGES', label: 'Con imágenes' },
  { key: 'LIST', label: 'En lista' },
  { key: 'BANNER', label: 'Banner' },
] as const;

const NAVIGATIONS = [
  { key: 'VERTICAL', label: 'Vertical' },
  { key: 'HORIZONTAL', label: 'Horizontal' },
] as const;

/** Tarjeta seleccionable con ilustración, usada para estilos, columnas y navegación. */
function OptionCard({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex flex-col items-center gap-2 focus:outline-none"
    >
      <span
        className={`flex h-[84px] w-full items-center justify-center rounded-[10px] border-2 bg-white transition-colors ${
          selected ? 'border-[#0B2E25]' : 'border-[#D9DDD7] hover:border-[#B5BBB6]'
        }`}
      >
        {children}
      </span>
      <span className={`text-[12px] ${selected ? 'font-semibold text-[#17201C]' : 'text-[#8D9590]'}`}>{label}</span>
    </button>
  );
}

function StyleIcon({ style }: { style: string }) {
  const box = 'fill-none stroke-[#8D9590]';
  if (style === 'WITH_IMAGES') {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" aria-hidden="true" className={box} strokeWidth="1.2">
        <rect x="4" y="4" width="24" height="18" rx="2" /><rect x="36" y="4" width="24" height="18" rx="2" />
        <rect x="4" y="26" width="24" height="18" rx="2" /><rect x="36" y="26" width="24" height="18" rx="2" />
      </svg>
    );
  }
  if (style === 'LIST') {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" aria-hidden="true" className={box} strokeWidth="1.2">
        <rect x="14" y="5" width="36" height="8" rx="2" /><rect x="14" y="20" width="36" height="8" rx="2" /><rect x="14" y="35" width="36" height="8" rx="2" />
      </svg>
    );
  }
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" aria-hidden="true" className={box} strokeWidth="1.2">
      <rect x="10" y="8" width="44" height="32" rx="2" /><path d="M16 34l10-10 8 7 6-5 8 8" />
    </svg>
  );
}

function ColumnsIcon({ count }: { count: number }) {
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" aria-hidden="true" className="fill-none stroke-[#8D9590]" strokeWidth="1.2">
      {Array.from({ length: count }).map((_, i) => {
        const w = count === 1 ? 30 : count === 2 ? 22 : 14;
        const gap = count === 1 ? 0 : count === 2 ? 4 : 3;
        const total = w * count + gap * (count - 1);
        const x = 32 - total / 2 + i * (w + gap);
        return <rect key={i} x={x} y={12} width={w} height={24} rx="2" />;
      })}
    </svg>
  );
}

function NavIcon({ horizontal }: { horizontal: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="#8D9590" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {horizontal ? (
        <><path d="M4 9h15l-3-3M20 15H5l3 3" /></>
      ) : (
        <><path d="M9 4v15l-3-3M15 20V5l3 3" /></>
      )}
    </svg>
  );
}

export function CategoryForm({ menuId, category, onSave, onCancel }: CategoryFormProps) {
  const isNew = !category?.id;
  const [data, setData] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    visibility: category?.visibility ?? 'VISIBLE',
    imageMediaId: (category?.imageMediaId ?? null) as number | null,
    style: category?.style ?? 'WITH_IMAGES',
    columns: category?.columns ?? 1,
    navigation: category?.navigation ?? 'VERTICAL',
    centerContent: category?.centerContent ?? false,
    hideTitle: category?.hideTitle ?? false,
    hideProductTitles: category?.hideProductTitles ?? false,
    descriptionEllipsis: category?.descriptionEllipsis ?? false,
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Cargar la URL de la imagen actual, si existe.
  useEffect(() => {
    if (!data.imageMediaId) return;
    let cancelled = false;
    api
      .get<{ url: string }>(`/media/${data.imageMediaId}`)
      .then((m) => { if (!cancelled) setImageUrl(`${API_ORIGIN}${m.url}`); })
      .catch(() => { if (!cancelled) setImageUrl(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadImage(file: File) {
    setError('');
    if (!ACCEPTED.includes(file.type)) {
      setError('Formato no permitido. Usa JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('La imagen supera los 2 MB.');
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('files', file);
      const res = await fetch(`${API}/media/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      });
      if (!res.ok) throw new Error('No se pudo subir la imagen');
      const [media] = (await res.json()) as { id: number; url: string }[];
      setData((d) => ({ ...d, imageMediaId: media.id }));
      setImageUrl(`${API_ORIGIN}${media.url}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeImage() {
    setData((d) => ({ ...d, imageMediaId: null }));
    setImageUrl(null);
  }

  async function save() {
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/categories', { menuId, parentId: category?.parentId ?? null, ...data });
      } else {
        await api.put(`/categories/${category!.id}`, data);
      }
      toast.success(isNew ? 'Categoría creada' : 'Categoría guardada');
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la categoría');
    } finally {
      setSaving(false);
    }
  }

  const hasImage = !!data.imageMediaId && !!imageUrl;

  return (
    <div className="modal-overlay">
      <div className="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[14px] border border-[#E3E5DF] bg-white shadow-[0_20px_40px_rgba(23,32,28,0.12)]">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4 px-6 pb-4 pt-6">
          <h2 className="font-serif-display truncate text-[26px] font-medium leading-tight text-[#17201C]">
            {isNew ? 'Nueva categoría' : data.name || 'Categoría'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] text-[#6F7772] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 space-y-7 overflow-y-auto px-6 pb-8">
          {/* Imagen */}
          <section>
            <span className={SECTION_TITLE}>Imagen</span>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="sr-only"
              aria-label="Subir imagen de la categoría"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
              }}
            />
            <div className="group relative aspect-[3/1] overflow-hidden rounded-[10px] bg-[#EFF0EC]">
              {hasImage ? (
                <img src={imageUrl!} alt="" className="h-full w-full object-cover" />
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

              {hasImage && (
                <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-black/0 transition-colors group-hover:bg-black/25">
                  <a
                    href={imageUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver imagen"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    aria-label="Cambiar imagen"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 11.5V13h1.5L11 6.5 9.5 5 3 11.5zM10 4.5l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    aria-label="Quitar imagen"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B42318] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-[12px] text-[#8D9590]">720x240px · JPG, PNG o WebP, máx. 2 MB</p>
          </section>

          {/* Nombre */}
          <section>
            <label htmlFor="cat-name" className={SECTION_TITLE}>Nombre</label>
            <input
              id="cat-name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              maxLength={40}
              className="input"
              required
            />
            <p className={COUNTER}>{data.name.length} / 40</p>
          </section>

          {/* Descripción */}
          <section>
            <span className={SECTION_TITLE}>Descripción</span>
            <RichTextEditor
              value={data.description}
              onChange={(value) => setData((d) => ({ ...d, description: value }))}
              maxLength={10000}
              label="Descripción de la categoría"
            />
          </section>

          {/* Estilos */}
          <section>
            <span className={SECTION_TITLE}>Estilos</span>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map((s) => (
                <OptionCard key={s.key} label={s.label} selected={data.style === s.key} onClick={() => setData({ ...data, style: s.key })}>
                  <StyleIcon style={s.key} />
                </OptionCard>
              ))}
            </div>
          </section>

          {/* Columnas */}
          <section>
            <span className={SECTION_TITLE}>Columnas</span>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <OptionCard key={n} label={String(n)} selected={data.columns === n} onClick={() => setData({ ...data, columns: n })}>
                  <ColumnsIcon count={n} />
                </OptionCard>
              ))}
            </div>
          </section>

          {/* Navegación */}
          <section>
            <span className={SECTION_TITLE}>Navegación</span>
            <div className="grid grid-cols-2 gap-3">
              {NAVIGATIONS.map((n) => (
                <OptionCard
                  key={n.key}
                  label={n.label}
                  selected={data.navigation === n.key}
                  onClick={() => setData({ ...data, navigation: n.key })}
                >
                  <NavIcon horizontal={n.key === 'HORIZONTAL'} />
                </OptionCard>
              ))}
            </div>
          </section>

          {/* Acciones */}
          <section>
            <span className={SECTION_TITLE}>Acciones</span>
            <div className="divide-y divide-[#EFF0EC]">
              <Toggle label="Centrar contenido" help="Centra los productos dentro de la categoría" checked={data.centerContent} onChange={(v) => setData({ ...data, centerContent: v })} />
              <Toggle label="Esconder título categoría" help="Oculta el nombre de la categoría en la carta" checked={data.hideTitle} onChange={(v) => setData({ ...data, hideTitle: v })} />
              <Toggle label="Esconder títulos de productos" help="Oculta el nombre de cada producto" checked={data.hideProductTitles} onChange={(v) => setData({ ...data, hideProductTitles: v })} />
              <Toggle label="Agregar elipsis (...) a descripciones de productos largas" help="Corta las descripciones largas con puntos suspensivos" checked={data.descriptionEllipsis} onChange={(v) => setData({ ...data, descriptionEllipsis: v })} />
            </div>
          </section>
        </div>

        {/* Pie */}
        <div className="border-t border-[#EFF0EC] px-6 pb-6 pt-4">
          {error && (
            <p role="alert" className="mb-3 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">
              {error}
            </p>
          )}
          <button type="button" onClick={save} disabled={saving || uploading || !data.name} className="btn btn-primary btn-lg w-full">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
