import {
  API, API_ORIGIN, GOLD, TopBar, BackButton, GoldDivider, categoryIcon, pageBackground, validHex,
} from '@/lib/public-ui';
import { DefaultImage } from '@/lib/public-ui';

interface SedeData {
  name: string;
  restaurant?: { name: string } | null;
  design?: { backgroundBrightness: number; headerValue: string; buttonFillColor: string; font: string } | null;
  backgroundUrl?: string | null;
}

interface CategoryItem { id: number; name: string; description: string; imageUrl?: string | null }

interface MenuData {
  id: number;
  name: string;
  categories: (CategoryItem & { children: CategoryItem[] })[];
}

export default async function MenuCategoriesPage({ params }: { params: Promise<{ restaurant: string; sede: string; menuId: string }> }) {
  const { restaurant, sede, menuId } = await params;

  const [sedeRes, menuRes] = await Promise.all([
    fetch(`${API}/public/restaurants/${restaurant}/pages/${sede}`, { cache: 'no-store' }),
    fetch(`${API}/public/menus/${menuId}`, { cache: 'no-store' }),
  ]);

  if (!menuRes.ok || !sedeRes.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Carta no encontrada</h1>
          <p className="text-gray-500">Esta carta no está disponible</p>
        </div>
      </div>
    );
  }

  const sedeData: SedeData = await sedeRes.json();
  const menu: MenuData = await menuRes.json();
  const d = sedeData.design;
  const restaurantName = sedeData.restaurant?.name ?? 'Restaurante';
  // Color del degradado en las tarjetas de categoría.
  const accent = '#003C6F';

  return (
    <div className="flex min-h-screen flex-col" style={{ background: pageBackground(sedeData.backgroundUrl, d?.backgroundBrightness, d?.headerValue), backgroundColor: '#0E2A22', fontFamily: d?.font ?? 'Inter' }}>
      {/* Barra superior: restaurante | sede */}
      <nav className="flex items-center justify-between px-6 py-3 text-white sm:px-10" style={{ backgroundColor: '#0B2D45', borderBottom: `3px solid ${GOLD}` }} aria-label="Principal">
        <div className="flex items-center gap-4">
          <span className="font-serif-display text-[20px] leading-tight sm:text-[22px]">{restaurantName}</span>
          <span className="hidden h-10 w-px bg-white/30 sm:block" aria-hidden="true" />
          <div className="hidden items-center gap-2 sm:flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17h18M5 17a7 7 0 0114 0M12 6v2M4 20h16" />
            </svg>
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em]">{sedeData.name}</span>
          </div>
        </div>
        <a href={`/${restaurant}`} className="flex items-center gap-2 text-[15px] text-white/90 transition-colors hover:text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" />
          </svg>
          Restaurantes
        </a>
      </nav>

      <div className="px-6 pt-6 sm:px-10">
        <BackButton href={`/${restaurant}/${sede}`} />
      </div>

      <header className="px-6 pb-8 pt-6 text-center text-white">
        <div className="mx-auto max-w-[560px]">
          <GoldDivider>
            <span style={{ color: GOLD }}>{categoryIcon(menu.name)}</span>
          </GoldDivider>
        </div>
        <h1 className="font-serif-display mt-4 text-[44px] font-semibold leading-tight text-white sm:text-[56px]" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
          {menu.name}
        </h1>
        <p className="font-serif-display mt-2 text-[19px] italic opacity-95">Seleccione una categoría para ver los productos</p>
      </header>

      <main className="mx-auto w-full max-w-[800px] px-6 pb-16" aria-label="Categorías">
        {/* Categorías principales y sus subcategorías, en ese orden. */}
        {menu.categories.length === 0 ? (
          <p className="py-12 text-center text-[15px] text-white/80">Esta carta está vacía</p>
        ) : (
          <ul className="space-y-3">
            {menu.categories.flatMap((c) => [c, ...(c.children ?? []).map((s) => ({ ...s, imageUrl: null as string | null }))]).map((cat) => {
              const img = cat.imageUrl ? `${API_ORIGIN}${cat.imageUrl}` : null;
              return (
                <li key={cat.id}>
                  <a
                    href={`/${restaurant}/${sede}/menu/${menuId}/${cat.id}`}
                    className="group relative flex min-h-[96px] items-center overflow-hidden rounded-[16px] border-2 border-[#FBF6EA]/90 shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: '#0B3B2E' }}
                    aria-label={`Ver ${cat.name}`}
                  >
                    {!img && (
                      <span className="absolute inset-y-0 left-0 w-[58%]">
                        <DefaultImage kind="plate" />
                      </span>
                    )}
                    {img && (
                      <span
                        className="absolute inset-y-0 left-0 w-[58%] bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                        aria-hidden="true"
                      />
                    )}
                    {/* Degradado: la imagen se funde con el verde hacia el texto */}
                    <span
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(90deg, rgba(11,59,46,0) 0%, rgba(11,59,46,0) 42%, rgba(11,59,46,0.7) 54%, ${accent} 64%, ${accent} 100%)` }}
                      aria-hidden="true"
                    />
                    <span className="relative ml-auto flex w-[50%] items-center gap-3 py-3 pl-1 pr-5">
                      <span className="flex-shrink-0 text-[#F3E3B5]" aria-hidden="true">{categoryIcon(cat.name)}</span>
                      <span className="font-serif-display min-w-0 flex-1 text-[26px] font-semibold leading-tight text-[#FBF6EA] sm:text-[28px]" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                        {cat.name}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="flex-shrink-0 text-[#FBF6EA] transition-transform group-hover:translate-x-0.5">
                        <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
