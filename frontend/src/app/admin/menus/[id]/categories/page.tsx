'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { CategoryForm } from '@/components/category-form';
import { CategoryRowActions } from '@/components/category-row-actions';

interface Category {
  id: number;
  parentId: number | null;
  name: string;
  description: string;
  visibility: string;
  style: string;
  columns: number;
  navigation: string;
  centerContent: boolean;
  hideTitle: boolean;
  hideProductTitles: boolean;
  descriptionEllipsis: boolean;
  sortOrder: number;
  children: Category[];
}

export default function CategoriesPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [cats, setCats] = useState<Category[]>([]);
  const [menuName, setMenuName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [trashed, setTrashed] = useState<Category[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get<{ name: string }>(`/menus/${id}`).then((m) => setMenuName(m.name));
    api.get<Category[]>(`/categories?menuId=${id}`).then(setCats).finally(() => setLoading(false));
    api.get<Category[]>(`/categories?menuId=${id}&trashed=true`).then(setTrashed).catch(() => setTrashed([]));
  }, [id]);

  const rootCats = cats.filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  async function toggleVisibility(catId: number, current: string) {
    const visibility = current === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    await api.put(`/categories/${catId}`, { visibility });
    setCats(cats.map((c) => c.id === catId ? { ...c, visibility } : c));
  }

  async function reload() {
    setCats(await api.get<Category[]>(`/categories?menuId=${id}`));
    setTrashed(await api.get<Category[]>(`/categories?menuId=${id}&trashed=true`));
  }

  async function restoreCategory(catId: number) {
    setError('');
    try {
      await api.post(`/categories/${catId}/restore`, {});
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo restaurar la categoría');
    }
  }

  async function deleteCategoryForever(cat: Category) {
    if (!window.confirm(`¿Eliminar "${cat.name}" definitivamente? Se borrarán también sus productos. No se puede deshacer.`)) return;
    setError('');
    try {
      await api.del(`/categories/${cat.id}/permanent`);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar la categoría');
    }
  }

  async function bulkAction(action: string, value?: unknown) {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (action === 'delete' && !window.confirm(`¿Mover ${ids.length} categoría(s) a la papelera? Podrás restaurarlas desde la papelera.`)) return;
    await api.post('/categories/bulk', { ids, action, value });
    setSelected(new Set());
    setCats(await api.get<Category[]>(`/categories?menuId=${id}`));
  }

  function renderCat(cat: Category, depth = 0): React.ReactNode {
    return (
      <>
        <tr key={cat.id}>
          <td className="px-4 py-3">
            <input type="checkbox" checked={selected.has(cat.id)} onChange={(e) => {
              const s = new Set(selected); e.target.checked ? s.add(cat.id) : s.delete(cat.id); setSelected(s);
            }} className="w-4 h-4" />
          </td>
          <td className={`px-4 py-3 font-medium ${depth > 0 ? 'text-[#8D9590]' : ''}`} style={{ paddingLeft: `${16 + depth * 6}px` }}>
            {depth > 0 ? '— '.repeat(depth) : ''}{cat.name}
          </td>
          <td className="px-4 py-3 text-xs text-[#8D9590]">{cat.style}</td>
          <td className="px-4 py-3">
            <button onClick={() => toggleVisibility(cat.id, cat.visibility)}
              className={`badge ${cat.visibility === 'VISIBLE' ? 'badge-active' : 'badge-inactive'}`}>
              {cat.visibility === 'VISIBLE' ? 'Visible' : 'Oculto'}
            </button>
          </td>
          <td className="px-4 py-3 space-x-1 text-xs">
            <button onClick={() => { setEditing(cat); setShowForm(true); }} className="btn btn-ghost btn-sm">Editar</button>
{depth === 0 && <button onClick={() => { setEditing({ menuId: Number(id), parentId: cat.id, name: '' } as any); setShowForm(true); }} className="btn btn-ghost btn-sm">+Sub</button>}
    <button onClick={() => window.location.href = `/admin/categories/${cat.id}`} className="btn btn-ghost btn-sm">Productos</button>
    <CategoryRowActions
      category={{ id: cat.id, name: cat.name, childCount: cat.children.length }}
      currentMenuId={Number(id)}
      onChanged={() => reload().catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías'))}
      onError={setError}
    />
                      </td>
        </tr>
        {cat.children.sort((a, b) => a.sortOrder - b.sortOrder).map((child) => renderCat(child, depth + 1))}
      </>
    );
  }

  return (
    <AdminLayout active="menus">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1>Categorías</h1>
          <p className="text-[#8D9590] text-sm">{menuName}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/admin/menus/${id}`} className="btn btn-secondary btn-sm">← Volver a la carta</a>
          <button onClick={() => setShowTrash((v) => !v)} className="btn btn-secondary">{showTrash ? 'Ver categorías' : `Papelera (${trashed.length})`}</button>
          <button onClick={() => { setEditing(null as any); setShowForm(true); }} className="btn btn-primary">+ Nueva</button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="toolbar mb-4">
          <span className="text-sm font-medium">{selected.size} seleccionadas</span>
          <button onClick={() => setSelected(new Set())} className="btn btn-ghost btn-sm">Cancelar</button>
          <div className="flex-1" />
          <button onClick={() => bulkAction('show')} className="btn btn-ghost btn-sm">Mostrar</button>
          <button onClick={() => bulkAction('hide')} className="btn btn-ghost btn-sm">Ocultar</button>
          <select onChange={(e) => bulkAction('style', e.target.value)} className="input text-xs w-auto">
            <option value="">Estilo...</option>
            <option value="WITH_IMAGES">Con imágenes</option>
            <option value="LIST">En lista</option>
            <option value="BANNER">Banner</option>
          </select>
          <select onChange={(e) => bulkAction('columns', Number(e.target.value))} className="input text-xs w-auto">
            <option value="">Col...</option>
            {[1, 2, 3].map((n) => <option key={n} value={String(n)}>{n}</option>)}
          </select>
          <button onClick={() => bulkAction('delete')} className="btn btn-ghost btn-sm">Eliminar</button>
        </div>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">
          {error}
        </p>
      )}

      {loading ? <p className="text-[#8D9590]">Cargando...</p> : showTrash ? (
        <div className="card divide-y divide-[#EFF0EC] overflow-hidden">
          <p className="px-4 py-3 text-[12px] text-[#8D9590]">Estas categorías están ocultas para tus clientes. Restaurarlas trae también sus productos que se movieron con ellas.</p>
          {trashed.length === 0 && <p className="px-4 py-8 text-center text-[13px] text-[#8D9590]">La papelera está vacía.</p>}
          {trashed.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-[#17201C]">{c.name}</p>
                <p className="text-[12px] text-[#8D9590]">{c.parentId ? 'Subcategoría' : 'Categoría'}</p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button type="button" onClick={() => restoreCategory(c.id)} className="btn btn-secondary btn-sm">Restaurar</button>
                <button type="button" onClick={() => deleteCategoryForever(c)} className="btn btn-secondary btn-sm border-[#F4C7C3] text-[#B42318]">Eliminar definitivamente</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="table overflow-visible">
          <thead>
            <tr>
              <th className="w-10"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(cats.map((c) => c.id)) : new Set())} className="w-4 h-4" /></th>
              <th>Nombre</th>
              <th>Estilo</th>
              <th>Estado</th>
              <th className="w-48">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rootCats.map((cat) => renderCat(cat))}
            {rootCats.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8D9590]">Sin categorías. Crea una.</td></tr>}
          </tbody>
        </table>
      )}

      {showForm && <CategoryForm
        menuId={Number(id)}
        category={editing}
        onSave={async () => { setShowForm(false); setEditing(null as any); setCats(await api.get<Category[]>(`/categories?menuId=${id}`)); }}
        onCancel={() => { setShowForm(false); setEditing(null as any); }}
      />}
    </AdminLayout>
  );
}
