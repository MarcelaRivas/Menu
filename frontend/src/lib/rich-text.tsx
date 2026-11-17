import { Fragment, type ReactNode } from 'react';

/*
 * Formato de descripción de productos.
 * La descripción se guarda como texto plano con marcadores:
 *   [b]negrita[/b]  [i]cursiva[/i]  [u]subrayado[/u]  [s]tachado[/s]
 *   [lg]más grande[/lg]  [sm]más pequeño[/sm]
 * Saltos de línea: '\n'. Nunca se inserta HTML: el render produce elementos React.
 */

export type RichStyle = 'b' | 'i' | 'u' | 's' | 'lg' | 'sm';

const TOKEN = /\[(\/?)(b|i|u|s|lg|sm)\]|\n/g;

const CLASSES: Record<RichStyle, string> = {
  b: 'font-semibold',
  i: 'italic',
  u: 'underline',
  s: 'line-through',
  lg: 'text-[1.15em]',
  sm: 'text-[0.85em]',
};

/** Render seguro para la carta pública (sin innerHTML). */
export function renderRich(text: string): ReactNode {
  const active = new Set<RichStyle>();
  const lines: ReactNode[][] = [[]];
  let key = 0;
  let last = 0;

  const pushText = (t: string) => {
    if (!t) return;
    const classes = [...active].map((s) => CLASSES[s]).join(' ');
    const line = lines[lines.length - 1];
    line.push(
      classes ? (
        <span key={key++} className={classes}>{t}</span>
      ) : (
        <Fragment key={key++}>{t}</Fragment>
      ),
    );
  };

  for (const m of text.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    pushText(text.slice(last, index));
    last = index + m[0].length;
    if (m[0] === '\n') {
      lines.push([]);
    } else if (m[1] === '/') {
      active.delete(m[2] as RichStyle);
    } else {
      active.add(m[2] as RichStyle);
    }
  }
  pushText(text.slice(last));

  return lines.map((nodes, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {nodes}
    </Fragment>
  ));
}

/** Texto visible sin marcadores (para contadores). */
export function plainLength(text: string): number {
  return text.replace(/\[\/?(b|i|u|s|lg|sm)\]/g, '').length;
}

// ---------- Conversión para el editor (solo en el navegador) ----------

const TAG_TO_ELEMENT: Record<'b' | 'i' | 'u' | 's', string> = { b: 'b', i: 'i', u: 'u', s: 's' };

/** Marcadores → nodos DOM para cargar en el editor contentEditable. */
export function markersToDom(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const stack: { style: RichStyle; el: HTMLElement }[] = [];
  const current = () => (stack.length ? stack[stack.length - 1].el : frag);
  let last = 0;

  for (const m of text.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    const chunk = text.slice(last, index);
    if (chunk) current().appendChild(document.createTextNode(chunk));
    last = index + m[0].length;

    if (m[0] === '\n') {
      current().appendChild(document.createElement('br'));
    } else if (m[1] === '/') {
      const i = stack.map((s) => s.style).lastIndexOf(m[2] as RichStyle);
      if (i >= 0) stack.splice(i);
    } else {
      const style = m[2] as RichStyle;
      const el = document.createElement(style === 'lg' || style === 'sm' ? 'span' : TAG_TO_ELEMENT[style]);
      if (style === 'lg' || style === 'sm') el.dataset.size = style;
      current().appendChild(el);
      stack.push({ style, el });
    }
  }
  const rest = text.slice(last);
  if (rest) current().appendChild(document.createTextNode(rest));
  return frag;
}

/** Nodos DOM del editor → marcadores. */
export function domToMarkers(root: HTMLElement): string {
  const out = Array.from(root.childNodes).map(nodeToMarkers).join('');
  return out.replace(/\n+$/, '');
}

function nodeToMarkers(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof HTMLElement)) return '';

  const tag = node.tagName;
  if (tag === 'BR') return '\n';

  const inner = Array.from(node.childNodes).map(nodeToMarkers).join('');
  let open = '';
  let close = '';

  if (tag === 'B' || tag === 'STRONG' || Number(node.style.fontWeight) >= 600 || node.style.fontWeight === 'bold') {
    open += '[b]';
    close = '[/b]' + close;
  }
  if (tag === 'I' || tag === 'EM') {
    open += '[i]';
    close = '[/i]' + close;
  }
  if (tag === 'U') {
    open += '[u]';
    close = '[/u]' + close;
  }
  if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') {
    open += '[s]';
    close = '[/s]' + close;
  }
  if (tag === 'SPAN' && (node.dataset.size === 'lg' || node.dataset.size === 'sm')) {
    open += `[${node.dataset.size}]`;
    close = `[/${node.dataset.size}]` + close;
  }
  if (tag === 'DIV' || tag === 'P') {
    return inner + '\n';
  }
  return open + inner + close;
}
