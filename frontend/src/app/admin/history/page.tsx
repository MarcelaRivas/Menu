'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';

interface HistoryRow {
  id: number;
  entityType: string;
  entityId: number;
  entityName: string;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const ENTITY_LABELS: Record<string, string> = {
  PRODUCT: 'Producto',
  MENU: 'Carta',
  CATEGORY: 'Categoría',
  PAGE_ELEMENT: 'Elemento',
  AD: 'Anuncio',
  menu: 'Carta',
  category: 'Categoría',
  product: 'Producto',
  ad: 'Anuncio',
  page: 'Sede',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Creó',
  EDIT: 'Editó',
  MOVE: 'Movió',
  COPY: 'Copió',
  DUPLICATE: 'Duplicó',
  REPLACE: 'Reemplazó',
  DELETE: 'Eliminó',
  ACTIVATE: 'Activó',
  DEACTIVATE: 'Desactivó',
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  description: 'Descripción',
  visibility: 'Visibilidad',
  hidePrices: 'Esconder precios',
  recommended: 'Recomendado',
  isNew: 'Nuevo',
  soldOut: 'Agotado',
  prices: 'Precios',
  modifiers: 'Modificadores',
  code: 'Código',
  preparationTime: 'Tiempo de preparación',
  link: 'Link',
};

/** Los valores de sí/no se guardan como texto true/false: se muestran como Sí/No. */
function displayValue(v: string): string {
  if (v === 'true') return 'Sí';
  if (v === 'false') return 'No';
  return v;
}

function when(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState('');

  useEffect(() => {
    api
      .get<HistoryRow[]>('/history?limit=300')
      .then(setRows)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudo cargar el historial'))
      .finally(() => setLoading(false));
  }, []);

  const entities = useMemo(() => Array.from(new Set(rows.map((r) => r.entityType))), [rows]);

  const filtered = rows.filter((r) => {
    if (entity && r.entityType !== entity) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [r.entityName, r.user?.name ?? '', r.user?.email ?? '', r.fieldName ?? ''].some((v) => v.toLowerCase().includes(q));
  });

  return (
    <AdminLayout active="history">
      <div className="mb-6">
        <h1>Historial</h1>
        <p className="mt-0.5 text-[13px] text-[#8D9590]">Cambios recientes en cartas, categorías, productos y anuncios, con quién los hizo.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, usuario o campo…"
          aria-label="Buscar en el historial"
          className="input max-w-xs"
        />
        <select value={entity} onChange={(e) => setEntity(e.target.value)} aria-label="Tipo de elemento" className="input w-auto">
          <option value="">Todos los elementos</option>
          {entities.map((e) => (
            <option key={e} value={e}>{ENTITY_LABELS[e] ?? e}</option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-[#8D9590]">No hay cambios que mostrar.</p>
      ) : (
        <div className="card divide-y divide-[#EFF0EC] overflow-hidden">
          {filtered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-[#17201C]">
                  <span className="font-medium">{r.user?.name ?? 'Sistema'}</span>{' '}
                  <span className="text-[#4F5752]">{(ACTION_LABELS[r.action] ?? r.action).toLowerCase()}</span>{' '}
                  <span className="font-medium">{ENTITY_LABELS[r.entityType] ?? r.entityType} “{r.entityName}”</span>
                  {r.fieldName && <span className="text-[#4F5752]"> · {FIELD_LABELS[r.fieldName] ?? r.fieldName}</span>}
                </p>
                {(r.oldValue || r.newValue) && (
                  <p className="mt-0.5 truncate text-[12px] text-[#8D9590]">
                    {r.oldValue ? `“${displayValue(r.oldValue)}”` : '—'} → {r.newValue ? `“${displayValue(r.newValue)}”` : '—'}
                  </p>
                )}
              </div>
              <span className="flex-shrink-0 text-[12px] tabular-nums text-[#8D9590]">{when(r.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
