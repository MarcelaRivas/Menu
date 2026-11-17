'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Props {
  entityType: string;
  entityId: number;
}

interface HistoryEntry {
  id: number;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: { name: string } | null;
}

const actionLabels: Record<string, string> = {
  CREATE: 'Creación', EDIT: 'Edición', MOVE: 'Movimiento', COPY: 'Copia',
  DUPLICATE: 'Duplicado', REPLACE: 'Reemplazo', DELETE: 'Eliminación',
  ACTIVATE: 'Activación', DEACTIVATE: 'Desactivación',
};

export function HistoryView({ entityType, entityId }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    api.get<HistoryEntry[]>(`/history/${entityType}/${entityId}`).then(setHistory).catch(() => {});
  }, [entityType, entityId]);

  return (
    <details className="border rounded-lg p-3">
      <summary className="font-medium cursor-pointer">Historial de cambios</summary>
      {history.length === 0 ? <p className="text-xs text-[#8D9590] mt-2">Sin cambios registrados</p> : (
        <div className="mt-2 space-y-1 text-xs text-[#8D9590] max-h-48 overflow-y-auto">
          {history.map((h) => (
            <div key={h.id} className="flex gap-2">
              <span className="font-medium">{actionLabels[h.action] || h.action}</span>
              <span>{new Date(h.createdAt).toLocaleString()}</span>
              {h.fieldName && <span className="text-[#8D9590]">· {h.fieldName}</span>}
            </div>
          ))}
        </div>
      )}
    </details>
  );
}