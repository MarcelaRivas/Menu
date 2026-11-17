'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { MenuRowActions } from '@/components/menu-row-actions';

interface Menu {
  id: number;
  name: string;
  type: string;
  visibility: string;
  language: string;
  active: boolean;
  pageId: number;
  categories: unknown[];
}

type SortBy = 'sede' | 'nombre';

const TYPE_LABELS: Record<string, string> = {
  READ_ONLY: 'Solo lectura',
  ORDER: 'Recibir pedidos',
  FOOD_COURT: 'Plazoleta',
};

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

export default function MenusPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [pageNames, setPageNames] = useState<Record<number, string>>({});
  const [sortBy, setSortBy] = useState<SortBy>('sede');
  const [query, setQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    return Promise.all([api.get<Menu[]>('/menus'), api.get<{ id: number; name: string }[]>('/pages')]).then(([list, pages]) => {
      setMenus(list);
      setPageNames(Object.fromEntries(pages.map((p) => [p.id, p.name])));
    });
  }

  useEffect(() => {
    load()
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las cartas'))
      .finally(() => setLoading(false));
  }, []);

  const trashCount = menus.filter((m) => !m.active).length;

  /** Cartas de la vista actual (activas, o la papelera), filtradas por búsqueda. */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menus.filter((m) => (showTrash ? !m.active : m.active) && (!q || m.name.toLowerCase().includes(q)));
  }, [menus, query, showTrash]);

  /** Nombres repetidos dentro de la misma sede (solo entre cartas activas). */
  const duplicateKeys = useMemo(() => {
    const count = new Map<string, number>();
    for (const m of menus.filter((x) => x.active)) {
      const key = `${m.pageId}|${m.name.trim().toLowerCase()}`;
      count.set(key, (count.get(key) ?? 0) + 1);
    }
    return new Set([...count.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  }, [menus]);

  const groups = useMemo(() => {
    const byName = (a: Menu, b: Menu) => collator.compare(a.name, b.name);
    if (sortBy === 'nombre') {
      return [{ key: 'all', title: null as string | null, items: [...shown].sort(byName) }];
    }
    const map = new Map<number, Menu[]>();
    for (const m of shown) {
      const list = map.get(m.pageId) ?? [];
      list.push(m);
      map.set(m.pageId, list);
    }
    return [...map.entries()]
      .map(([pageId, items]) => ({
        key: `page-${pageId}`,
        title: pageNames[pageId] ?? 'Sin sede',
        items: items.sort(byName),
      }))
      .sort((a, b) => {
        if (a.title === 'Sin sede') return 1;
        if (b.title === 'Sin sede') return -1;
        return collator.compare(a.title ?? '', b.title ?? '');
      });
  }, [shown, pageNames, sortBy]);

  async function toggleVisibility(m: Menu) {
    const next = m.visibility === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    setError('');
    setMenus((list) => list.map((x) => (x.id === m.id ? { ...x, visibility: next } : x)));
    try {
      await api.put(`/menus/${m.id}`, { visibility: next });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar la visibilidad');
      await load();
    }
  }

  function reloadAfterAction() {
    setError('');
    load().catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las cartas'));
  }

  function renderRow(m: Menu, showSede: boolean) {
    const visible = m.visibility === 'VISIBLE';
    const repeated = m.active && duplicateKeys.has(`${m.pageId}|${m.name.trim().toLowerCase()}`);
    return (
      <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
        <button
          type="button"
          onClick={() => router.push(`/admin/menus/${m.id}/categories`)}
          className="group flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F2F3F0] text-[#4F5752]" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 3.5C3.5 2.8 5.2 2.8 8 4.2c2.8-1.4 4.5-1.4 6-.7v8.7c-1.5-.7-3.2-.7-6 .7-2.8-1.4-4.5-1.4-6-.7V3.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M8 4.2v8.7" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="block truncate text-[14px] font-medium text-[#17201C] group-hover:underline">{m.name}</span>
              {repeated && (
                <span className="flex-shrink-0 rounded-full bg-[#FBF3E3] px-2 py-0.5 text-[10px] font-medium text-[#8A5A00]" title="Hay otra carta activa con este nombre en la misma sede">
                  Nombre repetido
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-[12px] text-[#8D9590]">
              {showSede && <><span className="text-[#4F5752]">{pageNames[m.pageId] ?? 'Sin sede'}</span> · </>}
              {TYPE_LABELS[m.type] ?? m.type} · {m.categories.length} {m.categories.length === 1 ? 'categoría' : 'categorías'}
              {!m.active && ' · En la papelera'}
            </span>
          </span>
        </button>

        {m.active && (
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            aria-label={`Visible en la carta: ${m.name}`}
            onClick={() => toggleVisibility(m)}
            className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${visible ? 'bg-[#2F7D5B]' : 'bg-[#E3E5DF]'}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${visible ? 'translate-x-4' : ''}`} />
          </button>
        )}

        <MenuRowActions
          menu={{ id: m.id, name: m.name, active: m.active }}
          onEdit={() => router.push(`/admin/menus/${m.id}`)}
          onChanged={reloadAfterAction}
          onError={setError}
        />
      </div>
    );
  }

  return (
    <AdminLayout active="menus">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1>Cartas</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">Abre una carta para gestionar sus categorías.</p>
        </div>
        <a href="/admin/menus/new" className="btn btn-primary">+ Nueva carta</a>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingState />
      ) : menus.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-[#8D9590]">Aún no tienes cartas. Crea una con “Nueva carta”.</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#4F5752]">
            <div className="flex flex-wrap items-center gap-2">
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar carta" aria-label="Buscar carta" className="input max-w-xs" />
              <button
                type="button"
                onClick={() => setShowTrash((v) => !v)}
                aria-pressed={showTrash}
                className={`btn btn-sm ${showTrash ? 'btn-primary' : 'btn-secondary'}`}
              >
                {showTrash ? 'Ver cartas activas' : `Papelera (${trashCount})`}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="menus-sort">Ordenar por</label>
              <select
                id="menus-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="h-9 rounded-[8px] border border-[#E3E5DF] bg-white px-3 text-[13px] text-[#17201C] focus:outline-none"
              >
                <option value="sede">Sede</option>
                <option value="nombre">Nombre</option>
              </select>
            </div>
          </div>

          {showTrash && (
            <p className="mb-4 text-[12px] text-[#8D9590]">
              Las cartas de la papelera están ocultas para tus clientes. Puedes restaurarlas o eliminarlas definitivamente.
            </p>
          )}

          {shown.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[#8D9590]">
              {showTrash ? 'La papelera está vacía.' : 'No hay cartas que coincidan.'}
            </p>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <section key={g.key} aria-label={g.title ?? 'Cartas'}>
                  {g.title && (
                    <div className="mb-2 flex items-baseline justify-between px-1">
                      <h2 className="font-serif-display text-[20px] font-medium text-[#17201C]">{g.title}</h2>
                      <span className="text-[12px] text-[#8D9590]">
                        {g.items.length} {g.items.length === 1 ? 'carta' : 'cartas'}
                      </span>
                    </div>
                  )}
                  <div className="card divide-y divide-[#EFF0EC] overflow-visible">
                    {g.items.map((m) => renderRow(m, sortBy === 'nombre'))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
