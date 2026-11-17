'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

export interface RowMenu {
  id: number;
  name: string;
  active?: boolean;
}

interface MenuRef {
  id: number;
  name: string;
}

interface PageRef {
  id: number;
  name: string;
}

interface Props {
  menu: RowMenu;
  onEdit: () => void;
  onChanged: () => void;
  onError: (message: string) => void;
}

const ITEM =
  'flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-[13px] text-[#17201C] transition-colors hover:bg-[#F6F6F3] disabled:cursor-not-allowed disabled:text-[#B5BBB6] disabled:hover:bg-transparent';

function errorText(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

type Submenu = 'replace' | 'copy' | null;

export function MenuRowActions({ menu, onEdit, onChanged, onError }: Props) {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<Submenu>(null);
  const [menus, setMenus] = useState<MenuRef[] | null>(null);
  const [pages, setPages] = useState<PageRef[] | null>(null);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    setSubmenu(null);
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

  async function toggleSubmenu(kind: 'replace' | 'copy') {
    if (submenu === kind) {
      setSubmenu(null);
      return;
    }
    setSubmenu(kind);
    try {
      if (kind === 'replace' && menus === null) setMenus(await api.get<MenuRef[]>('/menus'));
      if (kind === 'copy' && pages === null) setPages(await api.get<PageRef[]>('/pages'));
    } catch (e) {
      onError(errorText(e, 'No se pudieron cargar las opciones'));
      setSubmenu(null);
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

  function replaceFrom(source: MenuRef) {
    if (!window.confirm(`¿Reemplazar las categorías de "${menu.name}" con las de "${source.name}"? Se perderán las actuales.`)) return;
    run(() => api.post(`/menus/${menu.id}/replace`, { sourceId: source.id }), 'No se pudo reemplazar la carta');
  }

  function copyTo(page: PageRef) {
    run(() => api.post(`/menus/${menu.id}/copy-to-page`, { pageId: page.id }), 'No se pudo copiar la carta');
  }

  /** Mueve la carta a la papelera: queda oculta y se puede restaurar. */
  function trash() {
    run(() => api.put(`/menus/${menu.id}`, { active: false }), 'No se pudo mover la carta a la papelera');
  }

  function restore() {
    run(() => api.put(`/menus/${menu.id}`, { active: true }), 'No se pudo restaurar la carta');
  }

  /** Borrado definitivo: solo desde la papelera y con confirmación. */
  function removeForever() {
    if (!window.confirm(`¿Eliminar "${menu.name}" definitivamente? Se borrarán también sus categorías y productos. No se puede deshacer.`)) return;
    run(() => api.del(`/menus/${menu.id}`), 'No se pudo eliminar la carta');
  }

  function renderList<T extends { id: number; name: string }>(items: T[] | null, pick: (item: T) => void, empty: string) {
    if (items === null) return <p className="px-6 py-2 text-[12px] text-[#8D9590]">Cargando…</p>;
    const others = items.filter((i) => !(submenu === 'replace' && i.id === menu.id));
    if (others.length === 0) return <p className="px-6 py-2 text-[12px] text-[#8D9590]">{empty}</p>;
    return (
      <div className="max-h-[200px] overflow-y-auto border-y border-[#EFF0EC] bg-[#FAFAF8] py-1">
        {others.map((i) => (
          <button
            key={i.id}
            type="button"
            disabled={busy}
            onClick={() => pick(i)}
            className="block w-full px-6 py-1.5 text-left text-[13px] text-[#17201C] transition-colors hover:bg-[#F0F2EE] disabled:opacity-50"
          >
            {i.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Acciones de ${menu.name}`}
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
          className="absolute right-0 top-full z-40 mt-2 w-[248px] overflow-hidden rounded-[12px] border border-[#E3E5DF] bg-white py-1.5 text-left shadow-[0_12px_28px_rgba(23,32,28,0.12)]"
        >
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
            <span>Editar menú</span>
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => run(() => api.post(`/menus/${menu.id}/duplicate`, {}), 'No se pudo duplicar la carta')}
            className={ITEM}
          >
            <span>Duplicar</span>
          </button>

          <button type="button" role="menuitem" disabled={busy} onClick={() => toggleSubmenu('replace')} className={ITEM}>
            <span>Reemplazar contenido con…</span>
            <Chevron open={submenu === 'replace'} />
          </button>
          {submenu === 'replace' && renderList(menus, replaceFrom, 'No hay otras cartas')}

          <button type="button" role="menuitem" disabled={busy} onClick={() => toggleSubmenu('copy')} className={ITEM}>
            <span>Copiar a…</span>
            <Chevron open={submenu === 'copy'} />
          </button>
          {submenu === 'copy' && renderList(pages, copyTo, 'No hay sedes disponibles')}

          <div className="my-1 border-t border-[#EFF0EC]" />

          {menu.active === false ? (
            <>
              <button type="button" role="menuitem" disabled={busy} onClick={restore} className={ITEM}>
                <span>Restaurar</span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={removeForever}
                className="flex w-full items-center justify-between gap-3 bg-[#B42318] px-3.5 py-2.5 text-left text-[13px] font-medium text-white transition-colors hover:bg-[#9A1E14] disabled:opacity-60"
              >
                <span>Eliminar definitivamente</span>
                <TrashIcon />
              </button>
            </>
          ) : (
            <button type="button" role="menuitem" disabled={busy} onClick={trash} className={ITEM}>
              <span>Mover a la papelera</span>
            </button>
          )}
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

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
