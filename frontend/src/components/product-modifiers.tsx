'use client';

import { useState } from 'react';
import { Toggle } from './toggle';

export interface ModifierOptionDraft {
  id?: number;
  name: string;
  price: number;
  sortOrder: number;
}

export interface ModifierDraft {
  id?: number;
  name: string;
  type: 'ADDITION' | 'OPTION';
  required: boolean;
  min: number;
  max: number;
  sortOrder: number;
  options: ModifierOptionDraft[];
}

const TYPE_LABEL: Record<ModifierDraft['type'], string> = {
  ADDITION: 'Adición',
  OPTION: 'Opción',
};

const TYPE_HELP: Record<ModifierDraft['type'], string> = {
  ADDITION: 'Cobro extra por cada opción elegida',
  OPTION: 'El cliente elige entre las opciones sin cargo extra',
};

const SECTION_TITLE = 'block text-[13px] font-semibold text-[#17201C] mb-2.5';

function blankDraft(): ModifierDraft {
  return {
    name: '',
    type: 'ADDITION',
    required: false,
    min: 0,
    max: 1,
    sortOrder: 0,
    options: [{ name: '', price: 0, sortOrder: 0 }],
  };
}

function cloneDraft(m: ModifierDraft): ModifierDraft {
  return JSON.parse(JSON.stringify(m)) as ModifierDraft;
}

interface Props {
  value: ModifierDraft[];
  onChange: (next: ModifierDraft[]) => void;
}

export function ProductModifiers({ value, onChange }: Props) {
  // index === null → creando un modificador nuevo
  const [editing, setEditing] = useState<{ index: number | null; draft: ModifierDraft } | null>(null);

  function startCreate() {
    setEditing({ index: null, draft: blankDraft() });
  }

  function startEdit(i: number) {
    setEditing({ index: i, draft: cloneDraft(value[i]) });
  }

  function remove(i: number) {
    if (!window.confirm(`¿Eliminar el modificador "${value[i].name}"?`)) return;
    onChange(value.filter((_, j) => j !== i));
  }

  function commit() {
    if (!editing) return;
    const { index, draft } = editing;
    const cleaned: ModifierDraft = {
      ...draft,
      name: draft.name.trim(),
      min: Math.max(0, draft.min || 0),
      max: Math.max(1, draft.max || 1),
      options: draft.options
        .filter((o) => o.name.trim())
        .map((o, idx) => ({ ...o, name: o.name.trim(), sortOrder: idx })),
    };
    if (!cleaned.name) return;
    const next = index === null ? [...value, cleaned] : value.map((m, j) => (j === index ? cleaned : m));
    onChange(next.map((m, idx) => ({ ...m, sortOrder: idx })));
    setEditing(null);
  }

  // ---------- Editor ----------
  if (editing) {
    const { index, draft } = editing;
    const setDraft = (patch: Partial<ModifierDraft>) => setEditing({ index, draft: { ...draft, ...patch } });
    const setOption = (i: number, patch: Partial<ModifierOptionDraft>) => {
      const options = draft.options.map((o, j) => (j === i ? { ...o, ...patch } : o));
      setDraft({ options });
    };

    return (
      <div className="space-y-6 pb-8">
        <h3 className="font-serif-display text-[22px] font-medium text-[#17201C]">
          {index === null ? 'Nuevo modificador' : 'Editar modificador'}
        </h3>

        <div>
          <label htmlFor="mod-name" className={SECTION_TITLE}>Nombre</label>
          <input
            id="mod-name"
            value={draft.name}
            onChange={(e) => setDraft({ name: e.target.value })}
            maxLength={40}
            placeholder="Ej: Punto de cocción"
            className="input"
          />
        </div>

        <div>
          <span className={SECTION_TITLE}>Tipo</span>
          <div className="grid grid-cols-2 gap-2">
            {(['ADDITION', 'OPTION'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDraft({ type: t })}
                aria-pressed={draft.type === t}
                className={`rounded-[10px] border p-3 text-left transition-colors ${
                  draft.type === t
                    ? 'border-[#0B2E25] bg-[#F2F6F4]'
                    : 'border-[#E3E5DF] bg-white hover:border-[#CDD1C9]'
                }`}
              >
                <span className="block text-[13px] font-medium text-[#17201C]">{TYPE_LABEL[t]}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-[#8D9590]">{TYPE_HELP[t]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#EFF0EC] border-y border-[#EFF0EC]">
          <Toggle label="Obligatorio" checked={draft.required} onChange={(v) => setDraft({ required: v })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="mod-min" className="label">Mínimo</label>
            <input
              id="mod-min"
              type="number"
              min={0}
              value={draft.min}
              onChange={(e) => setDraft({ min: Number(e.target.value) })}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="mod-max" className="label">Máximo</label>
            <input
              id="mod-max"
              type="number"
              min={1}
              value={draft.max}
              onChange={(e) => setDraft({ max: Number(e.target.value) })}
              className="input"
            />
          </div>
        </div>

        <div>
          <span className={SECTION_TITLE}>Opciones</span>
          <div className="space-y-2">
            {draft.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  placeholder="Nombre"
                  aria-label={`Nombre de la opción ${i + 1}`}
                  value={o.name}
                  onChange={(e) => setOption(i, { name: e.target.value })}
                  className="input flex-1"
                />
                <div className="relative w-[120px] flex-shrink-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#6F7772]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    aria-label={`Precio de la opción ${i + 1}`}
                    value={String(o.price)}
                    onChange={(e) => setOption(i, { price: Number(e.target.value) })}
                    className="input pl-7"
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Quitar opción ${i + 1}`}
                  onClick={() => setDraft({ options: draft.options.filter((_, j) => j !== i) })}
                  className="flex h-9 w-8 flex-shrink-0 items-center justify-center rounded-[6px] text-[#8D9590] transition-colors hover:bg-[#F6F6F3] hover:text-[#B42318]"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDraft({ options: [...draft.options, { name: '', price: 0, sortOrder: draft.options.length }] })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#CDD1C9] py-2.5 text-[13px] font-medium text-[#17201C] transition-colors hover:bg-[#F6F6F3]"
          >
            Agregar opción
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          {index !== null ? (
            <button
              type="button"
              onClick={() => {
                remove(index);
                setEditing(null);
              }}
              className="btn btn-ghost btn-sm text-[#B42318]"
            >
              Eliminar
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={commit} disabled={!draft.name.trim()} className="btn btn-primary">
              Guardar modificador
            </button>
          </div>
        </div>
        <p className="text-[12px] text-[#8D9590]">Los cambios se aplican al guardar el producto.</p>
      </div>
    );
  }

  // ---------- Lista ----------
  if (value.length === 0) {
    return (
      <div className="pb-8">
        <h3 className="mb-4 text-[14px] font-semibold text-[#17201C]">Adiciones y opciones</h3>
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#4F5752]">
          <span>No tienes ningún modificador, crea uno</span>
          <button
            type="button"
            onClick={startCreate}
            className="rounded-full bg-[#06231C] px-5 py-2 text-[12px] font-medium tracking-wide text-white transition-colors hover:bg-[#0B2E25]"
          >
            CREAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#17201C]">Adiciones y opciones</h3>
        <button type="button" onClick={startCreate} className="btn btn-secondary btn-sm">
          + Crear
        </button>
      </div>

      <ul className="space-y-2">
        {value.map((m, i) => (
          <li key={m.id ?? `new-${i}`} className="flex items-start justify-between gap-3 rounded-[10px] border border-[#E3E5DF] bg-white p-3.5">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-[#17201C]">{m.name}</p>
              <p className="mt-0.5 text-[12px] text-[#8D9590]">
                {TYPE_LABEL[m.type]} · {m.required ? 'Obligatorio' : 'Opcional'} · {m.min}–{m.max} ·{' '}
                {m.options.length} {m.options.length === 1 ? 'opción' : 'opciones'}
              </p>
              {m.options.length > 0 && (
                <p className="mt-1 truncate text-[12px] text-[#4F5752]">
                  {m.options.map((o) => (o.price ? `${o.name} (+$${o.price})` : o.name)).join(', ')}
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 gap-1">
              <button type="button" onClick={() => startEdit(i)} className="btn btn-ghost btn-sm">Editar</button>
              <button type="button" onClick={() => remove(i)} className="btn btn-ghost btn-sm text-[#B42318]">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-[#8D9590]">Los cambios se aplican al guardar el producto.</p>
    </div>
  );
}
