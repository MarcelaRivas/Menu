'use client';
import { ErrorAlert, LoadingState } from '@/components/ui-states';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getRestaurant } from '@/lib/session';
import { AdminLayout } from '@/components/admin-layout';
import { DesignEditor, type DesignValues } from '@/components/design-editor';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

type RestaurantDesign = DesignValues & { title: string; description: string };

const DESIGN_KEYS: (keyof RestaurantDesign)[] = [
  'headerType', 'headerValue', 'backgroundMediaId', 'backgroundBrightness', 'title', 'description', 'font', 'fontSize',
  'buttonFillColor', 'buttonFillOpacity', 'buttonTextColor', 'buttonShape', 'buttonSize', 'buttonBorderColor',
  'buttonShadowColor', 'buttonShadowOpacity', 'showIcons',
];

export default function RestaurantSettingsPage() {
  const [restaurant, setRestaurant] = useState<Partial<Restaurant>>({ active: true });
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [design, setDesign] = useState<Partial<RestaurantDesign>>({});
  const [tab, setTab] = useState<'contenido' | 'diseno'>('contenido');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurant()
      .then(async (r0) => {
        const r = r0 as Restaurant | null;
        if (!r) throw new Error('No hay restaurante configurado');
        setRestaurantId(r.id);
        setRestaurant(r);
        const d = await api.get<RestaurantDesign | null>(`/restaurants/${r.id}/design`);
        if (d) setDesign(d);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'No se pudo cargar el restaurante'))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (restaurantId === null) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.put(`/restaurants/${restaurantId}`, {
        name: restaurant.name,
        slug: restaurant.slug,
        active: restaurant.active,
      });
      const payload = Object.fromEntries(DESIGN_KEYS.filter((k) => design[k] !== undefined).map((k) => [k, design[k]]));
      await api.put(`/restaurants/${restaurantId}/design`, payload);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout active="pages">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1>Restaurante</h1>
          <p className="mt-0.5 text-[13px] text-[#8D9590]">Contenido y diseño de la página principal, que lista todas las sedes.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-[12px] text-[#2F7D5B]">Cambios guardados</span>}
          <button type="button" onClick={save} disabled={saving || loading || restaurantId === null} className="btn btn-primary">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-[8px] border border-[#F4C7C3] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#B42318]">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="mb-6 flex gap-2">
            <button type="button" onClick={() => setTab('contenido')} className={`tab ${tab === 'contenido' ? 'active' : ''}`}>Contenido</button>
            <button type="button" onClick={() => setTab('diseno')} className={`tab ${tab === 'diseno' ? 'active' : ''}`}>Diseño</button>
          </div>

          {tab === 'contenido' && (
            <div className="max-w-lg space-y-4">
              <div>
                <label htmlFor="rest-name" className="label">Nombre del restaurante</label>
                <input
                  id="rest-name"
                  value={restaurant.name ?? ''}
                  onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="rest-slug" className="label">Dirección (URL)</label>
                <input
                  id="rest-slug"
                  value={restaurant.slug ?? ''}
                  onChange={(e) => setRestaurant({ ...restaurant, slug: e.target.value.replace(/\s+/g, '') })}
                  className="input"
                  required
                />
                <p className="mt-1 text-[12px] text-[#8D9590]">
                  Cambiarla modifica los enlaces públicos: /{restaurant.slug || 'restaurante'}/sede
                </p>
              </div>
              <label className="flex items-center gap-3 text-[13px] text-[#17201C]">
                <input
                  type="checkbox"
                  checked={restaurant.active ?? true}
                  onChange={(e) => setRestaurant({ ...restaurant, active: e.target.checked })}
                  className="h-4 w-4"
                />
                Restaurante activo
              </label>
            </div>
          )}

          {tab === 'diseno' && (
            <div className="max-w-2xl space-y-10">
              <section className="space-y-4">
                <h3 className="text-[15px] font-semibold text-[#17201C]">Encabezado</h3>
                <div>
                  <label className="label">Título</label>
                  <input value={design.title ?? ''} onChange={(e) => setDesign({ ...design, title: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Descripción</label>
                  <textarea value={design.description ?? ''} onChange={(e) => setDesign({ ...design, description: e.target.value })} className="input" rows={3} />
                </div>
              </section>

              <DesignEditor design={design} onChange={(patch) => setDesign((d) => ({ ...d, ...patch }))} />
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
