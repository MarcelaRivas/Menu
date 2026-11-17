'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface MenuRow {
  id: number;
  name: string;
  pageId: number;
  active: boolean;
  visibility: string;
  categories: unknown[];
}

/** Cartas de esta sede, con acceso directo para editarlas o crear una nueva aquí. */
export function SedeMenus({ pageId }: { pageId: number }) {
  const [menus, setMenus] = useState<MenuRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<MenuRow[]>('/menus')
      .then((list) => setMenus(list.filter((m) => m.pageId === pageId)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las cartas'));
  }, [pageId]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#17201C]">Cartas de esta sede</h3>
          <p className="mt-0.5 text-[12px] text-[#8D9590]">Las cartas activas se muestran a tus clientes en esta sede.</p>
        </div>
        <a href={`/admin/menus/new?pageId=${pageId}`} className="btn btn-primary btn-sm">+ Nueva carta aquí</a>
      </div>

      {error && <p role="alert" className="text-[13px] text-[#B42318]">{error}</p>}

      {menus === null && !error ? (
        <p className="text-[13px] text-[#8D9590]">Cargando…</p>
      ) : menus && menus.length === 0 ? (
        <p className="text-[13px] text-[#8D9590]">Esta sede aún no tiene cartas.</p>
      ) : menus ? (
        <div className="card divide-y divide-[#EFF0EC] overflow-hidden">
          {menus.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-[#17201C]">{m.name}</p>
                <p className="text-[12px] text-[#8D9590]">
                  {m.categories.length} {m.categories.length === 1 ? 'categoría' : 'categorías'}
                  {!m.active ? ' · En la papelera' : m.visibility !== 'VISIBLE' ? ' · Oculta' : ''}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <a href={`/admin/menus/${m.id}`} className="btn btn-secondary btn-sm">Editar</a>
                <a href={`/admin/menus/${m.id}/categories`} className="btn btn-ghost btn-sm">Categorías</a>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
