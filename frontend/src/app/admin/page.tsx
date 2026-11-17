'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { getRestaurant, getUser, type RestaurantInfo } from '@/lib/session';

interface Counts {
  sedes: number;
  sedesActivas: number;
  cartas: number;
  productos: number;
  anuncios: number;
  anunciosPublicados: number;
}

const ACTIONS = [
  { label: 'Crear carta', href: '/admin/menus', hint: 'Organiza tus platos por carta y sede' },
  { label: 'Agregar producto', href: '/admin/categories', hint: 'Entra a una categoría y crea el producto' },
  { label: 'Importar productos', href: '/admin/products/import', hint: 'Sube un archivo .xlsx o .csv' },
  { label: 'Nuevo anuncio', href: '/admin/ads/nuevo', hint: 'Historia, enlace, suscripción o producto' },
  { label: 'Diseño del restaurante', href: '/admin/restaurant', hint: 'Título, fondo y colores de la página principal' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    setName(getUser()?.name ?? '');
    getRestaurant().then(setRestaurant);
    Promise.all([
      api.get<{ active: boolean }[]>('/pages').catch(() => []),
      api.get<{ id: number }[]>('/menus').catch(() => []),
      api.get<{ id: number; productCount?: number }[]>('/products').catch(() => []),
      api.get<{ publishedAds: unknown[]; active: boolean }[]>('/ads').catch(() => []),
    ]).then(([pages, menus, products, ads]) => {
      setCounts({
        sedes: pages.length,
        sedesActivas: pages.filter((p) => p.active).length,
        cartas: menus.length,
        productos: products.length,
        anuncios: ads.length,
        anunciosPublicados: ads.filter((a) => a.publishedAds.length > 0).length,
      });
    });
  }, []);

  const stats = counts
    ? [
        { label: 'Sedes activas', value: `${counts.sedesActivas} de ${counts.sedes}`, href: '/admin/pages' },
        { label: 'Cartas', value: counts.cartas, href: '/admin/menus' },
        { label: 'Productos', value: counts.productos, href: '/admin/products' },
        { label: 'Anuncios publicados', value: `${counts.anunciosPublicados} de ${counts.anuncios}`, href: '/admin/ads' },
      ]
    : [];

  return (
    <AdminLayout active="dashboard">
      <header className="mb-8">
        <h1>{name ? `Hola, ${name.split(' ')[0]}` : 'Vista general'}</h1>
        <p className="mt-1 text-[13px] text-[#8D9590]">{restaurant ? `Resumen de ${restaurant.name}` : 'Resumen del restaurante'}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(counts ? stats : [1, 2, 3, 4]).map((s, i) =>
          typeof s === 'number' ? (
            <div key={i} className="card h-[92px] animate-pulse bg-[#F6F6F3]" aria-hidden="true" />
          ) : (
            <a key={s.label} href={s.href} className="card p-5 transition-shadow hover:shadow-md">
              <p className="text-[12px] text-[#8D9590]">{s.label}</p>
              <p className="font-serif-display mt-1 text-[28px] font-semibold text-[#0B2D45]">{s.value}</p>
            </a>
          ),
        )}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-[15px] font-semibold text-[#17201C]">Acciones rápidas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => (
            <a key={a.label} href={a.href} className="card flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#17201C]">{a.label}</p>
                <p className="mt-0.5 text-[12px] text-[#8D9590]">{a.hint}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="flex-shrink-0 text-[#B5BBB6]">
                <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
