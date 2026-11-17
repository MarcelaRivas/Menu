'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';


import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { AdEditor, type AdSavePayload, type AdValues } from '@/components/ad-editor';

interface AdDetail {
  id: number;
  name: string | null;
  type: AdValues['type'];
  mediaId: number | null;
  videoUrl: string | null;
  text: string | null;
  config: AdValues['config'];
  startsAt: string | null;
  endsAt: string | null;
}

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const [ad, setAd] = useState<AdValues | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<AdDetail>(`/ads/${id}`)
      .then((a) => setAd({ ...a }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudo cargar el anuncio'))
      .finally(() => setLoading(false));
  }, [id]);

  async function save(payload: AdSavePayload) {
    await api.put(`/ads/${id}`, payload);
    toast.success('Anuncio guardado');
    router.push('/admin/ads');
  }

  async function remove() {
    if (!window.confirm('¿Eliminar este anuncio definitivamente?')) return;
    try {
      await api.del(`/ads/${id}`);
      router.push('/admin/ads');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el anuncio');
    }
  }

  return (
    <AdminLayout active="ads">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1>Editar anuncio</h1>
        </div>
        <a href={`/admin/ads/${id}`} className="btn btn-secondary">Publicar en sedes</a>
      </div>
      {error && <ErrorAlert message={error} />}
      {loading ? (
        <LoadingState />
      ) : ad ? (
        <AdEditor initial={ad} onSave={save} onDelete={remove} onCancel={() => router.push('/admin/ads')} />
      ) : null}
    </AdminLayout>
  );
}
