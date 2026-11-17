'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface HistoryEntry {
  id: number;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  description: 'Descripción',
  type: 'Tipo',
  visibility: 'Visibilidad',
  hidePrices: 'Esconder precios',
  recommended: 'Recomendado',
  isNew: 'Nuevo',
  soldOut: 'Agotado',
  preparationTime: 'Tiempo de preparación',
  timePerUnit: 'Tiempo por unidad',
  productType1: 'Tipo de producto 1',
  productType2: 'Tipo de producto 2',
  productType3: 'Tipo de producto 3',
  productType4: 'Tipo de producto 4',
  link: 'Link',
  sortOrder: 'Orden',
  prices: 'Precio',
  modifiers: 'Modificadores',
};

function titleFor(e: HistoryEntry): string {
  if (e.action === 'CREATE') return 'Producto creado';
  if (e.action === 'DELETE') return 'Producto eliminado';
  if (e.fieldName === 'prices') return 'Precio actualizado';
  if (e.fieldName === 'modifiers') return 'Modificadores actualizados';
  return `${FIELD_LABELS[e.fieldName ?? ''] ?? 'Dato'} actualizado`;
}

function displayValue(v: string | null): string {
  if (v === null || v === '') return '—';
  if (v === 'true') return 'Sí';
  if (v === 'false') return 'No';
  return v;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
}

function Icon({ entry }: { entry: HistoryEntry }) {
  if (entry.fieldName === 'prices') {
    return (
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E6F4FB] text-[#1A7FB3]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.8 6.2c-.3-.5-.9-.8-1.8-.8-1 0-1.7.5-1.7 1.3 0 1.9 3.6 1 3.6 2.9 0 .8-.8 1.4-1.9 1.4-.9 0-1.5-.3-1.9-.9M8 4.2v7.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  const glyph = entry.action === 'CREATE' ? 'M8 3v10M3 8h10' : entry.action === 'DELETE' ? 'M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.7 8h5.6l.7-8' : 'M3 11.5V13h1.5L11 6.5 9.5 5 3 11.5z';
  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F2F3F0] text-[#4F5752]">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d={glyph} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function ProductHistory({ productId }: { productId: number }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError('');
    api
      .get<HistoryEntry[]>(`/history/PRODUCT/${productId}`)
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar el historial'); });
    return () => { cancelled = true; };
  }, [productId]);

  if (error) {
    return <p role="alert" className="py-16 text-center text-[13px] text-[#B42318]">{error}</p>;
  }
  if (entries === null) {
    return <p className="py-16 text-center text-[13px] text-[#8D9590]">Cargando historial…</p>;
  }
  if (entries.length === 0) {
    return <p className="py-16 text-center text-[13px] text-[#8D9590]">Sin cambios registrados</p>;
  }

  return (
    <ul className="space-y-1 pb-8">
      {entries.map((e) => {
        const open = openId === e.id;
        const hasDetail = e.action === 'EDIT' && (e.oldValue || e.newValue);
        return (
          <li key={e.id} className="rounded-[10px] transition-colors hover:bg-[#F6F6F3]">
            <button
              type="button"
              onClick={() => hasDetail && setOpenId(open ? null : e.id)}
              aria-expanded={hasDetail ? open : undefined}
              className="flex w-full items-center gap-3 px-2 py-3 text-left"
            >
              <Icon entry={e} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-[#17201C]">{titleFor(e)}</span>
                <span className="mt-0.5 block text-[12px] text-[#8D9590]">{formatDate(e.createdAt)}</span>
              </span>
              <span className="hidden max-w-[180px] truncate text-[12px] text-[#4F5752] sm:block">
                {e.user?.email ?? 'Sistema'}
              </span>
              {hasDetail && (
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  aria-hidden="true"
                  className={`flex-shrink-0 text-[#8D9590] transition-transform ${open ? 'rotate-180' : ''}`}
                >
                  <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            {open && hasDetail && (
              <div className="grid grid-cols-2 gap-3 px-14 pb-3 text-[12px]">
                <div>
                  <p className="mb-0.5 text-[#8D9590]">Antes</p>
                  <p className="break-words text-[#4F5752]">{displayValue(e.oldValue)}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-[#8D9590]">Después</p>
                  <p className="break-words text-[#17201C]">{displayValue(e.newValue)}</p>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
