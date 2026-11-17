/**
 * Secreto para firmar los tokens de sesión. Debe venir de la variable JWT_SECRET
 * (en desarrollo, del archivo .env). No hay valor por defecto: sin secreto el
 * backend no arranca, porque cualquiera podría firmar tokens válidos.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET no está configurado o es demasiado corto (mínimo 16 caracteres). Revisa el archivo .env.');
  }
  return secret;
}
