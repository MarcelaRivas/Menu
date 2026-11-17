'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';

interface Ad {
  id: number;
  name: string | null;
  type: string;
  text: string | null;
  active: boolean;
  publishedAds: { id: number; pageId: number; sortOrder: number; showAfterSeconds: number; page: { id: number; name: string } }[];
}

interface Sede {
  id: number;
  name: string;
  active: boolean;
}

const TYPE_LABELS: Record<string, string> = { STORY: 'Historia', LINK: 'Enlace', SUBSCRIBE: 'Suscripción', PRODUCT: 'Producto' };

export default function PublishAdPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [ad, setAd] = useState<Ad | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPage, setBusyPage] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Record<number, { sortOrder: number; showAfterSeconds: number }>>({});

  async function load() {
    const [a, s] = await Promise.all([api.get<Ad>(`/ads/${id}`), api.get<Sede[]>('/pages')]);
    setAd(a);
    setSedes(s.filter((x) => x.active));
  }

  useEffect(() => {
    if (!id) return;
    load()
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudo cargar el anuncio'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function settingsFor(pageId: number) {
    return draft[pageId] ?? { sortOrder: 0, showAfterSeconds: 0 };
  }

  async function publish(pageId: number) {
    setBusyPage(pageId);
    setError('');
    try {
      await api.post(`/ads/${id}/publish`, { pageId, ...settingsFor(pageId) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar el anuncio');
    } finally {
      setBusyPage(null);
    }
  }

  async function unpublish(publishedAdId: number, pageId: number) {
    setBusyPage(pageId);
    setError('');
    try {
      await api.post(`/ads/${id}/unpublish`, { publishedAdId });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo quitar el anuncio');
    } finally {
      setBusyPage(null);
    }
  }

  return (
    <AdminLayout active="ads">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1>Publicar anuncio</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">Elige en qué sedes se muestra este anuncio.</p>
        </div>
        <a href="/admin/ads" className="btn btn-secondary">← Volver a anuncios</a>
      </div>

      {error && (
        <ErrorAlert message={error} />
      )}

      {loading ? (
        <LoadingState />
      ) : !ad ? (
        <p className="text-[13px] text-[#8D9590]">Este anuncio no existe.</p>
      ) : (
        <div className="max-w-3xl space-y-6">
          <section className="card p-5">
            <p className="text-[12px] text-[#8D9590]">{TYPE_LABELS[ad.type] ?? ad.type}</p>
            <p className="mt-0.5 text-[16px] font-semibold text-[#17201C]">{ad.name || 'Sin nombre'}</p>
            {ad.text && <p className="mt-2 text-[13px] text-[#4F5752]">{ad.text}</p>}
            {!ad.active && <p className="mt-2 text-[12px] text-[#B42318]">Este anuncio está inactivo.</p>}
          </section>

          <section className="card divide-y divide-[#EFF0EC] overflow-hidden">
            {sedes.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-[#8D9590]">No hay sedes activas.</p>}
            {sedes.map((sede) => {
              const published = ad.publishedAds.find((p) => p.pageId === sede.id);
              const busy = busyPage === sede.id;
              const s = settingsFor(sede.id);
              return (
                <div key={sede.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#17201C]">{sede.name}</p>
                    <p className="text-[12px] text-[#8D9590]">
                      {published ? `Publicado · orden ${published.sortOrder} · mostrar después de ${published.showAfterSeconds} s` : 'No publicado'}
                    </p>
                  </div>

                  {!published && (
                    <div className="flex items-center gap-2 text-[12px] text-[#4F5752]">
                      <label className="flex items-center gap-1">
                        Orden
                        <input
                          type="number"
                          min={0}
                          value={s.sortOrder}
                          onChange={(e) => setDraft({ ...draft, [sede.id]: { ...s, sortOrder: Number(e.target.value) || 0 } })}
                          className="input w-[70px] py-1"
                        />
                      </label>
                      <label className="flex items-center gap-1">
                        Segundos
                        <input
                          type="number"
                          min={0}
                          value={s.showAfterSeconds}
                          onChange={(e) => setDraft({ ...draft, [sede.id]: { ...s, showAfterSeconds: Number(e.target.value) || 0 } })}
                          className="input w-[70px] py-1"
                        />
                      </label>
                    </div>
                  )}

                  {published ? (
                    <button type="button" disabled={busy} onClick={() => unpublish(published.id, sede.id)} className="btn btn-secondary btn-sm">
                      {busy ? 'Quitando…' : 'Quitar de la sede'}
                    </button>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => publish(sede.id)} className="btn btn-primary btn-sm">
                      {busy ? 'Publicando…' : 'Publicar en la sede'}
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
