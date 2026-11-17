'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';

export interface TagRef {
  id: number;
  name: string;
}

interface Props {
  value: TagRef[];
  onChange: (next: TagRef[]) => void;
  maxLength?: number;
}

export function TagInput({ value, onChange, maxLength = 30 }: Props) {
  const [all, setAll] = useState<TagRef[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<TagRef[]>('/tags').then(setAll).catch(() => setAll([]));
  }, []);

  // Cerrar la lista al hacer clic fuera.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const selectedIds = new Set(value.map((t) => t.id));
  const q = query.trim().toLowerCase();

  const suggestions = useMemo(
    () => all.filter((t) => !selectedIds.has(t.id) && (!q || t.name.toLowerCase().includes(q))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, value, q],
  );

  const exactExists = all.some((t) => t.name.toLowerCase() === q);

  function add(tag: TagRef) {
    if (!selectedIds.has(tag.id)) onChange([...value, tag]);
    setQuery('');
    setError('');
    inputRef.current?.focus();
  }

  function remove(id: number) {
    onChange(value.filter((t) => t.id !== id));
  }

  async function createAndAdd() {
    const name = query.trim();
    if (!name) return;
    if (name.length > maxLength) {
      setError(`Máximo ${maxLength} caracteres`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const tag = await api.post<TagRef>('/tags', { name });
      setAll((list) => (list.some((t) => t.id === tag.id) ? list : [...list, tag]));
      add(tag);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la etiqueta');
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!q) return;
      const match = all.find((t) => t.name.toLowerCase() === q && !selectedIds.has(t.id));
      if (match) add(match);
      else if (!exactExists) createAndAdd();
    } else if (e.key === 'Backspace' && !query && value.length) {
      remove(value[value.length - 1].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-[40px] cursor-text flex-wrap items-center gap-1.5 rounded-[8px] border bg-white py-1.5 pl-9 pr-3 transition-colors ${
          open ? 'border-[#CDD1C9]' : 'border-[#E3E5DF] hover:border-[#CDD1C9]'
        }`}
      >
        <svg
          aria-hidden="true"
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute left-3 top-[13px] text-[#8D9590]"
        >
          <path d="M2 2h5.6l6.4 6.4-5.6 5.6L2 7.6V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="5" cy="5" r="1" fill="currentColor" />
        </svg>

        {value.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-[#EEF3F1] px-2.5 py-0.5 text-[12px] text-[#17201C]">
            {t.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(t.id);
              }}
              aria-label={`Quitar etiqueta ${t.name}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[#6F7772] hover:bg-[#DDE7E2] hover:text-[#17201C]"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.slice(0, maxLength));
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          disabled={busy}
          placeholder={value.length ? '' : 'Escribe para buscar o crear'}
          aria-label="Buscar o crear etiqueta"
          aria-autocomplete="list"
          aria-expanded={open}
          className="min-w-[120px] flex-1 border-0 bg-transparent py-1 text-[13px] text-[#17201C] placeholder:text-[#8D9590] focus:outline-none focus:ring-0"
        />
      </div>

      {open && (
        <ul
          role="listbox"
          aria-label="Etiquetas"
          className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[220px] overflow-y-auto rounded-[10px] border border-[#E3E5DF] bg-white py-1 shadow-[0_12px_28px_rgba(23,32,28,0.12)]"
        >
          {suggestions.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(t)}
                className="block w-full px-3.5 py-2 text-left text-[13px] text-[#17201C] hover:bg-[#F6F6F3]"
              >
                {t.name}
              </button>
            </li>
          ))}

          {q && !exactExists && (
            <li>
              <button
                type="button"
                disabled={busy}
                onMouseDown={(e) => e.preventDefault()}
                onClick={createAndAdd}
                className="block w-full px-3.5 py-2 text-left text-[13px] text-[#166B4D] hover:bg-[#F6F6F3] disabled:opacity-50"
              >
                Crear etiqueta «{query.trim()}»
              </button>
            </li>
          )}

          {suggestions.length === 0 && !q && (
            <li className="px-3.5 py-2 text-[12px] text-[#8D9590]">No hay etiquetas. Escribe una para crearla.</li>
          )}
        </ul>
      )}

      {error && <p role="alert" className="mt-1.5 text-[12px] text-[#B42318]">{error}</p>}
    </div>
  );
}
