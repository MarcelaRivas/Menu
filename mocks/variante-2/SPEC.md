# Variante 2 — "Clara y aireada"

Lee primero `../SPEC-COMUN.md` (identidad, modo claro, escritorio y móvil).

**Idea:** blanco y crema dominan; el navy se reserva para barra superior, titulares y botón primario. Mucho aire y máxima legibilidad para todas las edades.
**Sensación:** club moderno y tranquilo, luminoso.

## Tokens
- Colores: fondo `--brand-cream`, superficie blanca, texto navy/gris. Dorado solo en filetes finos (1px) y detalles.
- Radios: `--r-1: 6px`, `--r-2: 10px` (tarjetas e imágenes), `--r-3: 9999px` (etiquetas).
- Espaciado: 8 / 16 / 24 / 48. Sin sombras fuertes: borde 1px `#E4DFD3` y sombra `0 1px 3px rgba(11,45,69,.08)`.
- Tipografía: titulares `Cormorant Garamond`/Georgia 600 (misma serif de la app real), texto `Inter`/system. Escala 14 · 16 · 20 · 30 · 48.

## Imágenes
- Sede **3:2**, categoría **1:1 miniatura de 88 px** a la izquierda (lista vertical) o 4:3 en rejilla, producto **4:3**, banner **2:1**. Las fotos van enmarcadas con 6 px de margen blanco dentro de la tarjeta.
- Sin velos oscuros salvo en el banner (degradado inferior suave para legibilidad).

## Estructura por pantalla
- Barra superior blanca con filete navy inferior, logo de iniciales en círculo navy.
- Encabezado alineado a la izquierda con migas de pan (Restaurante › Sede › Carta).
- Restaurante: sedes en rejilla de tarjetas blancas, foto arriba y texto debajo.
- Sede: lista limpia de cartas con filete divisor, sin tarjetas pesadas.
- Categorías: filas blancas con miniatura + nombre + cantidad de platos.
- Productos: precio alineado a la derecha, etiquetas pequeñas de contorno.

## Animación
`200ms ease-out`. Solo fundido y 6 px de desplazamiento; sin efectos en hover más allá de subrayado/borde navy.

## Navegación horizontal
Pestañas de texto con subrayado navy de 2 px bajo la activa; barra pegajosa blanca.
