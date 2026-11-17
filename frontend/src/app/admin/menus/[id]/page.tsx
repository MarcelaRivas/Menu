'use client';


import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { HistoryView } from '@/components/history-view';
import { ScheduleEditor } from '@/components/schedule-editor';
import { Toggle } from '@/components/toggle';

interface Menu {
  id: number;
  pageId: number;
  name: string;
  type: string;
  visibility: string;
  language: string;
  active: boolean;
  hasSchedule?: boolean;
  deliveryEnabled?: boolean;
  pickupEnabled?: boolean;
  dineInEnabled?: boolean;
}

type ServiceKey = 'deliveryEnabled' | 'pickupEnabled' | 'dineInEnabled';

const SERVICES: { key: ServiceKey; title: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'deliveryEnabled',
    title: 'Domicilios',
    description: 'Lleva tus platos favoritos hasta la puerta de tus clientes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="17" r="2.5" />
        <circle cx="18" cy="17" r="2.5" />
        <path d="M8.5 17h7M5 14l2-6h7l2 6M14 8l-1-3H9" />
      </svg>
    ),
  },
  {
    key: 'pickupEnabled',
    title: 'Para recoger',
    description: 'Permite a tus clientes pedir y recoger sin esperar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="13" rx="1.5" />
        <path d="M9 8V6a3 3 0 016 0v2" />
      </svg>
    ),
  },
  {
    key: 'dineInEnabled',
    title: 'En mesa',
    description: 'Permite a tus clientes pedir desde la mesa',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5h18M12 5v3M7 8a5 5 0 0110 0M12 13v7M9 20h6" />
      </svg>
    ),
  },
];

const ICON = { width: 28, height: 28, viewBox: '0 0 28 28', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const MENU_TYPES: { key: string; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'READ_ONLY',
    label: 'Solo lectura',
    description: 'Antoja al máximo a tus clientes con tu carta dentro y fuera',
    icon: (
      <svg {...ICON} aria-hidden="true">
        <path d="M3 6c3-1.5 6-1.5 8.5.5C14 4.5 17 4.5 20 6v15c-3-1.5-6-1.5-8.5.5C9 19.5 6 19.5 3 21V6z" />
        <path d="M11.5 6.5V21" />
        <path d="M22 4l-6 6" />
        <path d="M19 3l3 3" />
      </svg>
    ),
  },
  {
    key: 'ORDER',
    label: 'Recibir pedidos',
    description: 'Permite a tus clientes ordenar para entrega a domicilio o recoger',
    icon: (
      <svg {...ICON} aria-hidden="true">
        <path d="M4 19h20" />
        <path d="M6 19a8 8 0 0116 0" />
        <path d="M14 7v2" />
      </svg>
    ),
  },
  {
    key: 'FOOD_COURT',
    label: 'Plazoleta',
    description: 'Reúne varias marcas en un solo espacio',
    icon: (
      <svg {...ICON} aria-hidden="true">
        <circle cx="9" cy="9" r="3" />
        <circle cx="19" cy="9" r="3" />
        <circle cx="14" cy="19" r="3" />
      </svg>
    ),
  },
];

export default function MenuEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const isNew = !id || id === 'new';

  const [menu, setMenu] = useState<Partial<Menu>>({ active: true, visibility: 'VISIBLE', type: 'READ_ONLY', language: 'es' });
  const [pages, setPages] = useState<{ id: number; name: string }[]>([]);
  const [menus, setMenus] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ id: number; name: string }[]>('/pages').then(setPages);
    api.get<{ id: number; name: string }[]>('/menus').then(setMenus);
    if (!isNew) {
      api.get<Menu>(`/menus/${id}`).then(setMenu);
    } else {
      // Carta nueva creada desde una sede: llega con ?pageId=… y queda asignada a esa sede.
      const pageId = Number(new URLSearchParams(window.location.search).get('pageId'));
      if (pageId) setMenu((m) => ({ ...m, pageId }));
    }
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/menus', {
          pageId: menu.pageId!,
          name: menu.name!,
          type: menu.type,
          visibility: menu.visibility,
          language: menu.language,
        });
      } else {
        await api.put(`/menus/${id}`, {
          name: menu.name,
          type: menu.type,
          visibility: menu.visibility,
          language: menu.language,
          active: menu.active,
          hasSchedule: menu.hasSchedule,
          deliveryEnabled: menu.deliveryEnabled,
          pickupEnabled: menu.pickupEnabled,
          dineInEnabled: menu.dineInEnabled,
        });
      }
      toast.success('Carta guardada');
      router.push('/admin/menus');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout active="menus">
      <div className="flex items-center justify-between mb-6">
        <h1>{isNew ? 'Nueva Carta' : 'Editar Carta'}</h1>
        <div className="space-x-3">
          <a href="/admin/menus" className="btn btn-secondary">Cancelar</a>
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="max-w-lg space-y-4">
        {isNew && (
          <div>
            <label className="label">Sede</label>
            <select value={String(menu.pageId ?? '')} onChange={(e) => setMenu({ ...menu, pageId: Number(e.target.value) })} className="input" required>
              <option value="">Seleccionar sede...</option>
              {pages.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="label">Nombre de la carta</label>
          <input value={menu.name ?? ''} onChange={(e) => setMenu({ ...menu, name: e.target.value })} className="input" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Visibilidad</label>
            <select value={menu.visibility ?? 'VISIBLE'} onChange={(e) => setMenu({ ...menu, visibility: e.target.value })} className="input">
              <option value="VISIBLE">Visible</option>
              <option value="HIDDEN">Oculto</option>
            </select>
          </div>
          <div>
            <label className="label">Idioma</label>
            <select value={menu.language ?? 'es'} onChange={(e) => setMenu({ ...menu, language: e.target.value })} className="input">
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
              <option value="fr">Francés</option>
            </select>
          </div>
        </div>

        <div>
          <span className="block text-[13px] font-semibold text-[#17201C] mb-2.5">Tipo de menú</span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MENU_TYPES.map((t) => {
              const selected = (menu.type ?? 'READ_ONLY') === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMenu({ ...menu, type: t.key })}
                  className={`flex flex-col items-start gap-2 rounded-[12px] border-2 p-4 text-left transition-colors ${
                    selected ? 'border-[#0B2E25] bg-[#F2F6F4]' : 'border-[#D9DDD7] bg-white hover:border-[#B5BBB6]'
                  }`}
                >
                  <span className="text-[#17201C]">{t.icon}</span>
                  <span className="text-[14px] font-semibold text-[#17201C]">{t.label}</span>
                  <span className="text-[12px] leading-relaxed text-[#8D9590]">{t.description}</span>
                </button>
              );
            })}
          </div>

          {menu.type === 'ORDER' && (
            <div className="mt-5 divide-y divide-[#EFF0EC] border-t border-[#EFF0EC]">
              {SERVICES.map((s) => {
                const on = !!menu[s.key];
                return (
                  <div key={s.key} className="flex items-center gap-3 py-3">
                    <span className="flex-shrink-0 text-[#17201C]">{s.icon}</span>
                    <p className="min-w-0 flex-1 text-[14px] text-[#17201C]">
                      <span className="font-semibold">{s.title}</span>
                      <span className="text-[#4F5752]"> - {s.description}</span>
                    </p>
                    <Toggle
                      label={s.title}
                      hideLabel
                      checked={on}
                      onChange={(v) => setMenu({ ...menu, [s.key]: v })}
                    />
                    <button
                      type="button"
                      disabled
                      title="Configuración próximamente"
                      aria-label={`Configurar ${s.title}`}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] text-[#8D9590] opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 border-t border-[#EFF0EC]">
            <Toggle
              label="Horarios"
              checked={!!menu.hasSchedule}
              onChange={(v) => setMenu({ ...menu, hasSchedule: v })}
            />
            {menu.hasSchedule && !isNew && (
              <div className="pb-2 pt-1">
                <ScheduleEditor entityType="MENU" entityId={Number(id)} />
              </div>
            )}
          </div>
        </div>

        {!isNew && (
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={menu.active ?? true} onChange={(e) => setMenu({ ...menu, active: e.target.checked })} className="w-5 h-5" />
            <label className="text-sm font-medium">Carta activa</label>
          </div>
        )}

        {!isNew && (
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold mb-2">Acciones</h3>
            <button onClick={async () => { await api.post(`/menus/${id}/duplicate`, {}); router.push('/admin/menus'); }} className="btn btn-secondary">
              Duplicar carta
            </button>
          </div>
        )}

        {!isNew && (
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold">Reemplazar / Sincronizar</h3>
            <p className="text-xs text-[#8D9590]">Selecciona una carta para reemplazar esta. La carta destino perderá todo su contenido.</p>
            <select id="replaceSource" className="input text-sm">
              <option value="">Seleccionar carta origen...</option>
              {menus.filter((m) => m.id !== Number(id)).map((m) => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
            </select>
            <button onClick={async () => {
              const sel = document.getElementById('replaceSource') as HTMLSelectElement;
              const sourceId = Number(sel.value);
              if (!sourceId || !window.confirm('Esta acción reemplazará todo el contenido de esta carta con el de la carta seleccionada. ¿Continuar?')) return;
              if (!window.confirm('Confirmación final: los productos, categorías y configuración actuales se perderán.')) return;
              await api.post(`/menus/${id}/replace`, { sourceId });
              router.push('/admin/menus');
            }} className="btn btn-secondary text-[#B42318] border-[#F4C7C3]">
              Reemplazar carta
            </button>
          </div>
        )}

        {!isNew && <div className="mt-6 space-y-3">
          <a href={`/admin/menus/${id}/categories`} className="block px-4 py-3 border rounded-lg text-center text-[#166B4D] font-medium">Gestionar Categorías →</a>
        </div>}

        {!isNew && <div className="mt-4 space-y-3">
          <HistoryView entityType="menu" entityId={Number(id)} />
        </div>}
      </div>
    </AdminLayout>
  );
}
