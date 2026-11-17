'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';

interface MenuRef {
  id: number;
  name: string;
  active: boolean;
}

interface CategoryRef {
  id: number;
  menuId: number;
  parentId: number | null;
  name: string;
  sortOrder: number;
}

interface ProductRef {
  id: number;
  categoryId: number;
  name: string;
  type: string;
  visibility: string;
  recommended: boolean;
  isNew: boolean;
  soldOut: boolean;
  sortOrder: number;
  prices: { name: string; value: number | string }[];
}

export default function ProductsByCategoryPage() {
  const [menus, setMenus] = useState<MenuRef[] | null>(null);
  const [categories, setCategories] = useState<CategoryRef[] | null>(null);
  const [products, setProducts] = useState<ProductRef[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<MenuRef[]>('/menus'),
      api.get<CategoryRef[]>('/categories'),
      api.get<ProductRef[]>('/products'),
    ])
      .then(([m, c, p]) => {
        setMenus(m);
        setCategories(c);
        setProducts(p);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los productos'));
  }, []);

  const loading = !error && (menus === null || categories === null || products === null);

  // Productos agrupados por categoría (id → lista ordenada).
  const byCategory = useMemo(() => {
    const map = new Map<number, ProductRef[]>();
    const q = query.trim().toLowerCase();
    for (const p of products ?? []) {
      if (q && !p.name.toLowerCase().includes(q)) continue;
      const list = map.get(p.categoryId) ?? [];
      list.push(p);
      map.set(p.categoryId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [products, query]);

  const total = products?.length ?? 0;

  function renderProduct(p: ProductRef) {
    return (
      <a
        key={p.id}
        href={`/admin/categories/${p.categoryId}`}
        className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-[#F6F6F3]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${p.visibility === 'VISIBLE' ? 'bg-[#2F7D5B]' : 'bg-[#CDD1C9]'}`}
          />
          <span className="truncate text-[14px] font-medium text-[#17201C]">{p.name}</span>
          {p.type === 'COMBO' && <span className="tag tag-new">Combo</span>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {p.recommended && <span className="tag tag-recommended">Recomendado</span>}
          {p.isNew && <span className="tag tag-new">Nuevo</span>}
          {p.soldOut && <span className="tag tag-soldout">Agotado</span>}
          <span className="hidden text-right text-[13px] tabular-nums text-[#4F5752] sm:block">
            {p.prices.length === 0
              ? '—'
              : p.prices.map((pr) => `${Number(pr.value).toLocaleString('es-CO')}${pr.name ? ` (${pr.name})` : ''}`).join(' · ')}
          </span>
        </div>
      </a>
    );
  }

  return (
    <AdminLayout active="products">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Productos</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">
            {total} {total === 1 ? 'producto' : 'productos'} organizados por carta y categoría. Haz clic en un producto para editarlo.
          </p>
        </div>
        <a href="/admin/products/import" className="btn btn-secondary h-[38px]">Importar</a>
        <div className="relative w-full sm:w-64">
          <svg
            aria-hidden="true"
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8D9590]"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            className="input pl-9"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">
          {error}
        </p>
      )}

      {loading && <LoadingState />}

      {!loading && menus && categories && products && (
        <div className="space-y-8">
          {menus.map((menu) => {
            const topCats = categories
              .filter((c) => c.menuId === menu.id && c.parentId === null)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            const menuHasProducts = topCats.some(
              (c) =>
                (byCategory.get(c.id)?.length ?? 0) > 0 ||
                categories.some((s) => s.parentId === c.id && (byCategory.get(s.id)?.length ?? 0) > 0),
            );
            if (query && !menuHasProducts) return null;

            return (
              <section key={menu.id} aria-labelledby={`menu-${menu.id}`} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <h2 id={`menu-${menu.id}`} className="font-serif-display text-[22px] font-medium text-[#17201C]">
                    {menu.name}
                  </h2>
                  {!menu.active && <span className="badge badge-inactive">Inactiva</span>}
                </div>

                {topCats.map((cat) => {
                  const own = byCategory.get(cat.id) ?? [];
                  const subs = categories
                    .filter((s) => s.parentId === cat.id)
                    .sort((a, b) => a.sortOrder - b.sortOrder);
                  const subsWithProducts = subs.filter((s) => (byCategory.get(s.id)?.length ?? 0) > 0);
                  if (query && own.length === 0 && subsWithProducts.length === 0) return null;

                  return (
                    <div key={cat.id} className="card overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[#EFF0EC] bg-[#FAFAF8] px-5 py-2.5">
                        <h3 className="text-[13px] font-semibold text-[#17201C]">{cat.name}</h3>
                        <a href={`/admin/categories/${cat.id}`} className="text-[12px] font-medium text-[#166B4D] hover:underline">
                          Administrar categoría →
                        </a>
                      </div>

                      {own.length === 0 && subsWithProducts.length === 0 ? (
                        <p className="px-5 py-5 text-[13px] text-[#8D9590]">Sin productos en esta categoría.</p>
                      ) : (
                        <>
                          {own.length > 0 && <div className="divide-y divide-[#EFF0EC]">{own.map(renderProduct)}</div>}
                          {subsWithProducts.map((sub) => (
                            <div key={sub.id} className="border-t border-[#EFF0EC]">
                              <p className="px-5 pb-1 pt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8D9590]">
                                {sub.name}
                              </p>
                              <div className="divide-y divide-[#EFF0EC]">
                                {(byCategory.get(sub.id) ?? []).map(renderProduct)}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </section>
            );
          })}

          {total === 0 && (
            <p className="py-12 text-center text-[13px] text-[#8D9590]">
              Aún no tienes productos. Créalos desde una categoría en <a href="/admin/categories" className="underline">Categorías</a>.
            </p>
          )}
          {total > 0 && query && byCategory.size === 0 && (
            <p className="py-12 text-center text-[13px] text-[#8D9590]">No hay productos que coincidan con “{query}”.</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
