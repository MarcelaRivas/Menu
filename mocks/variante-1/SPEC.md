# Variante 1 — "Clásica refinada" (evolución de lo actual)

Lee primero `../SPEC-COMUN.md` (identidad, modo claro, escritorio y móvil).

**Idea:** lo actual, ordenado con un único sistema. Es la variante de referencia: las otras se comparan contra ella.
**Sensación:** club tradicional, cálido y formal.

## Tokens
- Colores: paleta común. Fondo de pantalla: crema con foto de la sede en el encabezado (no a pantalla completa).
- Radios: `--r-1: 8px` (botones, chips), `--r-2: 14px` (todas las tarjetas e imágenes), `--r-3: 9999px` (volver, etiquetas).
- Espaciado: 8 / 16 / 24 / 40. Borde 1px `--brand-gold` al 40 % en tarjetas.
- Tipografía: titulares `Cormorant Garamond`/Georgia, texto `Inter`/system. Escala 14 · 16 · 20 · 28 · 44 (móvil 14 · 16 · 18 · 24 · 32).

## Imágenes
- Sede **16:6**, categoría **3:1** (panorámica, degradado a `--brand-blue` desde la derecha, texto a la derecha), producto **4:3**, banner **16:7**. En móvil la categoría pasa a **2.4:1**.

## Estructura por pantalla
- Barra superior navy con filete dorado y logo de iniciales.
- Encabezado centrado con divisor dorado.
- Restaurante: tarjetas crema con foto arriba, nombre y botón "Ver carta".
- Sede: filas-tarjeta con insignia verde de icono.
- Categorías: tarjetas panorámicas con foto que se funde al azul.

## Animación
`240ms cubic-bezier(.2,.7,.2,1)`. Fundido + 8 px de desplazamiento; elevación de 2 px en hover.

## Navegación horizontal
Chips con borde dorado; el activo relleno navy con texto crema.
