# Variante 5 — "Contemporánea sobria"

Lee primero `../SPEC-COMUN.md` (identidad, modo claro, escritorio y móvil).

**Idea:** el contraste "moderno": tarjetas limpias de radio medio, jerarquía muy clara, pero con la paleta del club. Sirve para decidir si conviene modernizar sin perder seriedad.
**Sensación:** profesional, ordenada, eficiente (no una app de domicilios).

## Tokens
- Colores: fondo `#F4F2EC` (crema fría), superficie blanca, navy como único color fuerte, dorado solo en el indicador activo y detalles de 2 px.
- Radios: `--r-1: 8px`, `--r-2: 12px` (tarjetas e imágenes), `--r-3: 9999px`. Radio de fotos dentro de tarjeta = `--r-2` menos el padding interior.
- Espaciado: 4 / 8 / 16 / 24 / 32. Borde 1px `#E4DFD3`, sombra mínima `0 1px 2px rgba(11,45,69,.06)`.
- Tipografía: serif `Cormorant Garamond` 600–700 para todos los titulares, nombres y precios (obligatorio, ver común); `Inter`/system 400/600 para descripciones, etiquetas y botones. Aquí la serif se usa en tamaños más compactos y con más peso que en otras variantes, para el aire "contemporáneo". Escala 14 · 16 · 20 · 26 · 36.

## Imágenes
- Sede **16:9**, categoría **4:3** en rejilla o **96×72** en fila, producto **1:1** en rejilla o miniatura 88 px en lista, banner **16:9**.

## Estructura por pantalla
- Barra superior blanca compacta con logo de iniciales, marca en serif y botón volver.
- Restaurante y sede: tarjetas blancas con foto y datos; botón "Ver carta" con el estilo del toggle.
- Categorías: filas con miniatura, nombre, número de platos y chevron.
- Productos: tarjetas con etiquetas de color apagado; precio destacado a la derecha.
- En móvil: barra inferior fija con los 4 pasos del flujo como atajo.

## Animación
`180ms ease-out`. Solo fundido y desplazamiento de 4 px; el estado presionado reduce a `scale(.99)`.

## Navegación horizontal
Chips rectangulares de radio `--r-1` con scroll-snap; el activo con relleno navy y texto blanco.
