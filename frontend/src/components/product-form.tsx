'use client';


import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { mediaUrl, uploadImage } from '@/lib/media';
import { Toggle } from './toggle';
import { ProductModifiers, type ModifierDraft } from './product-modifiers';
import { ProductExtras } from './product-extras';
import { ProductHistory } from './product-history';
import { RichTextEditor } from './rich-text-editor';
import { TagInput, type TagRef } from './tag-input';

interface ProductFormProps {
  product: Partial<Product> | null;
  /** Categoría a la que pertenece un producto nuevo. */
  categoryId?: number;
  onSave: () => void;
  onCancel: () => void;
}

interface Product {
  id: number;
  categoryId: number;
  code: string | null;
  name: string;
  description: string;
  type: string;
  visibility: string;
  hidePrices: boolean;
  recommended: boolean;
  isNew: boolean;
  soldOut: boolean;
  sortOrder: number;
  preparationTime: number | null;
  timePerUnit: boolean;
  productType1: string | null;
  productType2: string | null;
  productType3: string | null;
  productType4: string | null;
  link: string | null;
  prices: { name: string; value: number }[];
  priceRanges: { fromQuantity: number; toQuantity: number | null; price: number }[];
  modifiers: {
    id: number;
    name: string;
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    sortOrder?: number;
    options: { id?: number; name: string; price: number | string; sortOrder?: number }[];
  }[];
  productMedia: { mediaId: number; sortOrder: number; media: { id: number; url: string } }[];
  productTags: { tag: TagRef }[];
}

type Tab = 'basicos' | 'modificadores' | 'extras' | 'historial';

const TABS: { key: Tab; label: string }[] = [
  { key: 'basicos', label: 'Datos básicos' },
  { key: 'modificadores', label: 'Modificadores' },
  { key: 'extras', label: 'Extras' },
  { key: 'historial', label: 'Historial' },
];

const SECTION_TITLE = 'block text-[13px] font-semibold text-[#17201C] mb-2.5';
const COUNTER = 'mt-1.5 text-right text-[11px] tabular-nums text-[#8D9590]';
const MAX_IMAGES = 3;

interface ImageItem {
  mediaId: number;
  url: string;
}

function toModifierDrafts(mods: Product['modifiers'] | undefined): ModifierDraft[] {
  return (mods ?? []).map((m, i) => ({
    id: m.id,
    name: m.name,
    type: m.type === 'OPTION' ? 'OPTION' : 'ADDITION',
    required: !!m.required,
    min: m.min ?? 0,
    max: m.max ?? 1,
    sortOrder: m.sortOrder ?? i,
    options: (m.options ?? []).map((o, j) => ({
      id: o.id,
      name: o.name,
      price: Number(o.price) || 0,
      sortOrder: o.sortOrder ?? j,
    })),
  }));
}

function toImageItems(pms: Product['productMedia'] | undefined): ImageItem[] {
  return [...(pms ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pm) => ({ mediaId: pm.mediaId, url: mediaUrl(pm.media.url) }));
}

export function ProductForm({ product, categoryId, onSave, onCancel }: ProductFormProps) {
  const isNew = !product?.id;
  const [data, setData] = useState({
    categoryId: product?.categoryId ?? categoryId ?? 0,
    code: product?.code ?? '',
    name: product?.name ?? '',
    description: product?.description ?? '',
    type: product?.type ?? 'SINGLE',
    visibility: product?.visibility ?? 'VISIBLE',
    hidePrices: product?.hidePrices ?? false,
    recommended: product?.recommended ?? false,
    isNew: product?.isNew ?? false,
    soldOut: product?.soldOut ?? false,
    sortOrder: product?.sortOrder ?? 0,
    preparationTime: (product?.preparationTime ?? null) as number | null,
    timePerUnit: product?.timePerUnit ?? false,
    productType1: product?.productType1 ?? '',
    productType2: product?.productType2 ?? '',
    productType3: product?.productType3 ?? '',
    productType4: product?.productType4 ?? '',
    link: product?.link ?? '',
    prices: product?.prices?.length ? [...product.prices] : [{ name: '', value: 0 }],
    modifiers: toModifierDrafts(product?.modifiers),
  });
  const [images, setImages] = useState<ImageItem[]>(toImageItems(product?.productMedia));
  const [tags, setTags] = useState<TagRef[]>((product?.productTags ?? []).map((pt) => pt.tag));
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [imageError, setImageError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef<number | null>(null);

  const [tab, setTab] = useState<Tab>('basicos');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!data.categoryId) {
      setError('No se pudo determinar la categoría del producto. Cierra el formulario e inténtalo de nuevo.');
      return;
    }
    setError('');
    setSaving(true);
    const payload = {
      ...data,
      productMedia: images.map((img, i) => ({ mediaId: img.mediaId, sortOrder: i })),
      tagIds: tags.map((t) => t.id),
    };
    try {
      if (isNew) {
        await api.post('/products', payload);
      } else {
        await api.put(`/products/${product!.id}`, payload);
      }
      toast.success(isNew ? 'Producto creado' : 'Producto guardado');
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  }

  // ---------- Imágenes ----------
  function pickImage(slot: number) {
    pendingSlot.current = slot;
    fileRef.current?.click();
  }

  async function onImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const slot = pendingSlot.current ?? images.length;
    e.target.value = '';
    if (!file) return;
    setImageError('');
    setUploadingSlot(slot);
    try {
      const media = await uploadImage(file);
      const item = { mediaId: media.id, url: mediaUrl(media.url) };
      setImages((list) => {
        const next = [...list];
        if (slot < next.length) next[slot] = item;
        else next.push(item);
        return next.slice(0, MAX_IMAGES);
      });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'No se pudo subir la imagen');
    } finally {
      setUploadingSlot(null);
    }
  }

  function removeImage(i: number) {
    setImages((list) => list.filter((_, j) => j !== i));
  }

  // ---------- Precios ----------
  function addPrice() {
    setData({ ...data, prices: [...data.prices, { name: '', value: 0 }] });
  }

  function removePrice(i: number) {
    const p = [...data.prices];
    p.splice(i, 1);
    setData({ ...data, prices: p.length ? p : [{ name: '', value: 0 }] });
  }

  function updatePrice(i: number, patch: Partial<{ name: string; value: number }>) {
    const prices = [...data.prices];
    prices[i] = { ...prices[i], ...patch };
    setData({ ...data, prices });
  }

  // Estado único del selector: "Agotado" es un estado del producto que
  // reemplaza la visibilidad en el selector (se guarda como soldOut).
  const statusValue: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT' = data.soldOut ? 'SOLD_OUT' : data.visibility === 'HIDDEN' ? 'HIDDEN' : 'VISIBLE';

  function changeStatus(value: string) {
    if (value === 'SOLD_OUT') {
      setData({ ...data, soldOut: true });
    } else {
      setData({ ...data, soldOut: false, visibility: value });
    }
  }

  return (
    <div className="modal-overlay">
      <div className="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[14px] border border-[#E3E5DF] bg-white shadow-[0_20px_40px_rgba(23,32,28,0.12)]">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <h2 className="font-serif-display truncate text-[26px] font-medium leading-tight text-[#17201C]">
            {isNew ? 'Nuevo producto' : data.name || 'Producto'}
          </h2>
          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="relative">
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${
                  statusValue === 'VISIBLE' ? 'bg-[#2F7D5B]' : statusValue === 'SOLD_OUT' ? 'bg-[#B7791F]' : 'bg-[#CDD1C9]'
                }`}
              />
              <select
                aria-label="Visibilidad"
                value={statusValue}
                onChange={(e) => changeStatus(e.target.value)}
                className="h-9 appearance-none rounded-[8px] border border-[#E3E5DF] bg-white pl-7 pr-8 text-[13px] text-[#17201C] transition-colors hover:border-[#CDD1C9] focus:outline-none"
              >
                <option value="VISIBLE">Visible</option>
                <option value="HIDDEN">Oculto</option>
                <option value="SOLD_OUT">Agotado</option>
              </select>
              <svg
                aria-hidden="true"
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8D9590]"
              >
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#6F7772] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div role="tablist" className="flex gap-1 overflow-x-auto px-6 pb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`tab whitespace-nowrap ${tab === t.key ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6">
          {tab === 'modificadores' ? (
            <ProductModifiers value={data.modifiers} onChange={(modifiers) => setData({ ...data, modifiers })} />
          ) : tab === 'extras' ? (
            <ProductExtras value={data} onChange={(patch) => setData({ ...data, ...patch })} />
          ) : tab === 'historial' ? (
            product?.id ? (
              <ProductHistory productId={product.id} />
            ) : (
              <p className="py-16 text-center text-[13px] text-[#8D9590]">Guarda el producto para ver su historial</p>
            )
          ) : (
            <div className="space-y-7 pb-8">
              {/* Imágenes */}
              <section>
                <span className={SECTION_TITLE}>Imágenes</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Subir imagen del producto"
                  onChange={onImageFile}
                />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                    const img = images[i];
                    const busy = uploadingSlot === i;
                    if (img) {
                      return (
                        <div key={`${img.mediaId}-${i}`} className="group relative aspect-square overflow-hidden rounded-[10px] bg-[#EFF0EC]">
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-colors group-hover:bg-black/25">
                            <a
                              href={img.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Ver imagen"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.3" />
                                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                              </svg>
                            </a>
                            <button
                              type="button"
                              onClick={() => pickImage(i)}
                              disabled={busy}
                              aria-label="Cambiar imagen"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2E25] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                            >
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M3 11.5V13h1.5L11 6.5 9.5 5 3 11.5zM10 4.5l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              aria-label="Quitar imagen"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B42318] text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                            >
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                          {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[12px] text-[#4F5752]">Subiendo…</div>}
                        </div>
                      );
                    }
                    const isNextSlot = i === images.length;
                    return (
                      <button
                        key={`empty-${i}`}
                        type="button"
                        onClick={() => pickImage(i)}
                        disabled={!isNextSlot || uploadingSlot !== null}
                        aria-label={isNextSlot ? 'Agregar imagen' : 'Espacio para imagen'}
                        className={`flex aspect-square items-center justify-center rounded-[10px] border border-dashed bg-white transition-colors ${
                          isNextSlot ? 'border-[#CDD1C9] text-[#8D9590] hover:bg-[#F6F6F3]' : 'border-[#E3E5DF] text-[#D5D9D3]'
                        } disabled:cursor-default`}
                      >
                        {busy ? (
                          <span className="text-[12px]">Subiendo…</span>
                        ) : isNextSlot ? (
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                            <path d="M11 3v16M3 11h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[12px] text-[#8D9590]">720x720px · JPG, PNG o WebP, máx. 2 MB</p>
                {imageError && (
                  <p role="alert" className="mt-2 text-[12px] text-[#B42318]">{imageError}</p>
                )}
              </section>

              {/* Nombre */}
              <section>
                <label htmlFor="product-name" className={SECTION_TITLE}>Nombre</label>
                <input
                  id="product-name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  maxLength={40}
                  className="input"
                  required
                />
                <p className={COUNTER}>{data.name.length} / 40</p>
              </section>

              {/* Código */}
              <section>
                <label htmlFor="product-code" className={SECTION_TITLE}>Código de producto</label>
                <input
                  id="product-code"
                  value={data.code}
                  onChange={(e) => setData({ ...data, code: e.target.value })}
                  maxLength={30}
                  placeholder="Ej: CEV-001"
                  className="input"
                />
              </section>

              {/* Descripción */}
              <section>
                <span className={SECTION_TITLE}>Descripción</span>
                <RichTextEditor
                  value={data.description}
                  onChange={(value) => setData((d) => ({ ...d, description: value }))}
                  maxLength={10000}
                />
              </section>

              {/* Precios */}
              <section>
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#17201C]">Precios</span>
                </div>

                <div className="rounded-[10px] border border-[#E3E5DF] bg-white p-3">
                  {data.prices.map((p, i) => (
                    <div key={i} className="mb-2 flex items-center gap-2">
                      <input
                        placeholder="Nombre"
                        aria-label={`Nombre del precio ${i + 1}`}
                        value={p.name}
                        onChange={(e) => updatePrice(i, { name: e.target.value })}
                        className="input flex-1"
                      />
                      <div className="relative w-[120px] flex-shrink-0">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#6F7772]">$</span>
                        <input
                          type="number"
                          step="0.01"
                          aria-label={`Valor del precio ${i + 1}`}
                          value={String(p.value)}
                          onChange={(e) => updatePrice(i, { value: Number(e.target.value) })}
                          className="input pl-7"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePrice(i)}
                        aria-label={`Quitar precio ${i + 1}`}
                        className="flex h-9 w-7 flex-shrink-0 items-center justify-center rounded-[6px] text-[#8D9590] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C]"
                      >
                        <svg width="4" height="14" viewBox="0 0 4 14" fill="currentColor" aria-hidden="true">
                          <circle cx="2" cy="2" r="1.5" />
                          <circle cx="2" cy="7" r="1.5" />
                          <circle cx="2" cy="12" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addPrice}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-[8px] py-3 text-[13px] font-medium text-[#17201C] transition-colors hover:bg-[#F6F6F3]"
                  >
                    Agregar más precios
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </section>

              {/* Etiquetas */}
              <section>
                <span className={SECTION_TITLE}>Etiquetas</span>
                <TagInput value={tags} onChange={setTags} />
              </section>

              {/* Acciones */}
              <section>
                <span className={SECTION_TITLE}>Acciones</span>
                <div className="divide-y divide-[#EFF0EC]">
                  <Toggle
                    label="Esconder precios"
                    help="Oculta los precios de este producto en la carta pública"
                    checked={data.hidePrices}
                    onChange={(v) => setData({ ...data, hidePrices: v })}
                  />
                  <Toggle
                    label="Recomendado"
                    checked={data.recommended}
                    onChange={(v) => setData({ ...data, recommended: v })}
                  />
                  <Toggle label="Nuevo" checked={data.isNew} onChange={(v) => setData({ ...data, isNew: v })} />
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="border-t border-[#EFF0EC] px-6 pb-6 pt-4">
          {error && (
            <p role="alert" className="mb-3 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3 py-2 text-[13px] text-[#B42318]">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || uploadingSlot !== null || !data.name}
            className="btn btn-primary btn-lg w-full"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
