'use client';
import { EmptyState, ErrorAlert, LoadingState } from '@/components/ui-states';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';

interface Ad {
  id: number;
  name: string | null;
  type: string;
  text: string | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  publishedAds: { id: number }[];
}

const TYPE_LABELS: Record<string, string> = { STORY: 'Historia', LINK: 'Enlace', SUBSCRIBE: 'Suscríbete', PRODUCT: 'Producto' };

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    api
      .get<Ad[]>('/ads')
      .then(setAds)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los anuncios'))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: number) {
    if (!window.confirm('¿Eliminar este anuncio definitivamente?')) return;
    setError('');
    try {
      await api.del(`/ads/${id}`);
      setAds(ads.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el anuncio');
    }
  }

  function period(a: Ad): string {
    const f = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    if (!a.startsAt) return 'Sin fecha de inicio';
    return a.endsAt ? `${f(a.startsAt)} – ${f(a.endsAt)}` : `Desde ${f(a.startsAt)}`;
  }

  return (
    <AdminLayout active="ads">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1>Anuncios</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">Historias, enlaces, suscripciones y productos destacados.</p>
        </div>
        <button onClick={() => router.push('/admin/ads/nuevo')} className="btn btn-primary">+ Nuevo anuncio</button>
      </header>

      {error && <ErrorAlert message={error} />}

      {loading ? <p className="text-[#8D9590]">Cargando...</p> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <div key={ad.id} className="card flex flex-col p-4">
              <div className="flex items-center justify-between text-xs text-[#8D9590]">
                <span>{TYPE_LABELS[ad.type] || ad.type}</span>
                <span>{ad.publishedAds.length > 0 ? `Publicado en ${ad.publishedAds.length} sede(s)` : 'Sin publicar'}</span>
              </div>
              <p className="mt-1 font-medium">{ad.name || 'Sin nombre'}</p>
              {ad.text && <p className="mt-1 truncate text-sm text-[#8D9590]">{ad.text}</p>}
              <p className="mt-2 text-[12px] text-[#8D9590]">{period(ad)}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-4 text-xs">
                <button onClick={() => router.push(`/admin/ads/${ad.id}/editar`)} className="btn btn-secondary btn-sm">Editar</button>
                <button onClick={() => router.push(`/admin/ads/${ad.id}`)} className="btn btn-ghost btn-sm">Publicar en sede</button>
                <button onClick={() => remove(ad.id)} className="btn btn-ghost btn-sm text-[#B42318]">Eliminar</button>
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <div className="col-span-full">
              <EmptyState action={<button type="button" onClick={() => router.push('/admin/ads/nuevo')} className="btn btn-primary btn-sm">+ Nuevo anuncio</button>}>
                Sin anuncios. Crea uno para mostrarlo en tus sedes.
              </EmptyState>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
