import { api } from './api';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  restaurantId: number;
}

export interface RestaurantInfo {
  id: number;
  name: string;
  slug: string;
}

/** Usuario guardado al iniciar sesión (o null si no hay sesión). */
export function getUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function hasSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
}

let restaurantPromise: Promise<RestaurantInfo | null> | null = null;

/**
 * Restaurante del usuario actual. Se consulta una vez por carga de página.
 * Así no se escribe un identificador fijo en las altas.
 */
export function getRestaurant(): Promise<RestaurantInfo | null> {
  if (!restaurantPromise) {
    const user = getUser();
    restaurantPromise = api
      .get<RestaurantInfo[]>('/restaurants')
      .then((list) => list.find((r) => r.id === user?.restaurantId) ?? list[0] ?? null)
      .catch(() => null);
  }
  return restaurantPromise;
}

/** Restaurante actual; lanza error si no se puede determinar. */
export async function requireRestaurantId(): Promise<number> {
  const r = await getRestaurant();
  if (!r) throw new Error('No se pudo determinar el restaurante. Vuelve a iniciar sesión.');
  return r.id;
}

export function logout() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    /* almacenamiento no disponible */
  }
  window.location.href = '/admin/login';
}
