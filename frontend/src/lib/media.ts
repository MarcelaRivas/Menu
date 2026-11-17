const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
export const API_ORIGIN = API.replace(/\/api\/v1\/?$/, '');
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export interface MediaRef {
  id: number;
  url: string;
}

/** URL absoluta de un archivo servido por el backend. */
export function mediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
}

/** Valida y sube una imagen a /media/upload. Lanza Error con mensaje legible. */
export async function uploadImage(file: File): Promise<MediaRef> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG o WebP.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('La imagen supera los 2 MB.');
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const body = new FormData();
  body.append('files', file);
  const res = await fetch(`${API}/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) throw new Error('No se pudo subir la imagen');
  const [media] = (await res.json()) as MediaRef[];
  return media;
}

