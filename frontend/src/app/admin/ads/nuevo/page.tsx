'use client';


import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { requireRestaurantId } from '@/lib/session';
import { AdminLayout } from '@/components/admin-layout';
import { AdEditor, type AdSavePayload } from '@/components/ad-editor';

export default function NewAdPage() {
  const router = useRouter();

  async function save(payload: AdSavePayload) {
    const restaurantId = await requireRestaurantId();
    await api.post('/ads', { restaurantId, ...payload });
    toast.success('Anuncio creado');
    router.push('/admin/ads');
  }

  return (
    <AdminLayout active="ads">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1>Nuevo anuncio</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">Crea el anuncio y luego publícalo en las sedes que quieras.</p>
        </div>
      </div>
      <AdEditor initial={null} onSave={save} onCancel={() => router.push('/admin/ads')} />
    </AdminLayout>
  );
}
