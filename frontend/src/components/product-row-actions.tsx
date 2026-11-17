'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

export interface RowProduct {
  id: number;
  name: string;
  type: string;
  soldOut: boolean;
}

interface CategoryRef {
  id: number;
  name: string;
  menuId: number;
}

interface MenuRef {
  id: number;
  name: string;
}

interface Props {
  product: RowProduct;
  currentCategoryId: number;
  onEdit: () => void;
  onChanged: () => void;
  onError: (message: string) => void;
}

const ITEM =
  'flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-[13px] text-[#17201C] transition-colors hover:bg-[#F6F6F3] disabled:cursor-not-allowed disabled:text-[#B5BBB6] disabled:hover:bg-transparent';

function errorText(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function ProductRowActions({ product, currentCategoryId, onEdit, onChanged, onError }: Props) {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<'move' | 'copy' | null>(null);
  const [categories, setCategories] = useState<CategoryRef[] | null>(null);
  const [menus, setMenus] = useState<MenuRef[]>([]);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    setSubmenu(null);
  }

  // Cerrar al hacer clic fuera o al pulsar Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function toggleSubmenu(kind: 'move' | 'copy') {
    if (submenu === kind) {
      setSubmenu(null);
      return;
    }
    setSubmenu(kind);
    if (categories === null) {
      try {
        const [cats, ms] = await Promise.all([api.get<CategoryRef[]>('/categories'), api.get<MenuRef[]>('/menus')]);
        setCategories(cats);
        setMenus(ms);
      } catch (e) {
        onError(errorText(e, 'No se pudieron cargar las categorías'));
        setSubmenu(null);
      }
    }
  }

  async function run(action: () => Promise<unknown>, fallback: string) {
    setBusy(true);
    try {
      await action();
      close();
      onChanged();
    } catch (e) {
      onError(errorText(e, fallback));
    } finally {
      setBusy(false);
    }
  }

  function moveTo(categoryId: number) {
    run(() => api.post(`/products/${product.id}/move`, { categoryId }), 'No se pudo mover el producto');
  }

  function copyTo(categoryId: number) {
    run(() => api.post(`/products/${product.id}/copy`, { categoryId }), 'No se pudo copiar el producto');
  }

  function remove() {
    if (!window.confirm(`¿Mover "${product.name}" a la papelera? Podrás restaurarlo desde la papelera.`)) return;
    run(() => api.del(`/products/${product.id}`), 'No se pudo mover el producto a la papelera');
  }

  /** Categorías agrupadas por carta, excluyendo la actual si se trata de mover. */
  function renderTargets(kind: 'move' | 'copy') {
    if (categories === null) {
      return <p className="px-6 py-2 text-[12px] text-[#8D9590]">Cargando…</p>;
    }
    const pick = (cat: CategoryRef) => (kind === 'move' ? moveTo(cat.id) : copyTo(cat.id));
    const groups = menus
      .map((m) => ({
        menu: m,
        items: categories.filter(
          (c) => c.menuId === m.id && !(kind === 'move' && c.id === currentCategoryId),
        ),
      }))
      .filter((g) => g.items.length > 0);

    if (groups.length === 0) {
      return <p className="px-6 py-2 text-[12px] text-[#8D9590]">No hay otras categorías disponibles</p>;
    }
    return (
      <div className="max-h-[220px] overflow-y-auto border-y border-[#EFF0EC] bg-[#FAFAF8] py-1">
        {groups.map((g) => (
          <div key={g.menu.id}>
            <p className="px-6 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8D9590]">{g.menu.name}</p>
            {g.items.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={busy}
                onClick={() => pick(c)}
                className="block w-full px-6 py-1.5 text-left text-[13px] text-[#17201C] transition-colors hover:bg-[#F0F2EE] disabled:opacity-50"
              >
                {c.name}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const isCombo = product.type === 'COMBO';

  return (
    <div ref={rootRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Acciones de ${product.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C] ${
          open ? 'bg-[#F6F6F3] text-[#17201C]' : 'text-[#8D9590]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M19.4 13.5l1.6 1.2-1.8 3.1-1.9-.7a7.5 7.5 0 01-1.7 1l-.3 2h-3.6l-.3-2a7.5 7.5 0 01-1.7-1l-1.9.7-1.8-3.1 1.6-1.2a7.6 7.6 0 010-2l-1.6-1.2 1.8-3.1 1.9.7a7.5 7.5 0 011.7-1l.3-2h3.6l.3 2a7.5 7.5 0 011.7 1l1.9-.7 1.8 3.1-1.6 1.2a7.6 7.6 0 010 2z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-[248px] overflow-hidden rounded-[12px] border border-[#E3E5DF] bg-white py-1.5 shadow-[0_12px_28px_rgba(23,32,28,0.12)]"
        >
          {/* Mover a… */}
          <button type="button" role="menuitem" onClick={() => toggleSubmenu('move')} disabled={busy} className={ITEM}>
            <span>Mover a…</span>
            <Chevron open={submenu === 'move'} />
          </button>
          {submenu === 'move' && renderTargets('move')}

          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => {
              close();
              onEdit();
            }}
            className={ITEM}
          >
            Agregar presentaciones
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => run(() => api.put(`/products/${product.id}`, { type: isCombo ? 'SINGLE' : 'COMBO' }), 'No se pudo cambiar el tipo')}
            className={ITEM}
          >
            {isCombo ? 'Volver producto único' : 'Volver combo'}
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => run(() => api.patch(`/products/${product.id}/sold-out`, { soldOut: !product.soldOut }), 'No se pudo actualizar')}
            className={ITEM}
          >
            <span>Agotado</span>
            {product.soldOut && <Check />}
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => run(() => api.post(`/products/${product.id}/duplicate`, {}), 'No se pudo duplicar el producto')}
            className={ITEM}
          >
            <span>Duplicar</span>
            <CopyIcon />
          </button>

          {/* Copiar a… */}
          <button type="button" role="menuitem" onClick={() => toggleSubmenu('copy')} disabled={busy} className={ITEM}>
            <span>Copiar a…</span>
            <Chevron open={submenu === 'copy'} />
          </button>
          {submenu === 'copy' && renderTargets('copy')}

          <div className="my-1 border-t border-[#EFF0EC]" />

          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={remove}
            className="flex w-full items-center justify-between gap-3 bg-[#B42318] px-3.5 py-2.5 text-left text-[13px] font-medium text-white transition-colors hover:bg-[#9A1E14] disabled:opacity-60"
          >
            <span>Eliminar</span>
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className={`text-[#8D9590] transition-transform ${open ? 'rotate-90' : ''}`}
    >
      <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-[#2F7D5B]">
      <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-[#8D9590]">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 10.5h-1A1.5 1.5 0 011 9V2.5A1.5 1.5 0 012.5 1H9a1.5 1.5 0 011.5 1.5v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
