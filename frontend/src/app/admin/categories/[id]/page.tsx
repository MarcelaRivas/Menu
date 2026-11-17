'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { ProductForm } from '@/components/product-form';
import { ProductRowActions } from '@/components/product-row-actions';

interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  type: string;
  visibility: string;
  hidePrices: boolean;
  recommended: boolean;
  isNew: boolean;
  soldOut: boolean;
  sortOrder: number;
  prices: { id?: number; name: string; value: number }[];
}

interface Category {
  id: number;
  name: string;
  menuId: number;
}

type BulkAction = 'show' | 'hide' | 'soldOut' | 'available' | 'delete' | 'move';

/** Lista de productos en la papelera, con restaurar y borrado definitivo. */
function ProductTrash({ items, busy, onRestore, onDelete }: { items: Product[]; busy: boolean; onRestore: (id: number) => void; onDelete: (p: Product) => void }) {
  if (items.length === 0) {
    return <p className="px-4 py-10 text-center text-[13px] text-[#8D9590]">La papelera está vacía.</p>;
  }
  return (
    <div className="card divide-y divide-[#EFF0EC] overflow-hidden">
      <p className="px-4 py-3 text-[12px] text-[#8D9590]">Estos productos están ocultos para tus clientes. Puedes restaurarlos o eliminarlos definitivamente.</p>
      {items.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-[#17201C]">{p.name}</p>
            {p.prices.length > 0 && <p className="text-[12px] text-[#8D9590]">${p.prices[0].value}</p>}
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button type="button" disabled={busy} onClick={() => onRestore(p.id)} className="btn btn-secondary btn-sm">Restaurar</button>
            <button type="button" disabled={busy} onClick={() => onDelete(p)} className="btn btn-secondary btn-sm border-[#F4C7C3] text-[#B42318]">Eliminar definitivamente</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoryProductsPage() {
  const params = useParams();
  const catId = params.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [trashed, setTrashed] = useState<Product[]>([]);

  async function reload() {
    setProducts(await api.get<Product[]>(`/products?categoryId=${catId}`));
    setTrashed(await api.get<Product[]>(`/products?categoryId=${catId}&trashed=true`));
  }

  useEffect(() => {
    if (!catId) return;
    api.get<Category>(`/categories/${catId}`).then(setCategory);
    reload()
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los productos'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  async function toggleVisibility(p: Product) {
    const next = p.visibility === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    setError('');
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, visibility: next } : x)));
    try {
      await api.put(`/products/${p.id}`, { visibility: next });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar la visibilidad');
      await reload();
    }
  }

  function openEdit(p: Product) {
    setEditing(p);
    setShowForm(true);
  }

  async function restoreProduct(id: number) {
    setError('');
    try {
      await api.post(`/products/${id}/restore`, {});
      toast.success('Producto restaurado');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo restaurar el producto');
    }
  }

  async function deleteForever(p: Product) {
    if (!window.confirm(`¿Eliminar "${p.name}" definitivamente? No se puede deshacer.`)) return;
    setError('');
    try {
      await api.del(`/products/${p.id}/permanent`);
      toast.success('Producto eliminado');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el producto');
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function loadCategories() {
    if (categories.length === 0) {
      setCategories(await api.get<Category[]>('/categories'));
    }
  }

  /** Aplica una acción a los productos seleccionados, uno por uno, e informa el resultado. */
  async function bulk(action: BulkAction, target?: number) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === 'delete' && !window.confirm(`¿Mover ${ids.length} producto(s) a la papelera? Podrás restaurarlos desde la papelera.`)) return;

    setBulkBusy(true);
    setError('');
    let failed = 0;
    for (const id of ids) {
      try {
        if (action === 'show') await api.put(`/products/${id}`, { visibility: 'VISIBLE' });
        else if (action === 'hide') await api.put(`/products/${id}`, { visibility: 'HIDDEN' });
        else if (action === 'soldOut') await api.patch(`/products/${id}/sold-out`, { soldOut: true });
        else if (action === 'available') await api.patch(`/products/${id}/sold-out`, { soldOut: false });
        else if (action === 'delete') await api.del(`/products/${id}`);
        else if (action === 'move' && target) await api.post(`/products/${id}/move`, { categoryId: target });
      } catch {
        failed++;
      }
    }
    setSelected(new Set());
    await reload();
    setBulkBusy(false);
    if (failed > 0) setError(`${failed} de ${ids.length} producto(s) no se pudieron actualizar.`);
    else toast.success(`${ids.length} producto(s) actualizados`);
  }

  const sorted = [...products].sort((a, b) => a.sortOrder - b.sortOrder);
  const allSelected = sorted.length > 0 && selected.size === sorted.length;

  return (
    <AdminLayout active="menus">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1>Productos</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">{category?.name}</p>
        </div>
        <button
          onClick={() => {
            setEditing({ categoryId: Number(catId), name: '', prices: [{ name: '', value: 0 }] });
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          + Nuevo producto
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingState />
      ) : showTrash ? (
        <>
          <div className="mb-3 flex justify-start">
            <button type="button" onClick={() => setShowTrash(false)} className="btn btn-ghost btn-sm">← Volver a los productos</button>
          </div>
          <ProductTrash items={trashed} busy={bulkBusy} onRestore={restoreProduct} onDelete={deleteForever} />
        </>
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={() => setShowTrash(true)} className="btn btn-secondary btn-sm">Papelera ({trashed.length})</button>
          </div>
          {sorted.length > 0 && (
            <div className="mb-3 flex items-center gap-2 px-1 text-[13px] text-[#4F5752]">
              <input
                type="checkbox"
                aria-label="Seleccionar todos"
                checked={allSelected}
                onChange={(e) => setSelected(e.target.checked ? new Set(sorted.map((p) => p.id)) : new Set())}
                className="h-4 w-4"
              />
              <span>Seleccionar todos</span>
            </div>
          )}

          {selected.size > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[12px] border border-[#CDD1C9] bg-white px-4 py-2.5">
              <span className="mr-2 text-[13px] font-medium text-[#17201C]">{selected.size} seleccionado(s)</span>
              <button type="button" disabled={bulkBusy} onClick={() => bulk('show')} className="btn btn-secondary btn-sm">Mostrar</button>
              <button type="button" disabled={bulkBusy} onClick={() => bulk('hide')} className="btn btn-secondary btn-sm">Ocultar</button>
              <button type="button" disabled={bulkBusy} onClick={() => bulk('soldOut')} className="btn btn-secondary btn-sm">Marcar agotado</button>
              <button type="button" disabled={bulkBusy} onClick={() => bulk('available')} className="btn btn-secondary btn-sm">Marcar disponible</button>
              <select
                aria-label="Mover a categoría"
                disabled={bulkBusy}
                defaultValue=""
                onFocus={loadCategories}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v) bulk('move', v);
                  e.target.value = '';
                }}
                className="input w-auto py-1.5 text-[13px]"
              >
                <option value="">Mover a…</option>
                {categories
                  .filter((c) => c.id !== Number(catId))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <button type="button" disabled={bulkBusy} onClick={() => bulk('delete')} className="btn btn-secondary btn-sm border-[#F4C7C3] text-[#B42318]">
                Mover a la papelera
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="btn btn-ghost btn-sm ml-auto">Limpiar selección</button>
            </div>
          )}

          <div className="card divide-y divide-[#EFF0EC] overflow-visible">
            {sorted.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Seleccionar ${p.name}`}
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="h-4 w-4 flex-shrink-0"
                />
                <button type="button" onClick={() => openEdit(p)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[14px] font-medium text-[#17201C]">{p.name}</span>
                  {p.prices.length > 0 && (
                    <span className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-[#8D9590]">
                      {p.prices.map((pr, i) => (
                        <span key={i}>
                          ${pr.value}
                          {pr.name ? ` (${pr.name})` : ''}
                        </span>
                      ))}
                    </span>
                  )}
                </button>

                <div className="hidden flex-shrink-0 items-center gap-1.5 sm:flex">
                  {p.type === 'COMBO' && <span className="tag tag-new">Combo</span>}
                  {p.recommended && <span className="tag tag-recommended">Recomendado</span>}
                  {p.isNew && <span className="tag tag-new">Nuevo</span>}
                  {p.soldOut && <span className="tag tag-soldout">Agotado</span>}
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={p.visibility === 'VISIBLE'}
                  aria-label={`Visible en la carta: ${p.name}`}
                  onClick={() => toggleVisibility(p)}
                  className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${p.visibility === 'VISIBLE' ? 'bg-[#2F7D5B]' : 'bg-[#E3E5DF]'}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${p.visibility === 'VISIBLE' ? 'translate-x-4' : ''}`} />
                </button>

                <ProductRowActions
                  product={{ id: p.id, name: p.name, type: p.type, soldOut: p.soldOut }}
                  currentCategoryId={Number(catId)}
                  onEdit={() => openEdit(p)}
                  onChanged={() => {
                    setError('');
                    reload().catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los productos'));
                  }}
                  onError={setError}
                />
              </div>
            ))}
            {sorted.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-[#8D9590]">Sin productos. Crea uno.</p>}
          </div>
        </>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categoryId={Number(catId)}
          onSave={async () => {
            setShowForm(false);
            setEditing(null);
            await reload();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
