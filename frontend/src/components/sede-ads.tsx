'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface AdRow {
  id: number;
  name: string | null;
  type: string;
  active: boolean;
  publishedAds: { id: number; pageId: number; sortOrder: number }[];
}

const TYPE_LABELS: Record<string, string> = { STORY: 'Historia', LINK: 'Enlace', SUBSCRIBE: 'Suscríbete', PRODUCT: 'Producto' };

/** Anuncios de la sede: publicar o quitar cada uno sin salir de la sede. */
export function SedeAds({ pageId }: { pageId: number }) {
  const [ads, setAds] = useState<AdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  function load() {
    return api.get<AdRow[]>('/ads').then(setAds);
  }

  useEffect(() => {
    load().catch(() => setAds([])).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  async function toggle(ad: AdRow) {
    const current = ad.publishedAds.find((p) => p.pageId === pageId);
    setBusy(ad.id);
    try {
      if (current) {
        await api.post(`/ads/${ad.id}/unpublish`, { publishedAdId: current.id });
        toast.success('Anuncio quitado de la sede');
      } else {
        await api.post(`/ads/${ad.id}/publish`, { pageId, sortOrder: 0, showAfterSeconds: 0 });
        toast.success('Anuncio publicado en la sede');
      }
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el anuncio');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-[15px] font-semibold text-[#17201C]">Anuncios en esta sede</h3>
        <p className="mt-0.5 text-[12px] text-[#8D9590]">Publica o quita anuncios aquí. Para editar su contenido, ve a Anuncios.</p>
      </div>
      {loading ? (
        <p className="text-[13px] text-[#8D9590]">Cargando…</p>
      ) : ads.length === 0 ? (
        <p className="text-[13px] text-[#8D9590]">No hay anuncios. Crea uno en Anuncios.</p>
      ) : (
        <div className="card divide-y divide-[#EFF0EC] overflow-hidden">
          {ads.map((ad) => {
            const published = ad.publishedAds.some((p) => p.pageId === pageId);
            return (
              <div key={ad.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[#17201C]">{ad.name || 'Sin nombre'}</p>
                  <p className="text-[12px] text-[#8D9590]">
                    {TYPE_LABELS[ad.type] ?? ad.type}{!ad.active ? ' · Inactivo' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy === ad.id}
                  onClick={() => toggle(ad)}
                  className={published ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                >
                  {busy === ad.id ? '…' : published ? 'Quitar' : 'Publicar'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
