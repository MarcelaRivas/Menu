'use client';

import { Toggle } from './toggle';

export interface ExtrasValue {
  preparationTime: number | null;
  timePerUnit: boolean;
  productType1: string;
  productType2: string;
  productType3: string;
  productType4: string;
  link: string;
}

const PRODUCT_TYPE_KEYS = ['productType1', 'productType2', 'productType3', 'productType4'] as const;

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-semibold text-[#17201C]">
        {label}
      </label>
      {children}
    </div>
  );
}

interface Props {
  value: ExtrasValue;
  onChange: (patch: Partial<ExtrasValue>) => void;
}

export function ProductExtras({ value, onChange }: Props) {
  return (
    <div className="space-y-6 pb-8">
      <Field label="Tiempo de preparación" htmlFor="prep-time">
        <div className="relative">
          <input
            id="prep-time"
            type="number"
            min={0}
            inputMode="numeric"
            value={value.preparationTime ?? ''}
            onChange={(e) => onChange({ preparationTime: e.target.value === '' ? null : Number(e.target.value) })}
            className="input pr-20"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#8D9590]">
            Minutos
          </span>
        </div>
      </Field>

      <div className="border-b border-[#EFF0EC]">
        <Toggle
          label="Tiempo de preparación por unidad"
          help="El tiempo de preparación por unidad es el tiempo que se necesita para preparar una unidad del producto"
          checked={value.timePerUnit}
          onChange={(v) => onChange({ timePerUnit: v })}
        />
      </div>

      {PRODUCT_TYPE_KEYS.map((key, i) => (
        <Field key={key} label={`Tipo de producto ${i + 1}`} htmlFor={key}>
          <input
            id={key}
            value={value[key] ?? ''}
            onChange={(e) => onChange({ [key]: e.target.value })}
            className="input"
          />
        </Field>
      ))}

      <Field label="Link" htmlFor="product-link">
        <input
          id="product-link"
          type="url"
          placeholder="https://"
          value={value.link ?? ''}
          onChange={(e) => onChange({ link: e.target.value })}
          className="input"
        />
      </Field>
    </div>
  );
}
