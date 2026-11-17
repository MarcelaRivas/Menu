'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { requireRestaurantId, getRestaurant } from '@/lib/session';
import { AdminLayout } from '@/components/admin-layout';
import { DesignEditor, type DesignValues } from '@/components/design-editor';
import { SedeAds } from '@/components/sede-ads';
import { SedeMenus } from '@/components/sede-menus';

interface Page {
  id: number;
  restaurantId: number;
  name: string;
  slug: string;
  contactInfo: string | null;
  active: boolean;
  design?: Design | null;
}

interface Design extends DesignValues {
  logoMediaId: number | null;
  logoSize: number;
  title: string;
  description: string;
  buttonShadow: string;
  buttonBorder: string;
}

const SECTIONS = [
  { id: 'datos', label: 'Datos de la sede' },
  { id: 'diseno', label: 'Diseño' },
  { id: 'cartas', label: 'Cartas', existingOnly: true },
  { id: 'anuncios', label: 'Anuncios', existingOnly: true },
];

export default function PageEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const isNew = !id || id === 'new';

  const [page, setPage] = useState<Partial<Page>>({ active: true });
  const [design, setDesign] = useState<Partial<Design>>({});
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.get<Page>(`/pages/${id}`).then((p) => {
        setPage(p);
        if (p.design) setDesign(p.design);
      });
    }
    getRestaurant().then((r) => setRestaurantSlug(r?.slug ?? ''));
  }, [id, isNew]);

  async function save() {
    setSaving(true);
    try {
      if (isNew) {
        const restaurantId = await requireRestaurantId();
        const created = await api.post<Page>('/pages', {
          restaurantId,
          name: page.name!,
          slug: page.slug!,
          contactInfo: page.contactInfo,
        });
        await api.put(`/pages/${created.id}/design`, design);
      } else {
        await api.put(`/pages/${id}`, { name: page.name, slug: page.slug, contactInfo: page.contactInfo, active: page.active });
        await api.put(`/pages/${id}/design`, design);
      }
      toast.success('Sede guardada');
      router.push('/admin/pages');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la sede');
    } finally {
      setSaving(false);
    }
  }

  const publicHref = !isNew && restaurantSlug && page.slug ? `/${restaurantSlug}/${page.slug}` : null;

  return (
    <AdminLayout active="pages">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>{isNew ? 'Nueva sede' : page.name || 'Editar sede'}</h1>
          {publicHref && (
            <a href={publicHref} target="_blank" rel="noopener" className="mt-0.5 inline-block text-[12px] text-[#166B4D] hover:underline">
              Ver la sede en la web →
            </a>
          )}
        </div>
        <div className="flex gap-3">
          <a href="/admin/pages" className="btn btn-secondary">Cancelar</a>
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Índice de secciones */}
        <nav className="flex flex-shrink-0 gap-2 overflow-x-auto lg:sticky lg:top-6 lg:w-[180px] lg:flex-col lg:self-start lg:overflow-visible" aria-label="Secciones de la sede">
          {SECTIONS.filter((s) => !(s.existingOnly && isNew)).map((s) => (
            <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap rounded-[8px] px-3 py-2 text-[13px] text-[#4F5752] transition-colors hover:bg-white hover:text-[#17201C]">
              {s.label}
            </a>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-14">
          {/* Datos */}
          <section id="datos" className="scroll-mt-6 space-y-5">
            <h2 className="text-[17px] font-semibold text-[#17201C]">Datos de la sede</h2>
            <div className="max-w-lg space-y-4">
              <div>
                <label htmlFor="page-name" className="label">Nombre</label>
                <input id="page-name" name="name" value={page.name ?? ''} onChange={(e) => setPage({ ...page, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label htmlFor="page-slug" className="label">Dirección (URL)</label>
                <input id="page-slug" name="slug" value={page.slug ?? ''} onChange={(e) => setPage({ ...page, slug: e.target.value.replace(/\s+/g, '-') })} className="input" placeholder="mi-sede" required />
                <p className="mt-1 text-xs text-[#8D9590]">Será visible en /{restaurantSlug || 'restaurante'}/{page.slug || 'mi-sede'}</p>
              </div>
              <div>
                <label htmlFor="page-contact" className="label">Información de contacto</label>
                <textarea id="page-contact" name="contactInfo" value={page.contactInfo ?? ''} onChange={(e) => setPage({ ...page, contactInfo: e.target.value })} className="input" rows={3} />
              </div>
              <label className="flex items-center gap-3 text-[13px] text-[#17201C]">
                <input type="checkbox" checked={page.active ?? true} onChange={(e) => setPage({ ...page, active: e.target.checked })} className="h-4 w-4" />
                Sede activa (visible para tus clientes)
              </label>
            </div>
          </section>

          {/* Diseño */}
          <section id="diseno" className="scroll-mt-6 space-y-8">
            <div>
              <h2 className="text-[17px] font-semibold text-[#17201C]">Diseño</h2>
              <p className="mt-0.5 text-[12px] text-[#8D9590]">Lo que cambies aquí se ve en la vista previa y en la página de la sede al guardar.</p>
            </div>
            <div className="max-w-2xl space-y-4">
              <div>
                <label htmlFor="design-title" className="label">Título de la página</label>
                <input id="design-title" value={design.title ?? ''} onChange={(e) => setDesign({ ...design, title: e.target.value })} className="input" />
              </div>
              <div>
                <label htmlFor="design-desc" className="label">Descripción</label>
                <textarea id="design-desc" value={design.description ?? ''} onChange={(e) => setDesign({ ...design, description: e.target.value })} className="input" rows={3} />
              </div>
            </div>
            <div className="max-w-2xl">
              <DesignEditor design={design} onChange={(patch) => setDesign((d) => ({ ...d, ...patch }))} />
            </div>
          </section>

          {/* Cartas y anuncios: solo para sedes existentes */}
          {!isNew && (
            <>
              <section id="cartas" className="scroll-mt-6 max-w-2xl">
                <SedeMenus pageId={Number(id)} />
              </section>
              <section id="anuncios" className="scroll-mt-6 max-w-2xl">
                <SedeAds pageId={Number(id)} />
              </section>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
