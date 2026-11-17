'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface RowResult {
  line: number;
  status: 'creado' | 'actualizado' | 'error';
  product: string;
  menu: string;
  category: string;
  message: string;
}

interface Report {
  dryRun: boolean;
  totals: { rows: number; products: number; updated: number; categories: number; subcategories: number; errors: number };
  rows: RowResult[];
}

const COLUMNS: { name: string; desc: string; required?: boolean }[] = [
  { name: 'carta', desc: 'Nombre de la carta donde va el producto (debe existir).', required: true },
  { name: 'sede', desc: 'Nombre de la sede. Solo es necesaria si hay cartas con el mismo nombre.' },
  { name: 'categoria', desc: 'Categoría principal. Si no existe en la carta, se crea.', required: true },
  { name: 'subcategoria', desc: 'Subcategoría opcional. Si no existe, se crea dentro de la categoría.' },
  { name: 'producto', desc: 'Nombre del producto. Si ya existe en esa categoría, se actualiza.', required: true },
  { name: 'descripcion', desc: 'Descripción del producto.' },
  { name: 'precio', desc: 'Precio (ej. 12000 o 12.000,50).' },
  { name: 'nombre_precio', desc: 'Nombre de la presentación del precio (ej. Copa, Botella).' },
  { name: 'codigo', desc: 'Código interno del producto.' },
  { name: 'recomendado / nuevo / agotado / esconder_precios', desc: 'si o no.' },
];

const STATUS_STYLE: Record<RowResult['status'], string> = {
  creado: 'bg-[#E7F3EC] text-[#2F7D5B]',
  actualizado: 'bg-[#EEF3F1] text-[#166B4D]',
  error: 'bg-[#FDECEA] text-[#B42318]',
};
const STATUS_LABEL: Record<RowResult['status'], string> = { creado: 'Creado', actualizado: 'Actualizado', error: 'Error' };

export default function ImportProductsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState<'revisar' | 'importar' | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function send(dryRun: boolean) {
    if (!file) return;
    setBusy(dryRun ? 'revisar' : 'importar');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${API}/products/import?dryRun=${dryRun ? 'true' : 'false'}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'No se pudo procesar el archivo');
      setReport(data as Report);
      setDone(!dryRun);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar el archivo');
    } finally {
      setBusy(null);
    }
  }

  async function downloadTemplate() {
    try {
      // La plantilla es texto CSV (no JSON), así que se lee como texto.
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/products/import/template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('No se pudo descargar la plantilla');
      const csv = await res.text();
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla-productos.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar la plantilla');
    }
  }

  function pickFile(f: File | null) {
    setFile(f);
    setReport(null);
    setDone(false);
    setError('');
  }

  return (
    <AdminLayout active="products">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Importar productos</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">
            Sube un archivo .xlsx o .csv con los productos. Las categorías que no existan se crean en la carta indicada.
          </p>
        </div>
        <a href="/admin/products" className="btn btn-secondary">← Volver a productos</a>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Instrucciones */}
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-[#17201C]">Columnas del archivo</h2>
            <button type="button" onClick={downloadTemplate} className="btn btn-secondary btn-sm">Descargar plantilla (.csv)</button>
          </div>
          <ul className="mt-4 divide-y divide-[#EFF0EC] text-[13px]">
            {COLUMNS.map((c) => (
              <li key={c.name} className="flex gap-3 py-2">
                <code className="w-[210px] flex-shrink-0 text-[12px] text-[#17201C]">
                  {c.name}
                  {c.required && <span className="ml-1 text-[#B42318]">*</span>}
                </code>
                <span className="text-[#4F5752]">{c.desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-[#8D9590]">* Obligatorio. Los nombres de columna no distinguen mayúsculas ni acentos.</p>
        </section>

        {/* Subida */}
        <section className="card p-5 space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            aria-label="Archivo de productos"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-secondary">
              {file ? 'Cambiar archivo' : 'Elegir archivo'}
            </button>
            <span className="text-[13px] text-[#4F5752]">{file ? file.name : 'Ningún archivo seleccionado'}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => send(true)} disabled={!file || busy !== null} className="btn btn-primary">
              {busy === 'revisar' ? 'Revisando…' : 'Revisar archivo'}
            </button>
            {report && report.dryRun && (
              <button type="button" onClick={() => send(false)} disabled={busy !== null || report.totals.rows === report.totals.errors} className="btn btn-primary">
                {busy === 'importar' ? 'Importando…' : `Importar ${report.totals.rows - report.totals.errors} filas válidas`}
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">{error}</p>
          )}
        </section>

        {/* Resultado */}
        {report && (
          <section className="card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#17201C]">
                {report.dryRun ? 'Vista previa (no se ha guardado nada)' : 'Importación terminada'}
              </h2>
              {done && (
                <a href="/admin/products" className="text-[13px] font-medium text-[#166B4D] hover:underline">Ver productos →</a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-[12px]">
              <span className="rounded-full bg-[#F2F3F0] px-3 py-1">{report.totals.rows} filas</span>
              <span className="rounded-full bg-[#E7F3EC] px-3 py-1 text-[#2F7D5B]">{report.totals.products} productos nuevos</span>
              <span className="rounded-full bg-[#EEF3F1] px-3 py-1 text-[#166B4D]">{report.totals.updated} actualizados</span>
              <span className="rounded-full bg-[#F2F3F0] px-3 py-1">{report.totals.categories} categorías nuevas</span>
              <span className="rounded-full bg-[#F2F3F0] px-3 py-1">{report.totals.subcategories} subcategorías nuevas</span>
              <span className="rounded-full bg-[#FDECEA] px-3 py-1 text-[#B42318]">{report.totals.errors} errores</span>
            </div>

            {report.totals.errors > 0 && report.dryRun && (
              <p className="text-[12px] text-[#4F5752]">
                Las filas con error se omitirán al importar. Puedes corregirlas y volver a revisar el archivo.
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fila</th>
                    <th>Estado</th>
                    <th>Producto</th>
                    <th>Carta</th>
                    <th>Categoría</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r) => (
                    <tr key={r.line}>
                      <td className="text-[12px] text-[#8D9590]">{r.line}</td>
                      <td>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                      </td>
                      <td className="text-[13px]">{r.product || '—'}</td>
                      <td className="text-[13px]">{r.menu || '—'}</td>
                      <td className="text-[13px]">{r.category || '—'}</td>
                      <td className="text-[12px] text-[#4F5752]">{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}
