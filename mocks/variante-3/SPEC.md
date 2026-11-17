# Variante 3 — "Editorial de club"

Lee primero `../SPEC-COMUN.md` (identidad, modo claro, escritorio y móvil).

**Idea:** tipografía serif grande, esquinas casi rectas, fotos amplias y mucho espacio. Aspecto de club de golf o revista social, siempre en modo claro.
**Sensación:** prestigio, tradición, calma.

## Tokens
- Colores: fondo blanco roto/crema, texto navy, filetes dorados finos. Navy sólido solo en barra superior y botón primario.
- Radios: `--r-1: 2px`, `--r-2: 4px` (tarjetas e imágenes, todas iguales), `--r-3: 9999px` solo en etiquetas.
- Espaciado: 8 / 16 / 32 / 64. Sin sombras: separación por filetes de 1px y espacio.
- Tipografía: titulares `Cormorant Garamond`/Georgia 500–600 (36–64 px, cursiva en subtítulos), texto `Inter`/system 15–16 px, etiquetas en mayúsculas con tracking 0.14em. En móvil titulares 30–38 px.

## Imágenes
- Sede **4:5 vertical** en escritorio (tipo portada), **16:10** en móvil. Categoría: **21:9** a todo el ancho con título bajo la foto (no encima); móvil 16:9. Producto: **1:1** en rejilla, miniatura 96 px en lista. Banner: **2.4:1**.
- Fotos a sangre sin marco; título siempre sobre fondo claro para legibilidad.

## Estructura por pantalla
- Barra superior blanca, marca en mayúsculas espaciadas, filete dorado de 1px debajo.
- Restaurante: titular grande centrado y sedes numeradas (01, 02, 03) como portadas.
- Sede: cartas como líneas de texto grandes con filete y flecha.
- Categorías: bandas anchas con foto 21:9 y título debajo.
- Productos: nombre y precio unidos con línea de puntos, como carta impresa.

## Animación
`280ms cubic-bezier(.25,.1,.25,1)`. Fundido y revelado de foto con máscara breve; sin movimiento en hover salvo cambio de color/subrayado.

## Navegación horizontal
Texto en mayúsculas separado por filetes verticales finos; la activa en navy con subrayado dorado.
