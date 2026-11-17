import { BadRequestException, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

/** Columnas reconocidas. Se aceptan también sus nombres sin acentos ni mayúsculas. */
const COLUMNS = [
  'carta', 'sede', 'categoria', 'subcategoria', 'producto', 'descripcion', 'precio',
  'nombre_precio', 'codigo', 'recomendado', 'nuevo', 'agotado', 'esconder_precios',
] as const;
type Column = (typeof COLUMNS)[number];

const REQUIRED: Column[] = ['carta', 'categoria', 'producto'];

const ALIASES: Record<string, Column> = {
  carta: 'carta', menu: 'carta', 'carta_nombre': 'carta',
  sede: 'sede', pagina: 'sede',
  categoria: 'categoria', category: 'categoria',
  subcategoria: 'subcategoria', subcategory: 'subcategoria',
  producto: 'producto', product: 'producto', nombre: 'producto',
  descripcion: 'descripcion', description: 'descripcion',
  precio: 'precio', price: 'precio', valor: 'precio',
  nombre_precio: 'nombre_precio', presentacion: 'nombre_precio',
  codigo: 'codigo', code: 'codigo',
  recomendado: 'recomendado', nuevo: 'nuevo', agotado: 'agotado',
  esconder_precios: 'esconder_precios', ocultar_precios: 'esconder_precios',
};

export interface ImportRowResult {
  line: number;
  status: 'creado' | 'actualizado' | 'error';
  product: string;
  menu: string;
  category: string;
  message: string;
}

export interface ImportReport {
  dryRun: boolean;
  totals: { rows: number; products: number; updated: number; categories: number; subcategories: number; errors: number };
  rows: ImportRowResult[];
}

/** Se lanza al final de una simulación para deshacer todos los cambios. */
class DryRunRollback extends Error {}

function normalizeHeader(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, '');
  const firstLine = clean.split(/\r?\n/)[0] ?? '';
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(cell); cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

async function parseXlsx(buffer: Buffer): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];
  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values: string[] = [];
    for (let c = 1; c <= row.cellCount; c++) values.push(String(row.getCell(c).text ?? '').trim());
    if (values.some((v) => v !== '')) rows.push(values);
  });
  return rows;
}

function parsePrice(raw: string): number | null | 'invalid' {
  const t = raw.trim().replace(/\$/g, '').replace(/\s/g, '');
  if (t === '') return null;
  const normalized = t.includes(',') && !t.includes('.') ? t.replace(',', '.') : t.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : 'invalid';
}

function parseFlag(raw: string): boolean | null {
  const t = raw.trim().toLowerCase();
  if (['si', 'sí', 's', 'yes', 'y', 'true', '1', 'x'].includes(t)) return true;
  if (['no', 'n', 'false', '0'].includes(t)) return false;
  return null;
}

@Injectable()
export class ProductImportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Importa productos desde un .xlsx o .csv. Cada fila indica la carta, la categoría
   * (y opcionalmente la subcategoría) y el producto. Las categorías que no existan se crean.
   * Con dryRun=true se valida y se muestra el resultado, pero no se guarda nada.
   */
  async run(buffer: Buffer, filename: string, dryRun: boolean): Promise<ImportReport> {
    const isXlsx = filename.toLowerCase().endsWith('.xlsx');
    const table = isXlsx ? await parseXlsx(buffer) : parseCsv(buffer.toString('utf8'));
    if (table.length < 2) throw new BadRequestException('El archivo no tiene filas de productos.');

    const headerMap = new Map<Column, number>();
    table[0].forEach((h, idx) => {
      const col = ALIASES[normalizeHeader(h)];
      if (col && !headerMap.has(col)) headerMap.set(col, idx);
    });
    const missing = REQUIRED.filter((c) => !headerMap.has(c));
    if (missing.length) {
      throw new BadRequestException(`Faltan columnas obligatorias: ${missing.join(', ')}.`);
    }

    const report: ImportReport = {
      dryRun,
      totals: { rows: table.length - 1, products: 0, updated: 0, categories: 0, subcategories: 0, errors: 0 },
      rows: [],
    };

    try {
      await this.prisma.$transaction(
        async (tx) => {
          for (let i = 1; i < table.length; i++) {
            const get = (col: Column) => (headerMap.has(col) ? (table[i][headerMap.get(col)!] ?? '').trim() : '');
            const result = await this.processRow(tx, get, i + 1, report.totals);
            report.rows.push(result);
            if (result.status === 'error') report.totals.errors++;
          }
          if (dryRun) throw new DryRunRollback();
        },
        { timeout: 120_000, maxWait: 15_000 },
      );
    } catch (e) {
      if (!(e instanceof DryRunRollback)) throw e;
    }
    return report;
  }

  private async processRow(
    tx: Tx,
    get: (col: Column) => string,
    line: number,
    totals: ImportReport['totals'],
  ): Promise<ImportRowResult> {
    const base = { line, product: get('producto'), menu: get('carta'), category: get('categoria') };
    const fail = (message: string): ImportRowResult => ({ ...base, status: 'error', message });

    if (!base.menu) return fail('Falta la carta');
    if (!base.category) return fail('Falta la categoría');
    if (!base.product) return fail('Falta el nombre del producto');

    const price = parsePrice(get('precio'));
    if (price === 'invalid') return fail('Precio inválido');

    const flags = {
      recommended: parseFlag(get('recomendado')),
      isNew: parseFlag(get('nuevo')),
      soldOut: parseFlag(get('agotado')),
      hidePrices: parseFlag(get('esconder_precios')),
    };

    // Carta: debe existir. Si hay varias con el mismo nombre, se pide la sede.
    const sedeName = get('sede');
    const menus = await tx.menu.findMany({
      where: { name: { equals: base.menu, mode: 'insensitive' } },
      include: { page: { select: { name: true } } },
    });
    const matches = sedeName
      ? menus.filter((m) => m.page.name.toLowerCase() === sedeName.toLowerCase())
      : menus;
    if (matches.length === 0) {
      return fail(sedeName ? `No existe la carta "${base.menu}" en la sede "${sedeName}"` : `No existe la carta "${base.menu}"`);
    }
    if (matches.length > 1) {
      return fail(`Hay varias cartas llamadas "${base.menu}". Agrega la columna sede para elegir una.`);
    }
    const menu = matches[0];

    // Categoría principal: se crea si no existe en la carta.
    let category = await tx.category.findFirst({
      where: { menuId: menu.id, parentId: null, deletedAt: null, name: { equals: base.category, mode: 'insensitive' } },
    });
    let note = '';
    if (!category) {
      const count = await tx.category.count({ where: { menuId: menu.id, parentId: null } });
      category = await tx.category.create({
        data: { menuId: menu.id, name: base.category, sortOrder: count },
      });
      totals.categories++;
      note = `Categoría "${base.category}" creada. `;
    }

    // Subcategoría opcional: también se crea si no existe.
    const subName = get('subcategoria');
    let target = category;
    if (subName) {
      let sub = await tx.category.findFirst({
        where: { parentId: category.id, deletedAt: null, name: { equals: subName, mode: 'insensitive' } },
      });
      if (!sub) {
        const count = await tx.category.count({ where: { parentId: category.id } });
        sub = await tx.category.create({
          data: { menuId: menu.id, parentId: category.id, name: subName, sortOrder: count },
        });
        totals.subcategories++;
        note += `Subcategoría "${subName}" creada. `;
      }
      target = sub;
    }

    const existing = await tx.product.findFirst({
      where: { categoryId: target.id, deletedAt: null, name: { equals: base.product, mode: 'insensitive' } },
    });
    const description = get('descripcion');
    const code = get('codigo');
    const priceName = get('nombre_precio');

    if (existing) {
      await tx.product.update({
        where: { id: existing.id },
        data: {
          ...(description ? { description } : {}),
          ...(code ? { code } : {}),
          ...(flags.recommended !== null ? { recommended: flags.recommended } : {}),
          ...(flags.isNew !== null ? { isNew: flags.isNew } : {}),
          ...(flags.soldOut !== null ? { soldOut: flags.soldOut } : {}),
          ...(flags.hidePrices !== null ? { hidePrices: flags.hidePrices } : {}),
          ...(typeof price === 'number'
            ? {
                prices: {
                  deleteMany: {},
                  createMany: { data: [{ name: priceName, value: price, sortOrder: 0 }] },
                },
              }
            : {}),
        },
      });
      totals.updated++;
      return { ...base, status: 'actualizado', message: `${note}Producto ya existía: actualizado.` };
    }

    const count = await tx.product.count({ where: { categoryId: target.id } });
    await tx.product.create({
      data: {
        categoryId: target.id,
        name: base.product,
        description,
        code: code || null,
        recommended: flags.recommended ?? false,
        isNew: flags.isNew ?? false,
        soldOut: flags.soldOut ?? false,
        hidePrices: flags.hidePrices ?? false,
        sortOrder: count,
        prices: typeof price === 'number' ? { createMany: { data: [{ name: priceName, value: price, sortOrder: 0 }] } } : undefined,
      },
    });
    totals.products++;
    return { ...base, status: 'creado', message: `${note}Producto creado.`.trim() };
  }

  /** Plantilla CSV para descargar. */
  template(): string {
    return [
      'carta,sede,categoria,subcategoria,producto,descripcion,precio,nombre_precio,codigo,recomendado,nuevo,agotado,esconder_precios',
      'Carta Principal,Sede Principal,Entradas,,Empanadas,Empanadas de carne (4 unidades),12000,,EMP-01,si,no,no,no',
      'Carta Principal,Sede Principal,Platos Fuertes,Carnes,Lomo Saltado,Lomo de res salteado con cebolla y tomate,38000,,LOM-01,no,si,no,no',
    ].join('\n');
  }
}
