'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

export interface RowCategory {
  id: number;
  name: string;
  childCount: number;
}

interface MenuRef {
  id: number;
  name: string;
}

interface Props {
  category: RowCategory;
  currentMenuId: number;
  onChanged: () => void;
  onError: (message: string) => void;
}

const ITEM =
  'flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-[13px] text-[#17201C] transition-colors hover:bg-[#F6F6F3] disabled:cursor-not-allowed disabled:text-[#B5BBB6] disabled:hover:bg-transparent';

function errorText(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function CategoryRowActions({ category, currentMenuId, onChanged, onError }: Props) {
  const [open, setOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [menus, setMenus] = useState<MenuRef[] | null>(null);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    setCopying(false);
  }

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

  async function toggleCopy() {
    if (copying) {
      setCopying(false);
      return;
    }
    setCopying(true);
    if (menus === null) {
      try {
        setMenus(await api.get<MenuRef[]>('/menus'));
      } catch (e) {
        onError(errorText(e, 'No se pudieron cargar las cartas'));
        setCopying(false);
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

  function remove() {
    const extra = category.childCount > 0 ? ' Sus subcategorías también se moverán.' : '';
    if (!window.confirm(`¿Mover "${category.name}" a la papelera?${extra} Sus productos también se moverán y podrás restaurarlos desde la papelera.`)) return;
    run(() => api.del(`/categories/${category.id}`), 'No se pudo mover la categoría a la papelera');
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Acciones de ${category.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C] ${
          open ? 'bg-[#F6F6F3] text-[#17201C]' : 'text-[#8D9590]'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.6" />
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
          className="absolute right-0 top-full z-40 mt-2 w-[220px] overflow-hidden rounded-[12px] border border-[#E3E5DF] bg-white py-1.5 text-left shadow-[0_12px_28px_rgba(23,32,28,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => run(() => api.post(`/categories/${category.id}/duplicate`, {}), 'No se pudo duplicar la categoría')}
            className={ITEM}
          >
            <span>Duplicar</span>
            <CopyIcon />
          </button>

          <button type="button" role="menuitem" disabled={busy} onClick={toggleCopy} className={ITEM}>
            <span>Copiar a…</span>
            <Chevron open={copying} />
          </button>
          {copying && (
            <div className="max-h-[200px] overflow-y-auto border-y border-[#EFF0EC] bg-[#FAFAF8] py-1">
              {menus === null ? (
                <p className="px-6 py-2 text-[12px] text-[#8D9590]">Cargando…</p>
              ) : menus.length === 0 ? (
                <p className="px-6 py-2 text-[12px] text-[#8D9590]">No hay cartas disponibles</p>
              ) : (
                menus.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => api.post(`/categories/${category.id}/copy-to-menu`, { menuId: m.id }),
                        'No se pudo copiar la categoría',
                      )
                    }
                    className="block w-full px-6 py-1.5 text-left text-[13px] text-[#17201C] transition-colors hover:bg-[#F0F2EE] disabled:opacity-50"
                  >
                    {m.name}
                    {m.id === currentMenuId && <span className="ml-1.5 text-[11px] text-[#8D9590]">(actual)</span>}
                  </button>
                ))
              )}
            </div>
          )}

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
