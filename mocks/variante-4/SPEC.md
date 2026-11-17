# Variante 4 — "Sobre foto, paneles sólidos"

Lee primero `../SPEC-COMUN.md` (identidad, modo claro, escritorio y móvil).

**Idea:** como lo actual, la foto de la sede da ambiente, pero el contenido va en paneles **sólidos claros** (sin desenfoque ni transparencia), así se lee bien en cualquier celular.
**Sensación:** acogedora y atmosférica, aún formal.

## Tokens
- Colores: foto de la sede arriba (franja de 240–320 px en escritorio, 180 px en móvil) con velo navy al 35 %; **el resto de la pantalla es crema**. Paneles blancos/crema con borde 1px dorado al 40 %.
- Radios: `--r-1: 8px`, `--r-2: 16px` (paneles, fotos), `--r-3: 9999px`. Los paneles se solapan con la franja de foto (margen negativo de 40 px).
- Espaciado: 8 / 16 / 24 / 32. Sombra única: `0 8px 24px rgba(11,45,69,.12)`.
- Tipografía: titulares `Cormorant Garamond`/Georgia 600 en blanco sobre la franja de foto, texto `Inter`/system en los paneles. Escala 14 · 16 · 20 · 28 · 40.

## Imágenes
- Franja de cabecera 16:5 (móvil 16:7). Sede en tarjeta **2:1**; categoría **5:2** con franja de texto sólida inferior en navy; producto **4:3**; banner **16:7**.
- Al cambiar de pantalla, la foto de cabecera hace fundido cruzado (400 ms).

## Estructura por pantalla
- Barra superior navy con filete dorado.
- Cabecera con foto y título en blanco; contenido solapado debajo en paneles.
- Restaurante: sedes como paneles con foto.
- Sede: cartas como paneles alargados.
- Categorías: paneles 5:2 con franja navy y flecha.
- Productos: tarjetas claras; precio en píldora crema con borde dorado.

## Animación
`260ms cubic-bezier(.22,1,.36,1)`. Los paneles suben 12 px con fundido; la foto de cabecera tiene zoom leve 1.00→1.03 al entrar.

## Navegación horizontal
Barra segmentada blanca sobre el borde inferior de la cabecera, con deslizador navy animado que se mueve entre opciones.
