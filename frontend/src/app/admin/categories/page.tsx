'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';

interface MenuRef {
  id: number;
  name: string;
  visibility: string;
  active: boolean;
}

interface CategoryRef {
  id: number;
  menuId: number;
  parentId: number | null;
  name: string;
  visibility: string;
  sortOrder: number;
  children?: { id: number; name: string }[];
  products?: { id: number }[];
}

export default function CategoriesByMenuPage() {
  const [menus, setMenus] = useState<MenuRef[] | null>(null);
  const [categories, setCategories] = useState<CategoryRef[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get<MenuRef[]>('/menus'), api.get<CategoryRef[]>('/categories')])
      .then(([m, c]) => {
        setMenus(m);
        setCategories(c);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías'));
  }, []);

  const loading = !error && (menus === null || categories === null);

  return (
    <AdminLayout active="categories">
      <div className="mb-6">
        <h1>Categorías</h1>
        <p className="mt-0.5 text-[13px] text-[#8D9590]">Organizadas por carta. Abre una categoría para gestionar sus productos.</p>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">
          {error}
        </p>
      )}

      {loading && <LoadingState />}

      {!loading && menus && categories && (
        <div className="space-y-8">
          {menus.map((menu) => {
            const cats = categories
              .filter((c) => c.menuId === menu.id && c.parentId === null)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            return (
              <section key={menu.id} aria-labelledby={`menu-${menu.id}`}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <h2 id={`menu-${menu.id}`} className="font-serif-display text-[22px] font-medium text-[#17201C]">
                      {menu.name}
                    </h2>
                    {!menu.active && <span className="badge badge-inactive">Inactiva</span>}
                  </div>
                  <a href={`/admin/menus/${menu.id}/categories`} className="text-[12px] font-medium text-[#166B4D] hover:underline">
                    Administrar categorías de esta carta →
                  </a>
                </div>

                {cats.length === 0 ? (
                  <div className="card px-5 py-8 text-center text-[13px] text-[#8D9590]">
                    Esta carta no tiene categorías todavía.
                  </div>
                ) : (
                  <div className="card divide-y divide-[#EFF0EC] overflow-hidden">
                    {cats.map((cat) => {
                      const subs = cat.children ?? [];
                      const count = cat.products?.length ?? 0;
                      return (
                        <a
                          key={cat.id}
                          href={`/admin/categories/${cat.id}`}
                          className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#F6F6F3]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium text-[#17201C]">{cat.name}</p>
                            {subs.length > 0 && (
                              <p className="mt-0.5 truncate text-[12px] text-[#8D9590]">
                                Subcategorías: {subs.map((s) => s.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-4">
                            <span className="text-[12px] tabular-nums text-[#8D9590]">
                              {count} {count === 1 ? 'producto' : 'productos'}
                            </span>
                            {cat.visibility !== 'VISIBLE' && <span className="badge badge-inactive">Oculta</span>}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden="true"
                              className="text-[#B5BBB6] transition-transform group-hover:translate-x-0.5 group-hover:text-[#17201C]"
                            >
                              <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          {menus.length === 0 && (
            <p className="py-12 text-center text-[13px] text-[#8D9590]">
              No tienes cartas todavía. Crea una desde <a href="/admin/menus" className="underline">Cartas digitales</a>.
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
