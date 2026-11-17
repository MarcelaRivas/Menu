'use client';
import { EmptyState } from '@/components/ui-states';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';

interface Page {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

const sedeData: Record<string, { location: string; cards: number }> = {
  'Sede Granada': { location: 'Cali · Norte', cards: 3 },
  'Sede Ciudad Jardín': { location: 'Cali · Sur', cards: 3 },
  'Sede Centenario': { location: 'Cali · Oeste', cards: 2 },
};

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Page[]>('/pages').then((data) => {
      setPages(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = pages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout active="pages">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[9px] font-bold uppercase tracking-[1.5px] mb-[10px]" style={{ color: '#CB915C' }}>Estructura del restaurante</p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold leading-tight" style={{ color: '#102F27' }}>Restaurantes y sedes</h1>
            <p className="mt-[6px] text-xs" style={{ color: '#75857D' }}>Cada sede tiene su propia página pública, diseño, cartas y anuncios.</p>
          </div>
          <a href="/admin/restaurant" className="btn btn-secondary h-[36px] px-4 rounded-[9px] text-sm flex-shrink-0">
            Restaurante y diseño
          </a>
          <a href="/admin/pages/new" className="btn btn-primary h-[36px] px-4 rounded-[9px] text-sm flex-shrink-0" style={{ backgroundColor: '#0C392E' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            + Nueva sede
          </a>
        </div>
      </div>

      {/* Search + actions */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ color: '#9CAF9F' }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[36px] pl-[36px] pr-3 rounded-[9px] text-sm bg-white outline-none transition-colors"
            style={{ border: '1px solid #E6EAE6', color: '#3B5247' }}
            placeholder="Buscar sede..."
            aria-label="Buscar sedes"
          />
        </div>
        <a
          href="/sede-principal"
          target="_blank"
          rel="noopener"
          className="h-[36px] inline-flex items-center gap-2 px-4 rounded-[9px] text-sm bg-white flex-shrink-0 hover:bg-[#FAFAF8] transition-colors"
          style={{ border: '1px solid #E6EAE6', color: '#3B5247' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Ver página principal
        </a>
      </div>

      {/* Cards grid */}
      {loading ? (
        <p className="text-sm" style={{ color: '#9CAF9F' }}>Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((page) => {
            const extra = sedeData[page.name] || { location: `/${page.slug}`, cards: Math.floor(Math.random() * 5) + 1 };
            return (
              <article key={page.id} className="bg-white rounded-[13px] overflow-hidden border transition-shadow hover:shadow-md" style={{ borderColor: '#EDF0ED' }}>
                {/* Cover */}
                <div className="h-[125px] relative overflow-hidden" style={{ backgroundColor: '#0C392E' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="opacity-20" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.5"/>
                      <circle cx="9" cy="9" r="2" stroke="white" strokeWidth="1.5"/>
                      <path d="M21 15l-5-5-6 6-3-3-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="absolute bottom-3 left-3 inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/90" style={{ color: '#0C392E' }}>
                    {page.active ? 'Publicada' : 'Inactiva'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs" style={{ color: '#9CAF9F' }}>
                    <span className="flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                        <rect x="0.5" y="0.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M0.5 3.5h10" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      {extra.cards} cartas
                    </span>
                    <span>{extra.location}</span>
                  </div>

                  <h2 className="font-semibold text-sm" style={{ color: '#102F27' }}>{page.name}</h2>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => router.push(`/admin/pages/${page.id}`)}
                      className="flex-1 h-[34px] rounded-[9px] text-xs font-medium text-white"
                      style={{ backgroundColor: '#0C392E' }}
                    >
                      Administrar
                    </button>
                    <button
                      onClick={() => router.push(`/admin/pages/${page.id}`)}
                      className="btn btn-ghost btn-sm h-[34px] px-3 rounded-[9px] text-xs"
                      style={{ color: '#5A7263' }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full">
              <EmptyState action={<a href="/admin/pages/new" className="btn btn-primary btn-sm">+ Nueva sede</a>}>
                No hay sedes. Crea tu primera sede para comenzar.
              </EmptyState>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}