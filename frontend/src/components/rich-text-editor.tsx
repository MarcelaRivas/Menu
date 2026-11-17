'use client';

import { useEffect, useRef } from 'react';
import { domToMarkers, markersToDom, plainLength } from '@/lib/rich-text';

interface Props {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  label?: string;
}

const BUTTONS: { cmd: 'bold' | 'italic' | 'underline' | 'strikeThrough'; label: string; className: string }[] = [
  { cmd: 'bold', label: 'B', className: 'font-bold' },
  { cmd: 'italic', label: 'I', className: 'italic' },
  { cmd: 'underline', label: 'U', className: 'underline' },
  { cmd: 'strikeThrough', label: 'S', className: 'line-through' },
];

export function RichTextEditor({ value, onChange, maxLength = 10000, label = 'Descripción' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  // Carga inicial del contenido (una sola vez; después el editor es la fuente de verdad).
  useEffect(() => {
    if (!ref.current || loaded.current) return;
    ref.current.replaceChildren(markersToDom(value));
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    if (ref.current) onChange(domToMarkers(ref.current));
  }

  function format(cmd: (typeof BUTTONS)[number]['cmd']) {
    ref.current?.focus();
    document.execCommand(cmd);
    emit();
  }

  /** Envuelve la selección en un <span> de tamaño (grande o pequeño). */
  function resize(size: 'lg' | 'sm') {
    const editor = ref.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    const span = document.createElement('span');
    span.dataset.size = size;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    sel.removeAllRanges();
    emit();
  }

  const length = plainLength(value);
  const over = length > maxLength;

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#E3E5DF] focus-within:border-[#CDD1C9]">
      <div className="flex items-center gap-1 border-b border-[#EFF0EC] px-2 py-1.5 text-[13px] text-[#4F5752]" role="toolbar" aria-label={`Formato de ${label.toLowerCase()}`}>
        {BUTTONS.map((b) => (
          <button
            key={b.cmd}
            type="button"
            title={b.cmd === 'strikeThrough' ? 'Tachado' : b.cmd === 'bold' ? 'Negrita' : b.cmd === 'italic' ? 'Cursiva' : 'Subrayado'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => format(b.cmd)}
            className="h-7 w-7 rounded-[6px] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C]"
          >
            <span className={b.className}>{b.label}</span>
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-[#E3E5DF]" aria-hidden="true" />
        <button
          type="button"
          title="Texto más grande"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => resize('lg')}
          className="h-7 w-7 rounded-[6px] text-[14px] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C]"
        >
          A
        </button>
        <button
          type="button"
          title="Texto más pequeño"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => resize('sm')}
          className="h-7 w-7 rounded-[6px] text-[11px] transition-colors hover:bg-[#F6F6F3] hover:text-[#17201C]"
        >
          a
        </button>
      </div>

      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          // Pegar solo texto plano para no arrastrar estilos ajenos.
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        className="min-h-[120px] whitespace-pre-wrap bg-white px-3.5 py-3 text-[14px] leading-relaxed text-[#17201C] focus:outline-none"
      />

      <p className={`px-3.5 pb-2 text-right text-[11px] tabular-nums ${over ? 'text-[#B42318]' : 'text-[#8D9590]'}`}>
        {length} / {maxLength}
      </p>
    </div>
  );
}
