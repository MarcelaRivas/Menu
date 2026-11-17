'use client';

import { useEffect, useRef, useState } from 'react';

/** Icono (?) que abre un mensaje de ayuda al hacer clic. */
function HelpTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Ayuda: ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[9px] transition-colors ${
          open ? 'border-[#0B2E25] bg-[#0B2E25] text-white' : 'border-[#CDD1C9] text-[#8D9590] hover:border-[#8D9590]'
        }`}
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-[240px] rounded-[8px] bg-[#0B2E25] px-3 py-2 text-left text-[12px] font-normal leading-relaxed text-white shadow-[0_8px_20px_rgba(23,32,28,0.18)]"
        >
          {text}
        </span>
      )}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  help,
  disabled = false,
  hideLabel = false,
}: {
  checked: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  help?: string;
  disabled?: boolean;
  /** Oculta el texto visible (queda solo para lectores de pantalla). */
  hideLabel?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${hideLabel ? '' : 'py-3'}`}>
      <span className={hideLabel ? 'sr-only' : 'flex items-center gap-1.5 text-[13px] text-[#17201C]'}>
        {label}
        {help && <HelpTip text={help} label={label} />}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-[#0B2E25]' : 'bg-[#E3E5DF]'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}
