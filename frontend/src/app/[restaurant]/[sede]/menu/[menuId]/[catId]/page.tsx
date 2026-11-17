import type { ReactNode } from 'react';
import { DefaultImage } from '@/lib/public-ui';
import { API, API_ORIGIN, GOLD, NAVY, CREAM, TopBar, BackButton, GoldDivider, pageBackground, validHex } from '@/lib/public-ui';

interface Price { name: string; value: number | string }

interface Product {
  id: number;
  name: string;
  description: string;
  recommended: boolean;
  isNew: boolean;
  soldOut: boolean;
  hidePrices: boolean;
  prices: Price[];
  productMedia?: { media: { url: string } }[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  hideTitle: boolean;
  style: string;
  columns: number;
  products: Product[];
  children: { id: number; name: string; products: Product[] }[];
}

interface SedeData {
  name: string;
  restaurant?: { name: string } | null;
  design?: { backgroundBrightness: number; headerValue: string; font: string } | null;
  backgroundUrl?: string | null;
}

interface MenuData {
  id: number;
  name: string;
  categories: (Category & { children: Category[] })[];
}

const GRID: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' };
const WIDTH: Record<number, string> = { 1: 'max-w-[680px]', 2: 'max-w-[900px]', 3: 'max-w-[1100px]' };

function formatPrice(p: Price): string {
  return `$${Number(p.value).toLocaleString('es-CO')}`;
}

function imageOf(p: Product): string | null {
  const url = p.productMedia?.[0]?.media.url;
  return url ? `${API_ORIGIN}${url}` : null;
}

function PriceBlock({ prices, light = false }: { prices: Price[]; light?: boolean }) {
  if (prices.length === 0) return null;
  return (
    <div className="flex-shrink-0 text-right">
      {prices.map((p, i) => (
        <div key={i} className="whitespace-nowrap text-[16px] font-semibold tabular-nums" style={{ color: light ? '#ffffff' : NAVY }}>
          {p.name && <span className={`mr-1.5 text-[11px] font-normal uppercase tracking-wide ${light ? 'text-white/80' : 'text-[#6B7280]'}`}>{p.name}</span>}
          {formatPrice(p)}
        </div>
      ))}
    </div>
  );
}

function Tags({ p }: { p: Product }) {
  if (!(p.recommended || p.isNew || p.soldOut)) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {p.recommended && <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${GOLD}33`, color: '#7A5B1E' }}>Recomendado</span>}
      {p.isNew && <span className="rounded-full bg-[#DBEAFE] px-2.5 py-0.5 text-[11px] font-medium text-[#1E40AF]">Nuevo</span>}
      {p.soldOut && <span className="rounded-full bg-[#FDECEA] px-2.5 py-0.5 text-[11px] font-medium text-[#B42318]">Agotado</span>}
    </div>
  );
}

/** Lista: una fila por producto (texto y precio). */
function ListItem({ p }: { p: Product }) {
  return (
    <li
      className={`rounded-[16px] px-5 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.18)] ${p.soldOut ? 'opacity-55' : ''}`}
      style={{ backgroundColor: CREAM, border: `1px solid ${GOLD}55` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif-display text-[20px] font-semibold leading-snug" style={{ color: NAVY }}>{p.name}</p>
          {p.description && <p className="mt-1 text-[14px] leading-relaxed text-[#4B5563]">{p.description}</p>}
          <Tags p={p} />
        </div>
        {!p.hidePrices && <PriceBlock prices={p.prices} />}
      </div>
    </li>
  );
}

/** Con imágenes: tarjeta con foto arriba, texto y precio abajo. */
function ImageCard({ p }: { p: Product }) {
  const img = imageOf(p);
  return (
    <li className={`overflow-hidden rounded-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.22)] ${p.soldOut ? 'opacity-55' : ''}`} style={{ backgroundColor: CREAM, border: `1px solid ${GOLD}55` }}>
      <div className="aspect-[4/3] w-full bg-[#E9ECE7]">
        {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <DefaultImage kind="plate" />}
      </div>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif-display min-w-0 flex-1 text-[19px] font-semibold leading-snug" style={{ color: NAVY }}>{p.name}</p>
          {!p.hidePrices && <PriceBlock prices={p.prices} />}
        </div>
        {p.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#4B5563]">{p.description}</p>}
        <Tags p={p} />
      </div>
    </li>
  );
}

/** Banner: foto de fondo a todo el ancho de la tarjeta, con el nombre y el precio encima. */
function BannerCard({ p }: { p: Product }) {
  const img = imageOf(p);
  return (
    <li className={`relative flex min-h-[170px] items-end overflow-hidden rounded-[18px] border-2 border-[#FBF6EA]/90 shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${p.soldOut ? 'opacity-55' : ''}`} style={{ backgroundColor: '#0B3B2E' }}>
      {img ? <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} aria-hidden="true" /> : <span className="absolute inset-0"><DefaultImage kind="plate" /></span>}
      <span className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(5,30,24,0.9) 0%, rgba(5,30,24,0.35) 60%, rgba(5,30,24,0.1) 100%)' }} aria-hidden="true" />
      <div className="relative w-full p-5">
        <div className="flex items-end justify-between gap-3">
          <p className="font-serif-display min-w-0 flex-1 text-[24px] font-semibold leading-tight text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{p.name}</p>
          {!p.hidePrices && <PriceBlock prices={p.prices} light />}
        </div>
        {p.description && <p className="mt-1 line-clamp-2 text-[13px] text-white/85">{p.description}</p>}
        <Tags p={p} />
      </div>
    </li>
  );
}

/** Renderiza los productos según el estilo y las columnas de la categoría. */
function ProductsView({ products, style, columns }: { products: Product[]; style: string; columns: number }): ReactNode {
  const cols = [1, 2, 3].includes(columns) ? columns : 1;
  if (style === 'LIST') {
    if (cols === 1) {
      return <ul className="space-y-3">{products.map((p) => <ListItem key={p.id} p={p} />)}</ul>;
    }
    return <ul className={`grid gap-4 ${GRID[cols]}`}>{products.map((p) => <ListItem key={p.id} p={p} />)}</ul>;
  }
  if (style === 'BANNER') {
    return <ul className={`grid gap-4 ${GRID[cols]}`}>{products.map((p) => <BannerCard key={p.id} p={p} />)}</ul>;
  }
  // WITH_IMAGES (por defecto)
  return <ul className={`grid gap-5 ${GRID[cols]}`}>{products.map((p) => <ImageCard key={p.id} p={p} />)}</ul>;
}

export default async function CategoryPage({ params }: { params: Promise<{ restaurant: string; sede: string; menuId: string; catId: string }> }) {
  const { restaurant, sede, menuId, catId } = await params;

  const [sedeRes, menuRes] = await Promise.all([
    fetch(`${API}/public/restaurants/${restaurant}/pages/${sede}`, { cache: 'no-store' }),
    fetch(`${API}/public/menus/${menuId}`, { cache: 'no-store' }),
  ]);

  // Busca la categoría entre las principales y entre sus subcategorías.
  let category: Category | undefined;
  if (menuRes.ok) {
    const menu = (await menuRes.json()) as MenuData;
    const flat = menu.categories.flatMap((c) => [c, ...(c.children ?? [])]);
    category = flat.find((c) => String(c.id) === catId) as Category | undefined;
  }
  if (!sedeRes.ok || !menuRes.ok || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Categoría no encontrada</h1>
          <p className="text-gray-500">Esta categoría no está disponible</p>
        </div>
      </div>
    );
  }

  const sedeData: SedeData = await sedeRes.json();
  const d = sedeData.design;
  const restaurantName = sedeData.restaurant?.name ?? 'Restaurante';
  const menuHref = `/${restaurant}/${sede}/menu/${menuId}`;
  const cols = [1, 2, 3].includes(category.columns) ? category.columns : 1;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: pageBackground(sedeData.backgroundUrl, d?.backgroundBrightness, d?.headerValue), backgroundColor: '#0E2A22', fontFamily: d?.font ?? 'Inter' }}>
      <TopBar brand={restaurantName} homeHref={`/${restaurant}`} homeLabel="Restaurantes" />

      <div className="px-6 pt-6 sm:px-10">
        <BackButton href={menuHref} label="Volver a la carta" />
      </div>

      <header className="px-6 pb-6 pt-8 text-center text-white">
        {!category.hideTitle && (
          <>
            <p className="text-[12px] uppercase tracking-[0.2em] opacity-80">{sedeData.name}</p>
            <h1 className="font-serif-display mt-2 text-[40px] font-semibold leading-tight sm:text-[52px]" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
              {category.name}
            </h1>
          </>
        )}
        <div className="mt-4">
          <GoldDivider />
        </div>
        {category.description && <p className="font-serif-display mt-4 text-[18px] italic opacity-95">{category.description}</p>}
      </header>

      <main className={`mx-auto w-full px-6 pb-16 ${WIDTH[cols]}`}>
        {category.products.length === 0 && category.children.length === 0 ? (
          <p className="py-12 text-center text-[15px] text-white/80">Esta categoría no tiene platos</p>
        ) : (
          <div className="space-y-8">
            {category.products.length > 0 && <ProductsView products={category.products} style={category.style} columns={cols} />}

            {category.children.map((sub) => (
              <section key={sub.id} aria-label={sub.name}>
                <h2 className="mb-3 text-center text-[13px] font-semibold uppercase tracking-[0.2em] text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                  {sub.name}
                </h2>
                <ProductsView products={sub.products} style={category.style} columns={cols} />
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
